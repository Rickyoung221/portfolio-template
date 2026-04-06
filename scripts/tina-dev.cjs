const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const {
  getSpawnEnv,
  warnIfTinaClientIdMissingForDev,
} = require("./load-tina-env.cjs");

const root = path.join(__dirname, "..");

warnIfTinaClientIdMissingForDev();
const spawnEnv = getSpawnEnv();

// Stale `tinacms build` output under public/admin serves bundled JS with a baked-in
// clientId of undefined. Dev must use the Vite entry (localhost:4001) from a fresh index.
const adminDir = path.join(root, "public", "admin");
if (fs.existsSync(adminDir)) {
  fs.rmSync(adminDir, { recursive: true, force: true });
}

const isWin = process.platform === "win32";
const tinacmsBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "tinacms.cmd" : "tinacms",
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
