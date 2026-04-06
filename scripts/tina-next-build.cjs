const path = require("path");
const { execSync } = require("child_process");

const { getSpawnEnv, assertTinaCloudBuildEnv } = require("./load-tina-env.cjs");

const root = path.join(__dirname, "..");

assertTinaCloudBuildEnv();
const spawnEnv = getSpawnEnv();

try {
  execSync("tinacms build", { stdio: "inherit", env: spawnEnv, cwd: root });
} catch (err) {
  console.error(`
tinacms build failed (exit ${err.status ?? 1}).

Checklist:
  • Vercel env: NEXT_PUBLIC_TINA_CLIENT_ID, TINA_TOKEN, optional NEXT_PUBLIC_TINA_BRANCH
  • Tina Cloud: GitHub repo linked; branch indexed (app.tina.io → project → configuration)
  • Commit tina/tina-lock.json and keep schema in sync with Tina Cloud
  • Node: use 22.x on Vercel if Tina CLI errors on newer Node
`);
  process.exit(err.status ?? 1);
}

execSync("next build", { stdio: "inherit", env: spawnEnv, cwd: root });
