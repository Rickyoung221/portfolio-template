"use client";
import "./about-section-theme.css";
import { useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TabButton from "@/components/ui/TabButton";
import TabDataContent from "@/data/tabData";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { MdWork } from "react-icons/md";
import { GiSkills } from "react-icons/gi";
import { FaGraduationCap, FaCertificate, FaTrophy } from "react-icons/fa";
import GitHubStats from "@/components/about/GitHubStats";
import SiteVisitorStats from "@/components/visitors/SiteVisitorStats";

const AboutSection = () => {
  const [tab, setTab] = useState("experience");
  const [isPending, startTransition] = useTransition();
  const { isDarkMode } = useTheme();

  const handleTabChange = (id) => {
    startTransition(() => {
      setTab(id);
    });
  };

  return (
    <section
      id="about"
      className={`flex flex-col gap-6 sm:gap-8 relative items-center ${
        isDarkMode ? "dark-theme" : "light-theme"
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-5xl">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 md:items-start">
          <div className="md:col-span-4 flex justify-center md:justify-start md:sticky md:top-24 shrink-0">
            <div className="w-full max-w-[300px] relative rounded-xl overflow-hidden theme-shadow ring-1 ring-black/[0.06] dark:ring-white/10">
              <Image
                src="/images/avatar-placeholder.svg"
                alt="Profile placeholder — Chiikawa Usagi (うさぎ) theme for this template"
                width={300}
                height={300}
                priority
                className="w-full h-auto rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                unoptimized
              />
            </div>
          </div>

          <div className="md:col-span-8 w-full min-w-0 max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-5 theme-primary scroll-mt-24">
              About Me
            </h3>

            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base lg:text-lg text-left leading-relaxed text-pretty theme-text">
              <p>
                I am <span className="font-semibold">Usagi</span> (うさぎ) — the
                loud, carrot-loving rabbit from{" "}
                <span className="font-semibold">Chiikawa</span> (ちいかわ) by
                Nagano — used here only as a{" "}
                <span className="font-semibold">template persona</span>. In real
                life, replace this with your name and story. The silly school
                name{" "}
                <span className="font-semibold">Carrot Valley Institute</span>{" "}
                and <span className="font-semibold">Example City</span> are
                placeholders too.
              </p>

              <p>
                My work focuses on{" "}
                <span className="font-semibold theme-secondary">
                  reliable web services
                </span>{" "}
                and{" "}
                <span className="font-semibold theme-secondary">
                  thoughtful product UX
                </span>
                . I like shipping end-to-end features with{" "}
                <span className="font-medium theme-primary">
                  React on the client, a typed API layer, and a solid database
                  underneath
                </span>
                — swap this stack for whatever you actually use.
              </p>

              <p>
                I have listed{" "}
                <span className="font-semibold theme-primary">sample</span>{" "}
                roles and projects in the timeline so the layout stays
                interesting. Delete what you do not need and paste your true
                milestones instead.
              </p>

              <p>
                Outside of code, the Chiikawa Usagi bit pairs well with carrots,
                curry rice, and yelling &quot;ウラ&quot; for no reason — all
                joke filler for this template. Use this space for your real
                hobbies.
              </p>
              <p className="mt-4 sm:mt-5 text-sm sm:text-base not-italic">
                <Link
                  href="/hobbies"
                  className="group inline-flex items-center gap-1.5 font-medium theme-primary underline-offset-4 decoration-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card-bg)] rounded-sm"
                >
                  <span>More about my hobbies</span>
                  <span
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px my-8 theme-divider"></div>

        <GitHubStats />

        <div className="w-full mt-8 sm:mt-10">
          <SiteVisitorStats />
        </div>

        <div className="w-full h-px my-8 theme-divider"></div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full">
          <TabButton
            selectTab={() => handleTabChange("experience")}
            active={tab === "experience"}
          >
            <span className="flex items-center gap-1.5">
              <MdWork className="text-lg" />
              <span>Experience</span>
            </span>
          </TabButton>
          <TabButton
            selectTab={() => handleTabChange("skills")}
            active={tab === "skills"}
          >
            <span className="flex items-center gap-1.5">
              <GiSkills className="text-lg" />
              <span>Skills</span>
            </span>
          </TabButton>
          <TabButton
            selectTab={() => handleTabChange("education")}
            active={tab === "education"}
          >
            <span className="flex items-center gap-1.5">
              <FaGraduationCap className="text-lg" />
              <span>Education</span>
            </span>
          </TabButton>
          <TabButton
            selectTab={() => handleTabChange("certifications")}
            active={tab === "certifications"}
          >
            <span className="flex items-center gap-1.5">
              <FaCertificate className="text-lg" />
              <span>Certifications</span>
            </span>
          </TabButton>
          <TabButton
            selectTab={() => handleTabChange("awards")}
            active={tab === "awards"}
          >
            <span className="flex items-center gap-1.5">
              <FaTrophy className="text-lg" />
              <span>Awards</span>
            </span>
          </TabButton>
        </div>

        <motion.div
          className="mt-6 sm:mt-8 w-full p-4 sm:p-6 rounded-xl theme-card theme-shadow theme-border border"
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabDataContent activeTab={tab} />
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
