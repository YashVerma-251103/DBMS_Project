# Docker

How the Airport Management System is containerized, how to run it, and the traps.

---

## Quick start

You still need the root `.env` — the database is **not** containerized (see below).

```bash
cp .env.example .env      # then fill in DATABASE_URL from Supabase
docker compose up --build
```

| URL | What |
|---|---|
| http://localhost:3000 | the app (nginx) |
| http://localhost:5000/health | backend liveness — `{"ok":true}` |

Stop with `docker compose down`.

---

## What is and isn't containerized

| Part | Containerized? | Why |
|---|---|---|
| `backend/` | **Yes** | Stateless Express. Fully self-contained image. |
| `frontend/` | **Yes** | Static bundle served by nginx. No Node at runtime. |
| PostgreSQL | **No** | Stays on remote Supabase. A deliberate choice, not an oversight. |
| Migrations / seeds | **No** | Run from a host checkout against Supabase. See [Migrations](#migrations). |

Two containers. That's the whole stack.

---

## How it fits together

```
browser ──> :3000  frontend (nginx)
                     ├── /            -> static bundle (index.html, JS, CSS)
                     └── /api/*       -> proxy to backend:5000, /api prefix stripped
                                             │
                                             v
                                        backend (node) ──> Supabase (remote)
                                             ^
browser ──> :5000 ───────────────────────────┘  (published for debugging only)
```

### The `/api` reverse-proxy, and why it exists

The frontend used to hardcode `http://localhost:5000` in 19 components. CRA inlines env values
and string literals **at build time**, so that backend origin got baked into the JS bundle — an
image built that way only works on localhost and cannot be deployed anywhere else.

The fix: nginx serves the bundle *and* reverse-proxies `/api` to the backend, so the bundle uses
a **relative** URL. Consequences worth understanding:

- **One image runs on any host** with no rebuild. Nothing origin-specific is compiled in.
- **Calls are same-origin**, so CORS is not load-bearing in the container path. (`app.use(cors())`
  stays in the backend because the non-Docker `npm start` path *is* cross-origin.)
- The prefix strip is done by the **trailing slash** on `proxy_pass http://backend:5000/`. It maps
  `/api/users/login` → `/users/login`, matching the route mounts in `backend/src/index.ts`.
  **Delete that slash and every API call 404s.** This is the single most breakable line in the setup.

### The API base URL lives in exactly one file

`frontend/src/api/index.ts`:

```ts
const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:5000';
```

- **Docker build**: `REACT_APP_API_URL=/api` (a build `ARG`, defaulted in `frontend/Dockerfile`).
- **`npm start` on the host**: env var unset → falls back to `localhost:5000`, unchanged workflow.

> **Do not reintroduce a hardcoded `http://localhost:5000` in a component.** It re-bakes the
> backend origin into the bundle and silently breaks every non-localhost deployment. Every call
> site imports the shared constant instead. Guard with:
> `grep -rn "localhost:5000" frontend/src` → should only ever match `api/index.ts`.

---

## Files

| File | Role |
|---|---|
| `docker-compose.yml` | The two services, ports, `env_file`, healthcheck. |
| `backend/Dockerfile` | Multi-stage: `npm ci` → `tsc` → prod stage with dev deps omitted. |
| `frontend/Dockerfile` | Multi-stage: `npm ci` → CRA build → `nginx:alpine`. |
| `frontend/nginx.conf` | SPA fallback + the `/api` proxy. |
| `backend/.dockerignore`, `frontend/.dockerignore` | Keep `node_modules/`, `build/`, `dist/`, `.env` out of the build context. |
| `.env.example` | The only two vars the codebase reads. |

Build-time only — none of these are needed once the images exist.

---

## Environment

The entire codebase reads exactly two variables, both backend-side:

| Var | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | `backend/src/db.ts`, `scripts/migrate.js` | Supabase **transaction pooler**, port 6543. |
| `PORT` | `backend/src/index.ts` | Defaults to 5000. |

Compose injects them via `env_file: [.env]`. The frontend consumes **no** runtime env vars —
its only knob (`REACT_APP_API_URL`) is applied at build time.

`.env` is gitignored and is never copied into an image (`.dockerignore` excludes it).

> The `dotenv.config({ path: '../../.env' })` calls in `db.ts` / `index.ts` resolve to a
> nonexistent path inside the container. **This is fine — leave it.** dotenv never overrides
> real env vars, so the values compose injects win. It silently no-ops. Don't "fix" it.

---

## Migrations

**Not run from a container.** `database/` is deliberately excluded from the backend image — SQL
has no business in a runtime image, and the schema lives in Supabase, which containers don't own.

```bash
cd backend && npm run migrate     # applies database/migrations/*.sql in order
```

Seeds (`database/seed_users.sql`, `Populate_tables.sql`) are still run by hand in the Supabase
SQL editor or via `psql`.

So: **running the app needs no repo checkout; changing the schema does.**

---

## Gotchas

**Node 24, not 20.** `package-lock.json` was authored by **npm 11**. The npm 10 shipped in
`node:20` resolves the tree differently and `npm ci` dies with `Missing: yaml@2.9.0 from lock
file`. A host `npm install` is lenient and hides this; `npm ci` is strict and exposes it. Keep the
image's npm **≥** the one that wrote the lock, or regenerate the lock to match. Don't "fix" this by
switching the Dockerfile to `npm install` — that silently drifts dependencies per build and
destroys reproducibility.

**`localhost:5000` still appears in the built bundle.** It survives as the *dead fallback branch*
of the ternary (`"/api" !== null`, so `/api` always wins) — terser doesn't eliminate it. It is not
live. Grepping the bundle is therefore **not** a valid check; grep `frontend/src` instead.

**Git Bash mangles `/api`.** Running a build from Git Bash on Windows, MSYS rewrites the leading
slash into a Windows path, and you get `C:/Program Files/Git/api` compiled into your bundle. Only
affects manual host builds, never the Docker build (the container is Linux). Prefix with
`MSYS_NO_PATHCONV=1` if you hit it.

**Port 6543 blocking applies to containers too.** They share the host's network, so Docker neither
causes nor fixes it. If the app hangs on login on an institutional network, a mobile hotspot is the
fastest workaround — see `RestructuringPlans/DatabaseConnectivity.md`.

---

## Deploying beyond compose

The backend image is **fully portable**: give it `DATABASE_URL` and it runs anywhere.

The frontend image has **one coupling** — `nginx.conf` hardcodes `proxy_pass http://backend:5000/`,
so something must answer to the hostname `backend` on port 5000. Compose provides that for free.
On another orchestrator, or with the backend on a real domain, override that one line (mount a
different `nginx.conf`) or point `proxy_pass` at the real host. The *bundle* needs no rebuild —
that's the whole point of the relative URL.

For a stricter posture, drop the `ports:` block on the `backend` service in `docker-compose.yml`.
It's published purely for debugging; nginx reaches the backend over the compose network regardless.

---

## Common commands

```bash
docker compose up --build        # build + run
docker compose up -d             # background
docker compose ps                # status + health
docker compose logs -f backend   # tail logs
docker compose down              # stop and remove
docker compose build --no-cache frontend   # force a clean rebuild
```

### Verifying a change end to end

```bash
curl localhost:5000/health                  # backend alive -> {"ok":true}
curl localhost:3000/api/health              # proxy + prefix strip -> {"ok":true}
curl localhost:3000/api/flights/search      # live Supabase data through the proxy
curl -o /dev/null -w "%{http_code}\n" localhost:3000/admin/dashboard   # SPA fallback -> 200
```

If `/api/health` works but `/api/flights/search` 404s with `Cannot GET /flights`, the proxy is
fine and you're hitting a route that doesn't exist — check the mounts in `backend/src/index.ts`.
