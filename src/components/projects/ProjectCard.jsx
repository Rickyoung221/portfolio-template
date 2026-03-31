"use client";
import React, { memo } from "react";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

const iconLinkClass = (isDarkMode) =>
  `h-12 w-12 sm:h-14 sm:w-14 border-2 relative rounded-full flex items-center justify-center
   ${
     isDarkMode
       ? "border-solarized-base1 hover:border-solarized-base3"
       : "border-solarized-base1 hover:border-solarized-base03"
   }
   group/link`;

const ProjectCard = memo(({ imgUrl, title, description, gitUrl, playUrl }) => {
  const { isDarkMode } = useTheme();
  const showOverlay = Boolean(playUrl || gitUrl);

  return (
    <div
      className={`h-[400px] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105
                    ${
                      isDarkMode
                        ? "bg-solarized-base02 border border-solarized-base01"
                        : "bg-solarized-base2 border border-solarized-base1"
                    }`}
    >
      <div className="h-48 sm:h-52 md:h-52 relative group">
        <Image
          src={imgUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          priority={false}
        />
        {showOverlay && (
          <div
            className={`overlay items-center justify-center absolute top-0 left-0 w-full h-full 
                        ${isDarkMode ? "bg-solarized-base02" : "bg-solarized-base2"}
                        bg-opacity-0 hidden group-hover:flex group-hover:bg-opacity-80 
                        transition-all duration-500`}
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {playUrl && (
                <Link
                  href={playUrl}
                  className={iconLinkClass(isDarkMode)}
                  aria-label={`Play ${title}`}
                >
                  <PlayCircleIcon
                    className={`h-8 w-8 sm:h-10 sm:w-10 cursor-pointer
                    ${
                      isDarkMode
                        ? "text-solarized-base1 group-hover/link:text-solarized-base3"
                        : "text-solarized-base01 group-hover/link:text-solarized-base03"
                    }`}
                  />
                </Link>
              )}
              {gitUrl && (
                <Link
                  href={gitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconLinkClass(isDarkMode)}
                  aria-label={`View ${title} source on GitHub`}
                >
                  <FaGithub
                    className={`h-8 w-8 sm:h-10 sm:w-10 cursor-pointer
                    ${
                      isDarkMode
                        ? "text-solarized-base1 group-hover/link:text-solarized-base3"
                        : "text-solarized-base01 group-hover/link:text-solarized-base03"
                    }`}
                    aria-hidden
                  />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col h-[calc(400px-13rem)]">
        <h3
          className={`text-xl font-semibold mb-2 p-4 pb-2 ${isDarkMode ? "text-solarized-base3" : "text-solarized-base03"}`}
        >
          {title}
        </h3>
        <div
          className={`flex-1 overflow-y-auto px-4 pb-4 ${isDarkMode ? "scrollbar-dark" : "scrollbar-light"}`}
        >
          <p
            className={`text-sm whitespace-pre-line ${isDarkMode ? "text-solarized-base1" : "text-solarized-base01"}`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
