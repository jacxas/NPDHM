# Base44 dev environment notes

## Run
`docker compose -f docker-compose.base44.yml up -d` — web on :3000, mongo, redis.

## Key facts (non-obvious)
- Next.js 14 app, primarily deployed as a **static export to GitHub Pages** (`npm run build:pages` stashes `src/app/api` + `src/app/admin-panel`, builds, restores). The repo's own Dockerfile (standalone server) is inconsistent with `output: "export"` and appears unused.
- For this reason `next.config.mjs` sets `output: "export"` only when `NODE_ENV !== "development"` — dev must run in server mode or every API route 500s. Do not revert this.
- Public pages read data from **`public/regions.json`, `public/links.json`, `public/Region-Links/*.json`** on disk — not from MongoDB. The homepage renders without any secrets or DB.
- MongoDB is used only by admin/auth features (sessions, admins, audit log, site requests, cache). Redis is best-effort caching (auto-disabled when REDIS_URL is empty).
- Required env vars (lazy — app boots without them, fails only on admin/auth routes): `github_oauth_client_id`, `github_oauth_client_secret`, `encryption_key`. Placeholders live in `.env.base44-defaults`; real values come from `/run/base44/app.env` (last env_file, wins).
- GitHub auth: repo permission (`admin`/`maintain`/`write`) via `GITHUB_REPO_OWNER/NAME/BRANCH` determines access to the admin panel.
- Node 20, `npm ci` (lockfile committed). Healthcheck uses `node -e fetch(...)` on `/api/ping` (alpine has no wget/curl).
- Verify: `curl http://localhost:3000/api/ping` and `/` both 200; `docker compose -f docker-compose.base44.yml ps` all healthy.
