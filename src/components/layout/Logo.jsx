"use client";
import React from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

const Logo = ({ isFooter = false }) => {
  const { isDarkMode } = useTheme();

  const box =
    isFooter
      ? "relative w-12 h-12 sm:w-14 sm:h-14"
      : "relative w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]";

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${box} shrink-0 rounded-full overflow-hidden ring-1 ring-black/[0.08] dark:ring-white/12 shadow-sm`}
      >
        <Image
          src="/images/site-logo.png"
          alt="Site logo — mascot"
          fill
          sizes="(max-width: 768px) 56px, 72px"
          style={{ objectFit: "cover" }}
          className={`transition-opacity duration-300 ${
            isDarkMode ? "opacity-100" : "opacity-95"
          }`}
          priority={!isFooter}
        />
      </div>
    </div>
  );
};

export default Logo;
