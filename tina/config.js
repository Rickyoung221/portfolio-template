import { defineConfig } from "tinacms";
import post from "./collections/post";

// Client ID must be on process.env before `tinacms dev` starts (see scripts/load-tina-env.cjs).
// Tina's browser prebuild keeps `process.env.NEXT_PUBLIC_*` for Vite `define`; dotenv in this
// file is stripped from that bundle, so loading .env here does not fix admin login.

export const config = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD,
  token: process.env.TINA_TOKEN,
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  schema: {
    collections: [post],
  },
});

export default config;
