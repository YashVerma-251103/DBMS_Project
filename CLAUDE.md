# CLAUDE.md — Airport Management System

## Working mode
**Ponytail full** is the default for every decision in this project — architecture, design, naming, file structure. Before adding anything, climb the ladder: does it need to exist? Is it already here? Can one line do it?

Use skills proactively:
- `/ui-ux-pro-max` for any UI/component/style work
- `/ponytail` when weighing architecture or dependency choices
- `/code-review` before declaring a feature done

## Git workflow
- Micro-commit: one logical change per commit (e.g. "data consolidation", "error fallback",
  "docs"), not one big commit per task. Keeps rollback of a single piece cheap without
  touching the others.
- Branch-per-experiment: when trying something new or uncertain (a refactor, an unproven
  pattern, a risky fix), create a feature branch first, commit there, and only merge back
  into the working branch once it's verified working (typecheck + manual/functional check).

## Stack (don't re-read README for this)
| Layer | What |
|---|---|
| Frontend | React 19, TypeScript, React Router v7, CRA (port 3000) |
| Backend | Express 4, TypeScript, ts-node-dev (port 5000) |
| DB | PostgreSQL 15 on Supabase via `pg` Pool + SSL |
| Auth | Client-side only — localStorage `currentUser`, role embedded in loginId string |

## Key files
- `frontend/src/styles/ds.ts` — shared inline style system + `useIsMobile`. Use this before adding CSS classes.
- `frontend/src/index.css` — global utility classes only, keep minimal.
- `backend/src/db.ts` — single pg Pool, import from here, never create a second one.
- `backend/src/index.ts` — Express app entry, all routes registered here.
- `.env` (root) — `DATABASE_URL` + `PORT=5000`, never committed.

## Constraints
- No auth middleware on backend — all access control is client-side role routing.
- DB mutations go via URL query strings (existing pattern), not request body, unless a route already uses body.
- `pg.Pool` is shared and singleton — never instantiate another one.
- Supabase enforces `check_manager_role` trigger on `Facility` — Manager_Id must be an Employee with role='manager'.

## What NOT to add without asking
- New npm packages (check installed deps first)
- JWT / server-side sessions (out of scope for this project)
- New DB tables (schema changes need SQL in `database/` and a migration note)
- Tailwind or CSS frameworks (inline styles via `ds.ts` is the current pattern)
