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

/** Default: Usagi name card (Chiikawa Wiki / WikiTide). Override with NEXT_PUBLIC_ABOUT_AVATAR_URL. */
const DEFAULT_ABOUT_AVATAR =
  "https://static.wikitide.net/chiikawawiki/b/bf/Characters%2BUSAGI%2Bphonetic%2Band%2Bname%2Bcopy.png";

const AboutSection = () => {
  const [tab, setTab] = useState("experience");
  const [isPending, startTransition] = useTransition();
  const { isDarkMode } = useTheme();

  const aboutAvatarSrc =
    (typeof process.env.NEXT_PUBLIC_ABOUT_AVATAR_URL === "string" &&
      process.env.NEXT_PUBLIC_ABOUT_AVATAR_URL.trim()) ||
    DEFAULT_ABOUT_AVATAR;

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
          <div className="md:col-span-4 flex flex-col justify-center md:justify-start md:sticky md:top-24 shrink-0">
            <div className="w-full max-w-[300px] relative rounded-xl overflow-hidden theme-shadow ring-1 ring-black/[0.06] dark:ring-white/10">
              <Image
                src={aboutAvatarSrc}
                alt="Usagi — character name card (Chiikawa)"
                width={300}
                height={300}
                priority
                className="w-full h-auto rounded-xl object-contain bg-black/[0.03] dark:bg-white/[0.04] transition-transform duration-300 hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <p
              className={`mt-2 max-w-[300px] text-center text-xs leading-snug px-1 ${
                isDarkMode ? "text-solarized-base00" : "text-solarized-base01"
              }`}
            >
              Add your photo in /public/images
            </p>
          </div>

          <div className="md:col-span-8 w-full min-w-0 max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-5 theme-primary scroll-mt-24">
              About Usagi
            </h3>
            <p className="text-sm sm:text-base theme-text opacity-90 mb-4 sm:mb-5 not-italic">
              <span className="font-medium">Chiikawa</span> (ちいかわ) ·{" "}
              <span className="font-medium">Usagi</span> (うさぎ, &quot;rabbit&quot;)
            </p>

            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base lg:text-lg text-left leading-relaxed text-pretty theme-text">
              <p>
                <span className="font-semibold">Usagi</span> is a small yellow
                rabbit and one of the core characters in{" "}
                <span className="font-semibold">Chiikawa</span>, the manga and
                anime series by <span className="font-semibold">Nagano</span>.
                They wander the same cozy, sometimes strange world as{" "}
                <span className="font-semibold">Chiikawa</span> and{" "}
                <span className="font-semibold">Hachiware</span>, showing up as
                a loud, chaotic friend who still feels unmistakably part of the
                trio.
              </p>

              <p>
                Personality-wise, Usagi is playful and mischievous—often
                teasing Chiikawa or stirring the pot—yet surprisingly steady when
                things get serious. They rarely speak in full sentences; instead
                they chatter in simple sounds and exclamations fans recognize
                from the show. That mix of goofy energy and unexpected
                competence is a big part of their charm.
              </p>

              <p>
                In fan lore and merch, Usagi is tied to foods like{" "}
                <span className="font-semibold">carrots</span> and{" "}
                <span className="font-semibold">curry rice</span>, and to silly
                catchphrases and shouts such as &quot;ウラ&quot;—little details
                that make the character easy to love and meme. This site uses
                Usagi as a lighthearted theme; the timeline and tabs below are
                sample sections you can replace with your own story and work.
              </p>

              <p>
                For a fuller character profile (episodes, trivia, and updates),
                check the{" "}
                <a
                  href="https://chiikawa.fandom.com/wiki/Usagi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium theme-primary underline-offset-2 hover:underline"
                >
                  Chiikawa Wiki
                </a>{" "}
                on Fandom.
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
