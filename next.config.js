const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during `next build`; run `npm run lint` before release.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "fonts.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "www.recaptcha.net",
      },
      {
        protocol: "https",
        hostname: "recaptcha.net",
      },
      {
        protocol: "https",
        hostname: "google.com",
      },
      {
        protocol: "https",
        hostname: "p1.music.126.net",
      },
      {
        protocol: "https",
        hostname: "p2.music.126.net",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "http",
        hostname: "p1.music.126.net",
      },
      {
        protocol: "http",
        hostname: "p2.music.126.net",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "@heroicons/react",
      "@headlessui/react",
    ],
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "localhost",
        "127.0.0.1",
        "fonts.googleapis.com",
        "www.google.com",
        "www.gstatic.com",
        "www.recaptcha.net",
        "recaptcha.net",
      ],
    },
    // Netease Cloud Music API is CommonJS; keep it external for Server Components.
    serverComponentsExternalPackages: ["NeteaseCloudMusicApi"],
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
      {
        source: "/recaptcha/api.js",
        destination: "https://www.google.com/recaptcha/api.js",
      },
      {
        source: "/recaptcha/api2.js",
        destination: "https://www.google.com/recaptcha/api2.js",
      },
    ];
  },
  poweredByHeader: false,
};

module.exports = withBundleAnalyzer(nextConfig);
