/**
 * Build the public site for GitHub Pages (static export).
 *
 * The admin panel (src/app/admin-panel) and API routes (src/app/api) require a
 * server runtime (MongoDB, Redis, GitHub auth) and cannot be statically
 * exported. This script temporarily moves them out of the app tree, runs
 * `next build` (which writes ./out because next.config.mjs uses output:"export"),
 * and always restores the original directories afterwards.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const HIDE = ["src/app/admin-panel", "src/app/api"];
const STASH = path.join(ROOT, ".pages-stash");

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function moveToStash(dir) {
  const from = path.join(ROOT, dir);
  if (!(await exists(from))) return false;
  const to = path.join(STASH, dir);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.rename(from, to);
  return true;
}

async function restoreFromStash(dir) {
  const from = path.join(STASH, dir);
  const to = path.join(ROOT, dir);
  if (!(await exists(from))) return;
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.rename(from, to);
}

// Crash recovery: if a previous run died mid-build, its stash still holds the
// original directories. Restore them before doing anything else.
if (await exists(STASH)) {
  console.warn("[build-pages] leftover stash from an interrupted run - restoring it first");
  for (const dir of HIDE) await restoreFromStash(dir);
  await fs.rm(STASH, { recursive: true, force: true });
}

const moved = [];
try {
  for (const dir of HIDE) {
    if (await moveToStash(dir)) moved.push(dir);
  }
  console.log(`[build-pages] excluded: ${moved.join(", ") || "(nothing)"}`);

  const res = spawnSync("npx", ["next", "build"], { stdio: "inherit", cwd: ROOT });
  process.exitCode = res.status ?? 1;
  if (res.status === 0) console.log("[build-pages] static site written to ./out");
} finally {
  for (const dir of moved) {
    try {
      await restoreFromStash(dir);
    } catch (e) {
      console.error(`[build-pages] FAILED to restore ${dir}: ${e.message}`);
      process.exitCode = 1;
    }
  }
  await fs.rm(STASH, { recursive: true, force: true });
}
