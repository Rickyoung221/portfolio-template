import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";

/** GitHub username: alphanumeric and hyphens, 1–39 chars (simplified). */
function isValidGitHubLogin(login) {
  if (!login || typeof login !== "string") return false;
  const trimmed = login.trim();
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(trimmed);
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-website-template",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchUser(username) {
  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      body: text,
    };
  }
  const data = await res.json();
  return { ok: true, data };
}

async function sumPublicRepoStars(username) {
  const headers = githubHeaders();
  let total = 0;
  let page = 1;
  const perPage = 100;
  const maxPages = 15;

  while (page <= maxPages) {
    const url = new URL(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos`);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "updated");

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;

    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) break;

    for (const r of repos) {
      total += Number(r.stargazers_count) || 0;
    }

    if (repos.length < perPage) break;
    page += 1;
  }

  return total;
}

async function fetchContributionsLastYear(username, token) {
  if (!token) return null;

  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-website-template",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (json.errors?.length) return null;

  const n =
    json?.data?.user?.contributionsCollection?.contributionCalendar
      ?.totalContributions;
  return typeof n === "number" ? n : null;
}

export const revalidate = 3600;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fromQuery = searchParams.get("username");
  const fromEnv = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  const username = (fromQuery || fromEnv || "octocat").trim();

  if (!isValidGitHubLogin(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username." },
      { status: 400 }
    );
  }

  const userResult = await fetchUser(username);
  if (!userResult.ok) {
    return NextResponse.json(
      {
        error: "GitHub user not found or API error.",
        details:
          userResult.status === 403
            ? "Rate limited or forbidden. Set GITHUB_TOKEN in .env.local to raise limits."
            : undefined,
      },
      { status: userResult.status === 404 ? 404 : 502 }
    );
  }

  const u = userResult.data;
  const token = process.env.GITHUB_TOKEN;

  const [totalStars, contributionsLastYear] = await Promise.all([
    sumPublicRepoStars(username),
    fetchContributionsLastYear(username, token),
  ]);

  return NextResponse.json({
    login: u.login,
    name: u.name,
    avatarUrl: u.avatar_url,
    htmlUrl: u.html_url,
    bio: u.bio,
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    totalStars,
    contributionsLastYear,
  });
}
