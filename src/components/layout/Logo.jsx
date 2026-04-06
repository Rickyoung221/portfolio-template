"use client";
import React from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

/** Animated GIF (use `unoptimized` so frames play). Override with NEXT_PUBLIC_SITE_LOGO_URL. */
const defaultLogoSrc = "https://i.redd.it/k4v07rl1xt0f1.gif";

const Logo = ({ isFooter = false }) => {
  const { isDarkMode } = useTheme();

  const src =
    (typeof process.env.NEXT_PUBLIC_SITE_LOGO_URL === "string" &&
      process.env.NEXT_PUBLIC_SITE_LOGO_URL.trim()) ||
    defaultLogoSrc;

  const isRemote = /^https?:\/\//i.test(src);
  const isGif = /\.gif(\?|$)/i.test(src);

  const box =
    isFooter
      ? "relative w-12 h-12 sm:w-14 sm:h-14"
      : "relative w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]";

  return (
    <div className="flex justify-center items-center">
      <div className={`${box} shrink-0`}>
        <Image
          src={src}
          alt="Site logo — Usagi (Chiikawa)"
          fill
          sizes="(max-width: 768px) 56px, 72px"
          style={{ objectFit: "cover" }}
          className={`transition-opacity duration-300 ${
            isDarkMode ? "opacity-100" : "opacity-95"
          }`}
          priority={!isFooter}
          unoptimized={isRemote && isGif}
        />
      </div>
    </div>
  );
};

export default Logo;
