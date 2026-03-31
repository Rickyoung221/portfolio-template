"use client";
import React from "react";
import Logo from "./Logo";
import { useTheme } from "@/context/ThemeContext";

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`footer border-t transition-colors duration-300
                       ${
                         isDarkMode
                           ? "border-t-solarized-base01 bg-solarized-base03Deep text-solarized-base1"
                           : "border-t-solarized-base1 bg-solarized-base2 text-solarized-base01"
                       }`}
    >
      <div className="container mx-auto p-6 md:p-4 lg:p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div
          className={`transition-colors duration-300
                        ${isDarkMode ? "text-solarized-base1" : "text-solarized-base03"}`}
        >
          <Logo isFooter={true} />
        </div>
        <p
          className={`text-sm text-center md:text-left transition-colors duration-300
                      ${isDarkMode ? "text-solarized-base0" : "text-solarized-base01"}`}
        >
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
