import PROJECT_DATA from "@/data/projectData";

/** Matches the number of cards in `ProjectsSection` (template: projects only). */
export function getFeaturedProjectCount() {
  return PROJECT_DATA.length;
}
