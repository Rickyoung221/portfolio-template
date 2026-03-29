"use client";
import React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { parseBlob } from "music-metadata";
import { SiNeteasecloudmusic } from "react-icons/si";
import { MdQueueMusic, MdLyrics } from "react-icons/md";
import { CiMaximize1, CiMinimize1 } from "react-icons/ci";
import Controls from "./Controls";
import AlbumCover from "./AlbumCover";
import ProgressControl from "./ProgressControl";
import LoadingState from "./LoadingState";
import { formatTime, getVolumeIcon } from "./utils";
import { useMusicSource } from "./hooks/useMusicSource";
import { usePlaylistCache } from "./hooks/usePlaylistCache";
import { NeteaseMusicSource } from "./services/NeteaseMusicSource";
import PlaylistView from "./PlaylistView";
import { useAudioPreload } from "./hooks/useAudioPreload";
import LyricView from "./LyricView";
import { useLyricCache } from "./hooks/useLyricCache";

const MUSIC_PLAYER_MINIMIZED_KEY = "portfolioMusicPlayerMinimized";

const DEFAULT_NETEASE_PLAYLIST_ID =
  process.env.NEXT_PUBLIC_NETEASE_PLAYLIST_ID ?? "13583418396";

export function MusicPlayerProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentCover, setCurrentCover] = useState(null);
  const [playlistId, setPlaylistId] = useState(DEFAULT_NETEASE_PLAYLIST_ID);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [currentTrackUrl, setCurrentTrackUrl] = useState(""); // Store current track URL
  const [audioQuality, setAudioQuality] = useState("lite"); // 先 64k，接口侧失败会升到 standard
  const [playlistInfo, setPlaylistInfo] = useState(null); // Playlist info state
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false); // 控制歌词显示
  const [preloadedTracks, setPreloadedTracks] = useState(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const [minimizedHydrated, setMinimizedHydrated] = useState(false);

  const audioRef = useRef(null);
  const autoplayUrlRef = useRef("");
  const { isDarkMode } = useTheme();
  const { playlist, isLoading, loadMetadata, switchSource, registerSource } =
    useMusicSource();
  const { preloadNextAudio, clearPreload, preloadedTrackId } =
    useAudioPreload();
  const {
    preloadLyrics,
    getLyrics,
    findLyricIndex,
    lyricPendingById,
    hasCache: hasLyricCache,
  } = useLyricCache();

  // Function to safely get current track
  const getCurrentTrack = () => {
    if (
      !playlist ||
      !playlist.length ||
      currentTrackIndex < 0 ||
      currentTrackIndex >= playlist.length
    ) {
      return null;
    }
    return playlist[currentTrackIndex];
  };

  const playlistIdsKey = useMemo(
    () => (playlist?.length ? playlist.map((t) => t.id).join(",") : ""),
    [playlist],
  );

  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  // 仅用 playlistId 初始化，避免 mount 时 [] 与 [playlistId] 两次 switchSource 导致重复 loadPlaylist、playlist 引用抖动
  // 每个 URL 只自动播一次，避免 error 后 isPlaying 变 false 又对同一失败地址反复 toggle
  useEffect(() => {
    if (!isInitialized || !currentTrackUrl || !audioRef.current || isPlaying) {
      return;
    }
    if (autoplayUrlRef.current === currentTrackUrl) return;
    autoplayUrlRef.current = currentTrackUrl;
    const timer = setTimeout(() => {
      togglePlay();
    }, 800);
    return () => clearTimeout(timer);
  }, [isInitialized, currentTrackUrl, isPlaying]);

  useEffect(() => {
    let cancelled = false;
    setIsInitialized(false);
    (async () => {
      try {
        const neteaseSource = new NeteaseMusicSource(playlistId);
        registerSource("netease", neteaseSource);
        await switchSource("netease");
        if (!cancelled) setIsInitialized(true);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to initialize player");
          setIsInitialized(false);
        }
      }
    })();
    setCurrentTrackIndex(0);
    autoplayUrlRef.current = "";
    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  // Ensure currentTrackIndex is always valid
  useEffect(() => {
    if (playlist && playlist.length > 0) {
      if (currentTrackIndex >= playlist.length) {
        setCurrentTrackIndex(0);
      }
    } else if (currentTrackIndex !== 0) {
      setCurrentTrackIndex(0);
    }
  }, [playlist, currentTrackIndex]);

  // Extract metadata from MP3 file (including cover)
  const extractMetadata = async (trackIndex) => {
    try {
      if (
        !playlist ||
        !playlist.length ||
        trackIndex === undefined ||
        !playlist[trackIndex]
      ) {
        return null;
      }

      const currentTrackId = playlist[trackIndex].id;
      const metadata = await loadMetadata(currentTrackId);

      // 验证返回的元数据是否匹配当前歌曲（接口 id 常为 number）
      if (metadata && String(metadata.id) === String(currentTrackId)) {
        if (metadata.cover) {
          setCurrentCover(metadata.cover);
        } else if (playlist[trackIndex].album?.picUrl) {
          setCurrentCover(playlist[trackIndex].album.picUrl);
        } else {
          setCurrentCover(null);
        }
        return metadata;
      } else {
        console.warn("元数据不匹配当前歌曲，使用播放列表数据");
        // 使用播放列表中的数据作为备选
        setCurrentCover(playlist[trackIndex].album?.picUrl || null);
        return {
          id: currentTrackId,
          title: playlist[trackIndex].name,
          artist: playlist[trackIndex].artists?.[0]?.name || "未知歌手",
          album: playlist[trackIndex].album?.name || "未知专辑",
          cover: playlist[trackIndex].album?.picUrl || null,
          duration: playlist[trackIndex].duration || 0,
        };
      }
    } catch (error) {
      console.error("获取元数据失败:", error);
      setCurrentCover(null);
      return null;
    }
  };

  // Get and set current track URL
  const loadCurrentTrackUrl = async (trackIndex) => {
    if (
      !playlist ||
      !playlist.length ||
      trackIndex === undefined ||
      !playlist[trackIndex]
    ) {
      return;
    }

    try {
      setCurrentTrackUrl("");

      const proxyUrl = `/api/netease/song/url?id=${playlist[trackIndex].id}&level=${audioQuality}`;
      setCurrentTrackUrl(proxyUrl);
    } catch (error) {
      setCurrentTrackUrl("");
    }
  };

  // 依赖 playlistIdsKey 而非 playlist 引用，避免缓存 parse 新数组导致重复拉元数据
  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    let retryTimer = null;
    const maxRetries = 3;
    const initialDelay = 1000;

    const loadTrackData = async () => {
      if (cancelled) return;
      try {
        if (
          !isLoading &&
          playlist &&
          playlist.length > 0 &&
          currentTrackIndex >= 0 &&
          currentTrackIndex < playlist.length
        ) {
          if (!currentTrackUrl && retryCount === 0) {
            await new Promise((resolve) => setTimeout(resolve, initialDelay));
          }
          if (cancelled) return;

          const metadata = await extractMetadata(currentTrackIndex);
          if (cancelled) return;

          if (!metadata && retryCount < maxRetries) {
            retryCount += 1;
            retryTimer = setTimeout(loadTrackData, 1000 * retryCount);
            return;
          }

          await loadCurrentTrackUrl(currentTrackIndex);
        }
      } catch (error) {
        if (cancelled) return;
        if (retryCount < maxRetries) {
          retryCount += 1;
          retryTimer = setTimeout(loadTrackData, 1000 * retryCount);
        } else {
          console.warn("Failed to load track data after retries:", error);
        }
      }
    };

    loadTrackData();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [currentTrackIndex, playlistIdsKey, isLoading, audioQuality]);

  // Handle playlist ID change
  const handlePlaylistIdChange = (e) => {
    if (e.key === "Enter" && e.target.value) {
      setPlaylistId(e.target.value);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !currentTrackUrl) {
      return;
    }

    if (audioRef.current.paused) {
      setTimeout(() => {
        audioRef.current.play().catch(() => {
          audioRef.current.load();
          setTimeout(() => {
            audioRef.current.play().catch(() => {
              setIsPlaying(false);
            });
          }, 1000);
        });
      }, 500);
    } else {
      audioRef.current.pause();
    }
    setIsPlaying((prev) => !prev);
  };

  // Switch to next track
  const playNext = () => {
    if (!playlist || playlist.length === 0) {
      return;
    }
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  // Switch to previous track
  const playPrevious = () => {
    if (!playlist || playlist.length === 0) {
      return;
    }
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === 0 ? playlist.length - 1 : prevIndex - 1,
    );
  };

  // Handle time update
  const handleTimeChange = (e) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Handle volume update
  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    const vol = Math.min(Math.max(parseFloat(e.target.value), 0), 1);
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  // When playlist loads, extract playlist info（依赖 playlistIdsKey，避免后台刷新仅替换数组引用时反复打 playlist 接口）
  useEffect(() => {
    if (isLoading || !playlistIdsKey) return;
    const pl = playlistRef.current;
    if (!pl?.length) return;

    const fetchPlaylistInfo = async () => {
      try {
        const response = await fetch(`/api/netease/playlist?id=${playlistId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.result) {
            setPlaylistInfo({
              name: data.result.name || "Unknown Playlist",
              description: data.result.description || "",
              trackCount: data.result.trackCount || pl.length,
              creator: data.result.creator?.nickname || "Unknown User",
              coverImgUrl: data.result.coverImgUrl,
            });
            return;
          }
        }

        setPlaylistInfo({
          name: "Playlist " + playlistId,
          trackCount: pl.length,
          description: "",
        });
      } catch (error) {
        setPlaylistInfo({
          name: "Playlist " + playlistId,
          trackCount: pl.length,
          description: "",
        });
      }
    };

    fetchPlaylistInfo();
  }, [playlistIdsKey, isLoading, playlistId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (isPlaying) {
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      playNext();
    };

    const handleError = () => {
      setIsPlaying(false);
      // 不再自动切下一首：无版权时 API 已返回 404，自动切歌会在整列表上循环
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrackIndex, isPlaying, playlist.length]);

  // Handle track selection from playlist
  const handleTrackSelect = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  // 在当前歌曲加载完成后预加载下一首（依赖 playlistIdsKey，避免歌单引用抖动重复拉下一首 URL）
  useEffect(() => {
    const pl = playlistRef.current;
    if (duration > 0 && pl && pl.length > 1) {
      const nextIndex = (currentTrackIndex + 1) % pl.length;
      const nextTrackId = pl[nextIndex].id;

      if (String(nextTrackId) !== String(preloadedTrackId ?? "")) {
        preloadNextAudio(nextTrackId, audioQuality);
      }
    }
  }, [
    duration,
    currentTrackIndex,
    playlistIdsKey,
    preloadedTrackId,
    audioQuality,
  ]);

  // 切换播放列表时清理预加载
  useEffect(() => {
    clearPreload();
  }, [playlistId]);

  // Toggle lyrics display
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  const applyMinimized = (value) => {
    setIsMinimized(value);
    if (value) {
      setShowPlaylist(false);
      setShowLyrics(false);
      setShowSourceSelector(false);
    }
  };

  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        window.localStorage.getItem(MUSIC_PLAYER_MINIMIZED_KEY) === "1"
      ) {
        setIsMinimized(true);
      }
    } catch {
      /* ignore */
    }
    setMinimizedHydrated(true);
  }, []);

  useEffect(() => {
    if (!minimizedHydrated) return;
    try {
      window.localStorage.setItem(
        MUSIC_PLAYER_MINIMIZED_KEY,
        isMinimized ? "1" : "0",
      );
    } catch {
      /* ignore */
    }
  }, [isMinimized, minimizedHydrated]);

  // Handle lyrics seek
  const handleLyricSeek = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // 当歌曲变化时预加载歌词（当前 + 下一首；依赖 playlistIdsKey 避免歌单引用抖动重复请求）
  useEffect(() => {
    if (isLoading || !playlistIdsKey || currentTrackIndex < 0) return;
    const pl = playlistRef.current;
    if (!pl?.length) return;

    const currentTrack = pl[currentTrackIndex];
    if (!currentTrack?.id) return;

    preloadLyrics(currentTrack.id);

    if (pl.length > 1) {
      const nextIndex = (currentTrackIndex + 1) % pl.length;
      const nextTrack = pl[nextIndex];
      if (nextTrack?.id) {
        preloadLyrics(nextTrack.id);
      }
    }
  }, [currentTrackIndex, playlistIdsKey, isLoading, preloadLyrics]);

  const EmptyPlaylist = ({ isDarkMode }) => (
    <div
      className={`flex flex-col items-center justify-center h-16 space-y-2 ${
        isDarkMode ? "text-[#839496]" : "text-[#657b83]"
      }`}
    >
      <span className="text-sm">No songs in playlist</span>
      <span className="text-xs opacity-75">Please try another playlist ID</span>
    </div>
  );

  const ErrorState = ({ isDarkMode, message }) => (
    <div
      className={`flex flex-col items-center justify-center h-16 space-y-2 ${
        isDarkMode ? "text-[#839496]" : "text-[#657b83]"
      }`}
    >
      <span className="text-sm">Failed to load playlist</span>
      <span className="text-xs opacity-75">
        {message || "Please try again later"}
      </span>
    </div>
  );

  const activeTrack = getCurrentTrack();

  const canPlay =
    isInitialized && !isLoading && !error && playlist && playlist.length > 0;

  return (
    <>
      {children}
      <div className="fixed inset-x-0 bottom-0 flex justify-center items-center pb-1 md:pb-8 z-50 pointer-events-none">
        <div
          className={`relative ${
            canPlay && isMinimized
              ? "w-80 max-w-[92vw] shrink-0"
              : "w-[75%] md:w-[600px] max-w-[650px]"
          }`}
        >
          {/* LyricView component - positioned above the player */}
          {!isMinimized && !isLoading && playlist && playlist.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 flex justify-center w-full mb-8 px-2 md:px-0">
              <div
                style={{ width: "100%", maxWidth: "750px", margin: "0 auto" }}
              >
                <LyricView
                  isDarkMode={isDarkMode}
                  currentTrackId={activeTrack?.id}
                  fallbackTitle={activeTrack?.name}
                  fallbackArtist={activeTrack?.artists?.[0]?.name}
                  currentTime={currentTime}
                  isVisible={showLyrics && !isMinimized}
                  onClose={() => setShowLyrics(false)}
                  onSeek={handleLyricSeek}
                  albumCover={currentCover}
                  getLyrics={getLyrics}
                  preloadLyrics={preloadLyrics}
                  findLyricIndex={findLyricIndex}
                  lyricLoading={
                    !!(
                      activeTrack?.id &&
                      lyricPendingById[String(activeTrack.id)]
                    )
                  }
                  hasLyricCache={hasLyricCache}
                />
              </div>
            </div>
          )}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`relative pointer-events-auto w-full backdrop-blur-md rounded-lg md:rounded-2xl shadow-lg border
                   ${isMinimized && canPlay ? "p-2 sm:p-2.5" : "p-1.5 md:p-4"}
                   ${
                     isDarkMode
                       ? "bg-[#073642]/80 border-[#586e75]"
                       : "bg-[#eee8d5]/80 border-[#93a1a1]"
                   }`}
          >
            {/* Add playlist view */}
            {showPlaylist &&
              !isMinimized &&
              !isLoading &&
              playlist &&
              playlist.length > 0 && (
                <PlaylistView
                  isDarkMode={isDarkMode}
                  playlist={playlist}
                  currentTrackIndex={currentTrackIndex}
                  onTrackSelect={handleTrackSelect}
                  onClose={() => setShowPlaylist(false)}
                />
              )}

            {!isMinimized && (
              <div
                className={`flex justify-between items-center mb-2 ${
                  canPlay ? "pr-10 sm:pr-11" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowSourceSelector(!showSourceSelector)}
                    className={`text-xs px-2 py-1 rounded-md hidden sm:block ${
                      isDarkMode
                        ? "bg-[#002b36] text-[#839496]"
                        : "bg-[#fdf6e3] text-[#657b83]"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <SiNeteasecloudmusic className="w-3 h-3" />
                      <span>Netease Music</span>
                    </div>
                  </button>

                  {/* Display playlist name and track count */}
                  {playlistInfo && (
                    <div
                      className={`text-xs hidden sm:block ${
                        isDarkMode ? "text-[#93a1a1]" : "text-[#586e75]"
                      }`}
                    >
                      {playlistInfo.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Lyrics button - Updated for better visibility */}
                  {!isLoading && playlist && playlist.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleLyrics}
                      className={`text-xs px-2 py-1.5 rounded-md flex items-center gap-1 transition-colors ${
                        isDarkMode
                          ? showLyrics
                            ? "bg-[#073642] text-[#93a1a1]"
                            : "hover:bg-[#073642] text-[#839496] bg-[#002b36]"
                          : showLyrics
                            ? "bg-[#eee8d5] text-[#586e75]"
                            : "hover:bg-[#eee8d5] text-[#657b83] bg-[#fdf6e3]"
                      }`}
                      aria-label="Show lyrics"
                    >
                      <div className="flex items-center gap-1">
                        <MdLyrics className="w-4 h-4" />
                        <span className="hidden sm:inline">Lyrics</span>
                      </div>
                    </button>
                  )}

                  {/* Playlist button and track counter combined */}
                  {!isLoading && playlist && playlist.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPlaylist(!showPlaylist)}
                      className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                        isDarkMode
                          ? showPlaylist
                            ? "bg-[#073642] text-[#93a1a1]"
                            : "hover:bg-[#073642] text-[#839496] bg-[#002b36]"
                          : showPlaylist
                            ? "bg-[#eee8d5] text-[#586e75]"
                            : "hover:bg-[#eee8d5] text-[#657b83] bg-[#fdf6e3]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <MdQueueMusic className="w-4 h-4" />
                        <span className="hidden sm:inline">Playlist</span>
                      </div>
                      <span className="opacity-75">
                        {currentTrackIndex + 1}/{playlist.length}
                      </span>
                    </button>
                  )}
                </div>

                {/* Source selector popup */}
                {showSourceSelector && (
                  <div
                    className={`absolute top-0 transform -translate-y-full mt-[-8px] z-10 rounded-md shadow-lg p-2 hidden sm:block ${
                      isDarkMode
                        ? "bg-[#002b36] text-[#839496]"
                        : "bg-[#fdf6e3] text-[#657b83]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="mt-2">
                        <div className="text-xs mb-2 opacity-80">
                          Enter your Netease Cloud Music playlist ID
                          <div className="text-[10px] mt-1 opacity-60">
                            (You can find it in the playlist URL:
                            music.163.com/playlist?id=...)
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter Playlist ID"
                            defaultValue={playlistId}
                            onKeyPress={handlePlaylistIdChange}
                            className={`text-xs flex-1 px-2 py-1.5 rounded-md outline-none border ${
                              isDarkMode
                                ? "bg-[#073642] text-[#839496] border-[#586e75] focus:border-[#839496]"
                                : "bg-[#eee8d5] text-[#657b83] border-[#93a1a1] focus:border-[#657b83]"
                            }`}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector(
                                'input[placeholder="Enter Playlist ID"]',
                              );
                              if (input && input.value) {
                                setPlaylistId(input.value);
                                setShowSourceSelector(false);
                              }
                            }}
                            className={`text-xs px-4 py-1.5 rounded-md transition-colors ${
                              isDarkMode
                                ? "bg-[#268bd2] hover:bg-[#2aa198] text-[#fdf6e3]"
                                : "bg-[#268bd2] hover:bg-[#2aa198] text-[#fdf6e3]"
                            }`}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {canPlay && !isMinimized && (
              <button
                type="button"
                onClick={() => applyMinimized(true)}
                className={`absolute top-2 right-2 z-20 p-1.5 rounded-lg transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#268bd2] focus-visible:ring-offset-2
                dark:focus-visible:ring-[#2aa198] dark:focus-visible:ring-offset-[#073642]
                ${
                  isDarkMode
                    ? "text-[#93a1a1] hover:text-[#eee8d5] hover:bg-[#002b36]/90"
                    : "text-[#586e75] hover:text-[#002b36] hover:bg-[#fdf6e3]/90"
                }`}
                aria-label="Minimize music player"
                title="Minimize player"
              >
                <CiMinimize1 className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              </button>
            )}

            {!isInitialized || isLoading ? (
              <LoadingState isDarkMode={isDarkMode} />
            ) : error ? (
              <ErrorState isDarkMode={isDarkMode} message={error} />
            ) : !playlist || playlist.length === 0 ? (
              <EmptyPlaylist isDarkMode={isDarkMode} />
            ) : (
              <>
                <audio
                  ref={audioRef}
                  src={currentTrackUrl}
                  preload="auto"
                  crossOrigin="anonymous"
                />

                {isMinimized ? (
                  <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => applyMinimized(false)}
                      className={`shrink-0 p-2 rounded-xl border-2 transition-colors ${
                        isDarkMode
                          ? "border-[#586e75] hover:border-[#93a1a1] text-[#93a1a1]"
                          : "border-[#93a1a1] hover:border-[#586e75] text-[#586e75]"
                      }`}
                      aria-label="Expand music player"
                    >
                      <CiMaximize1 className="w-5 h-5" />
                    </button>
                    {currentCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentCover}
                        alt=""
                        width={44}
                        height={44}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg shrink-0 ${
                          isDarkMode ? "bg-[#002b36]" : "bg-[#fdf6e3]"
                        }`}
                        aria-hidden
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isDarkMode ? "text-[#eee8d5]" : "text-[#002b36]"
                        }`}
                      >
                        {getCurrentTrack()?.name || "—"}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs truncate opacity-80 ${
                          isDarkMode ? "text-[#93a1a1]" : "text-[#586e75]"
                        }`}
                      >
                        {getCurrentTrack()?.artists?.[0]?.name ||
                          "Unknown Artist"}
                      </p>
                    </div>
                    <Controls
                      compact
                      isDarkMode={isDarkMode}
                      isPlaying={isPlaying}
                      onPlayPrevious={playPrevious}
                      onTogglePlay={togglePlay}
                      onPlayNext={playNext}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4">
                    <AlbumCover
                      currentCover={currentCover}
                      isDarkMode={isDarkMode}
                      isPlaying={isPlaying}
                    />

                    <ProgressControl
                      isDarkMode={isDarkMode}
                      currentTime={currentTime}
                      duration={duration}
                      volume={volume}
                      title={getCurrentTrack()?.name || "Loading..."}
                      artist={
                        getCurrentTrack()?.artists?.[0]?.name ||
                        "Unknown Artist"
                      }
                      onTimeChange={handleTimeChange}
                      onVolumeChange={handleVolumeChange}
                      formatTime={formatTime}
                      getVolumeIcon={getVolumeIcon}
                    />

                    <Controls
                      isDarkMode={isDarkMode}
                      isPlaying={isPlaying}
                      onPlayPrevious={playPrevious}
                      onTogglePlay={togglePlay}
                      onPlayNext={playNext}
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
