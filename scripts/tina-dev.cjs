const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const { getSpawnEnv, assertTinaClientId } = require("./load-tina-env.cjs");

const root = path.join(__dirname, "..");

assertTinaClientId();
const spawnEnv = getSpawnEnv();

// Stale `tinacms build` output under public/admin serves bundled JS (e.g.
// index-ee963a15.js) with a baked-in clientId of undefined. Dev must use the
// Vite entry (localhost:4001) from a fresh dev index.html — remove leftovers.
const adminDir = path.join(root, "public", "admin");
if (fs.existsSync(adminDir)) {
  fs.rmSync(adminDir, { recursive: true, force: true });
}

// Do not use shell: true with a string array — the shell joins args with spaces,
// so `-c "next dev"` becomes `-c next dev` and clipanion reports: Extraneous positional argument ("dev").
const isWin = process.platform === "win32";
const tinacmsBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "tinacms.cmd" : "tinacms"
);

const child = spawn(tinacmsBin, ["dev", "-c", "next dev"], {
  stdio: "inherit",
  env: spawnEnv,
  cwd: root,
  shell: false,
});

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
