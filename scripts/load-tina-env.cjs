const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dotenv = require("dotenv");

/**
 * Parse .env-style files: KEY=VAL, optional `export `, # comments, quotes, UTF-8 BOM.
 */
function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  let text = fs.readFileSync(filePath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (const line of text.split(/\r?\n/)) {
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("export ")) trimmed = trimmed.slice(7).trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Optional `tina/tina.local.json` — { "clientId": "uuid" } — gitignored, survives dotenv quirks. */
function readTinaLocalJson() {
  const p = path.join(root, "tina", "tina.local.json");
  if (!fs.existsSync(p)) return {};
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    const id = j.clientId || j.NEXT_PUBLIC_TINA_CLIENT_ID;
    if (id && String(id).trim() && id !== "undefined") {
      return { NEXT_PUBLIC_TINA_CLIENT_ID: String(id).trim() };
    }
  } catch {
    /* ignore */
  }
  return {};
}

function applyTinaKeysToProcess(parsed) {
  const keys = [
    "NEXT_PUBLIC_TINA_CLIENT_ID",
    "NEXT_PUBLIC_TINA_BRANCH",
    "TINA_TOKEN",
  ];
  for (const k of keys) {
    const v = parsed[k];
    if (v && String(v).trim().length > 0 && String(v).trim() !== "undefined") {
      process.env[k] = String(v).trim();
    }
  }
}

function getMergedTinaVars() {
  const envPath = path.join(root, ".env");
  const localPath = path.join(root, ".env.local");
  return {
    ...parseEnvFile(envPath),
    ...parseEnvFile(localPath),
    ...readTinaLocalJson(),
  };
}

/** Tina CLI only loads root `.env` internally; mirror missing Tina keys from `.env.local` / JSON. */
function syncTinaKeysToRootDotenv(merged, envPath) {
  const keys = [
    "NEXT_PUBLIC_TINA_CLIENT_ID",
    "NEXT_PUBLIC_TINA_BRANCH",
    "TINA_TOKEN",
  ];
  let existing = "";
  if (fs.existsSync(envPath)) {
    existing = fs.readFileSync(envPath, "utf8");
  }
  const linesToAdd = [];
  for (const k of keys) {
    const v = merged[k];
    if (!v) continue;
    const re = new RegExp(`^\\s*${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`, "m");
    if (!re.test(existing)) {
      linesToAdd.push(`${k}=${v}`);
    }
  }
  if (linesToAdd.length === 0) return;
  const block = `\n# Synced for Tina CLI (scripts/load-tina-env.cjs)\n${linesToAdd.join("\n")}\n`;
  fs.appendFileSync(envPath, block, "utf8");
}

function loadTinaEnv() {
  const envPath = path.join(root, ".env");
  const localPath = path.join(root, ".env.local");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true });
  }
  if (fs.existsSync(localPath)) {
    dotenv.config({ path: localPath, quiet: true, override: true });
  }

  const merged = getMergedTinaVars();
  applyTinaKeysToProcess(merged);
  syncTinaKeysToRootDotenv(merged, envPath);
}

/**
 * Env object for child processes: forces Tina keys from merged file parse on top of process.env
 * (avoids some shells / npx stripping or empty snapshots).
 */
function getSpawnEnv() {
  loadTinaEnv();
  const merged = getMergedTinaVars();
  applyTinaKeysToProcess(merged);
  const picked = {};
  for (const k of [
    "NEXT_PUBLIC_TINA_CLIENT_ID",
    "NEXT_PUBLIC_TINA_BRANCH",
    "TINA_TOKEN",
  ]) {
    if (merged[k] && String(merged[k]).trim() !== "undefined") {
      picked[k] = String(merged[k]).trim();
    }
  }
  return { ...process.env, ...picked };
}

/** Tina Admin (Vite bundle) needs a real client id; local GraphQL + /posts do not. */
function warnIfTinaClientIdMissingForDev() {
  loadTinaEnv();
  const id = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  if (id && id !== "undefined") return;
  console.warn(`
⚠️  NEXT_PUBLIC_TINA_CLIENT_ID is not set — Tina Admin login may not work until you add it.

Local blog GraphQL (port 4001) and /posts still run without Cloud. To enable Admin:
  1) .env.local (no quotes): NEXT_PUBLIC_TINA_CLIENT_ID=your-uuid-from-app.tina.io
  2) Or copy tina/tina.local.example.json → tina/tina.local.json and set "clientId".
`);
}

function assertTinaClientId() {
  loadTinaEnv();
  const id = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  if (!id || id === "undefined") {
    console.error(`
Missing NEXT_PUBLIC_TINA_CLIENT_ID (Tina Admin login needs this on process.env).

Fix one of:
  1) In .env.local add a single line (no quotes):
     NEXT_PUBLIC_TINA_CLIENT_ID=your-uuid-from-app.tina.io
  2) Copy tina/tina.local.example.json → tina/tina.local.json and set "clientId".

Then run: npm run dev
`);
    process.exit(1);
  }
}

/** TinaCloud \`tinacms build\` (e.g. Vercel) needs a server-side token, not only the public client id. */
function assertTinaCloudBuildEnv() {
  assertTinaClientId();
  loadTinaEnv();
  const t = process.env.TINA_TOKEN;
  if (!t || String(t).trim() === "" || t === "undefined") {
    console.error(`
Missing TINA_TOKEN — required for \`tinacms build\` (Vercel / production).

Add in Vercel: Project → Settings → Environment Variables:
  TINA_TOKEN = (create at https://app.tina.io → your project → Tokens)

Also set NEXT_PUBLIC_TINA_CLIENT_ID there if not already.
Optional: NEXT_PUBLIC_TINA_BRANCH=main (or your default branch).
`);
    process.exit(1);
  }
}

loadTinaEnv();

module.exports = {
  loadTinaEnv,
  getMergedTinaVars,
  getSpawnEnv,
  warnIfTinaClientIdMissingForDev,
  assertTinaClientId,
  assertTinaCloudBuildEnv,
  parseEnvFile,
};
