import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import { folderKeyFromRelativePath, postHrefFromSys } from "@/lib/blog-path";
import {
  MdArticle,
  MdChevronRight,
  MdFolderOpen,
  MdLibraryBooks,
} from "react-icons/md";
import { SiLeetcode } from "react-icons/si";

const iconMuted =
  "text-solarized-base01 dark:text-solarized-base1 opacity-80";

/** File stem for icon rules (Tina `basename` / `filename`, extension stripped). */
function postFileStem(sys) {
  const raw = (sys?.basename || sys?.filename || "").trim();
  return raw.replace(/\.md$/i, "").trim();
}

/** Match stem: `Lc…`, `LC…`, or `Leetcode…` (any case). */
function isLeetcodeFileStem(stem) {
  if (!stem) return false;
  return /^leetcode/i.test(stem) || /^lc/i.test(stem);
}

function postListIconClassName(isLeetcode) {
  const base =
    "h-5 w-5 shrink-0 transition-colors group-hover:text-solarized-blue dark:group-hover:text-solarized-accentGh";
  if (isLeetcode) {
    return `${base} text-[#FFA116] opacity-95 group-hover:text-[#FFA116] dark:opacity-100`;
  }
  return `${base} ${iconMuted}`;
}

function groupPosts(edges) {
  const nodes = edges.map((e) => e?.node).filter(Boolean);
  /** @type {Map<string, typeof nodes>} */
  const map = new Map();
  for (const node of nodes) {
    const key = folderKeyFromRelativePath(node._sys?.relativePath ?? "");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(node);
  }
  const collator = new Intl.Collator(undefined, { sensitivity: "base" });
  for (const list of map.values()) {
    list.sort((a, b) =>
      collator.compare(
        a.title || a._sys?.basename || "",
        b.title || b._sys?.basename || "",
      ),
    );
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (a === "") return -1;
    if (b === "") return 1;
    return collator.compare(a, b);
  });
  return keys.map((folder) => ({ folder, posts: map.get(folder) ?? [] }));
}

const panelClass =
  "rounded-xl border transition-colors duration-300 border-solarized-base1/35 dark:border-solarized-base01/35 bg-solarized-base3/40 dark:bg-solarized-base02/25 shadow-sm";

export default function PostList(props) {
  const edges = props.data?.postConnection?.edges ?? [];
  const sections = groupPosts(edges);

  return (
    <PageContainer>
      <PageTitle title="Blog" />
      <div className="container mx-auto px-4 max-w-2xl space-y-8 text-text-light dark:text-text-dark pb-4">
        {sections.map(({ folder, posts }) => (
          <section key={folder || "__root__"} className={panelClass}>
            {folder ? (
              <h3 className="flex items-center gap-2.5 px-4 pt-4 pb-2 text-lg font-semibold tracking-tight transition-colors duration-300 text-solarized-base03 dark:text-solarized-base1">
                <MdFolderOpen
                  className="h-6 w-6 shrink-0 text-solarized-blue dark:text-solarized-accentGh"
                  aria-hidden
                />
                {folder}
              </h3>
            ) : (
              <h3 className="flex items-center gap-2.5 px-4 pt-4 pb-2 text-lg font-semibold tracking-tight transition-colors duration-300 text-solarized-base03 dark:text-solarized-base1">
                <MdLibraryBooks
                  className="h-6 w-6 shrink-0 text-solarized-blue dark:text-solarized-accentGh"
                  aria-hidden
                />
                Articles
              </h3>
            )}
            <ul
              className={`list-none ${
                folder ? "px-2 pb-2" : "px-2 pb-2 pt-0"
              } space-y-1`}
              role="list"
            >
              {posts.map((post) => {
                const stem = postFileStem(post._sys);
                const isLc = isLeetcodeFileStem(stem);
                return (
                  <li key={post.id}>
                    <Link
                      href={postHrefFromSys(post._sys)}
                      className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-200
                      text-solarized-base03 dark:text-solarized-base1
                      hover:bg-solarized-base2/80 dark:hover:bg-solarized-base03/40
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solarized-blue dark:focus-visible:outline-solarized-accentGh"
                    >
                      {isLc ? (
                        <SiLeetcode
                          className={postListIconClassName(true)}
                          aria-hidden
                        />
                      ) : (
                        <MdArticle
                          className={postListIconClassName(false)}
                          aria-hidden
                        />
                      )}
                      <span className="min-w-0 flex-1 font-medium leading-snug group-hover:text-solarized-blue dark:group-hover:text-solarized-accentGh transition-colors">
                        {post.title ||
                          post._sys?.basename ||
                          post._sys?.filename}
                      </span>
                      <MdChevronRight
                        className="h-5 w-5 shrink-0 opacity-0 -translate-x-1 transition-all duration-200 text-solarized-base01 dark:text-solarized-base1 group-hover:opacity-70 group-hover:translate-x-0"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
