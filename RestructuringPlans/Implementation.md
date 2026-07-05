# Implementation Plan — Airport Management System Restructure

Technical plan derived from `Overview.md`, `Schema.md`, and `Auth.md`, refined through
implementation. This file is the living source of truth for what's built vs. pending —
update the status markers as work lands.

## Status at a glance

| # | Step | Status |
|---|------|--------|
| 1 | Migration runner + fresh baseline schema | ✅ Done |
| 2 | Backend auth/identity routes | ✅ Done |
| 3 | Remaining backend routes (inventory, flights, bookings, feedback, incidents) | ✅ Done |
| 4 | Frontend identity fixes + route guards | ✅ Done |
| 5 | Landing page | ✅ Done (core booking loop; report-an-issue widget is a placeholder) |
| 6 | Inventory admin/manager UI | ⏳ Pending |
| 7 | Incident/complaint extension (UI) | ⏳ Pending (Landing's "Report an Issue" widget is a placeholder) |
| 8 | Flight/lounge booking confirmation UI | ✅ Done (folded into Step 5 — see below) |
| 9 | Check-in tab | ✅ Done (folded into My Bookings — see below) |
| 10 | Admin staff-provisioning UI | ⏳ Pending |

Branch: `restructure-impl`. Everything in steps 1–4 has been run against the live Supabase
DB and verified (curl + browser), not just written.

---

## Context

The project is moving from a login-gated app (root route was the login form, nothing
visible without an account) to a public-facing site: a single landing page open to
everyone with flight info, lounge info, navigation/wayfinding, and cross-store inventory
search, plus visible login/signup that hints at what logged-in users get (booking,
check-in, complaints).

### Scope decisions locked in
1. **Auth**: email/mobile + password only for v1. Google OAuth deferred.
2. **Flights**: public-facing only (search, status, travel planning, booking). No
   hangar/crew/cargo/fuel/food/private-jet modeling.
3. **Staff hierarchy**: flat expanded `Role` CHECK-list + one `Department` column on
   `Employee`, not normalized Role/Department tables.
4. **Navigation**: static directory/wayfinding text reusing `Facility.Location`, not an
   interactive map.
5. **Identity**: Aadhaar removed completely — every table, route, and component that used
   it now uses a plain surrogate `Customer_Id`. The database was wiped and redefined from
   a single fresh DDL rather than incremental `ALTER`s.
6. **No SQL/NoSQL split.** Every entity here is naturally relational with real FK
   relationships already leaned on throughout (multi-table joins everywhere). A second
   database is a new dependency and two systems to keep in sync for no data that's
   actually document-shaped. `jsonb` is the native escape hatch if that ever changes.
7. **Hand-rolled migration runner over Supabase CLI.** The CLI needs installing + linking
   the project via an access token (new tooling + account setup). A ~25-line script using
   the already-installed `pg` package fully solves "stop hand-pasting SQL into the
   Supabase editor" with less new surface area.
8. **Customer post-login experience is the Landing page, not a separate dashboard.**
   Admin/Manager/Employee keep distinct sidebar dashboards (they're doing operational
   CRUD work). Customers are browsing/booking, so logging in enhances the same page they
   were already on — booking buttons appear on flight/lounge search results, and the
   "what you get" teaser cards become real widgets (My Bookings — with check-in folded
   in as a per-row action, Report an Issue) — instead of redirecting to a
   differently-laid-out `CustomerHome`. `CustomerHome` is removed;
   `DASHBOARD_PATH.customer` points at `/`.

---

## ✅ Step 1 — Migration runner + fresh baseline schema

**Built:**
- `database/migrations/0001_baseline.sql` — full schema (12 tables + `check_manager_role`
  trigger), replacing `database/DDL_schema.sql` + `Triggers.sql` + `users.sql` (all three
  deleted; this migration is now the single source of truth).
- `backend/scripts/migrate.js` — zero-dependency runner (uses the already-installed `pg`
  package). Tracks applied files in a `schema_migrations` table, runs new `.sql` files
  from `database/migrations/` in order inside a transaction. Wired up as `npm run migrate`
  in `backend/package.json`.
- `database/Populate_tables.sql`, `database/seed_users.sql` rewritten with Aadhaar
  literals removed (Customer rows are now keyed by auto-assigned `Customer_Id`).
  `seed_users.sql` no longer creates its own `users` table (the migration owns that) and
  now creates the linked `Employee`/`Customer` row for each seeded test account via a
  `WITH ... RETURNING` insert.
- `database/Functional_querries.sql` updated (the live join query and the commented
  examples) to use `Customer_Id` instead of `Aadhaar_No`.

**Schema highlights (see `database/migrations/0001_baseline.sql` for the full DDL):**
- `Customer.Customer_Id SERIAL PRIMARY KEY` replaces `Aadhaar_No` as the identifier;
  `Sex`/`Nationality` columns added (Auth.md's compulsory signup fields).
- `Employee.Role` CHECK-list expanded to the full ~22-value hierarchy from `Schema.md`;
  new `Department` column for the top-level grouping. The original 6 values are kept
  verbatim (load-bearing for the manager trigger + seed data).
- `Booking` simplified from a composite PK to a single `Booking_Id SERIAL PRIMARY KEY`
  (the composite key never added real integrity — `Booking_Id` was already unique).
  `Facility_Id`/`Flight_Id` are an exclusive arc (exactly one set) so one table covers
  both lounge and flight bookings. `Employee_Id` is nullable — NULL means a self-service
  online booking, set means staff-assisted (today's flow). New `Checked_In` boolean.
- `Incident` doubles as the complaint system: `Reported_By`/`Reported_By_Customer_Id` is
  an exclusive arc (employee report vs. customer complaint), plus a new `Assigned_To`
  column that the backend defaults to the target facility's manager when not supplied —
  the entire "complaint assignment engine," no separate service.
- `Flight` gains `Origin`/`Destination`. `Inventory` gains `Price`. `Facility` gains
  `Description` (covers Lounge "benefits" copy).
- `users` keeps `aaddhaar_no` removed entirely; links to `Customer`/`Employee` via plain
  `customer_id`/`employee_id` surrogate FKs, same pattern as every other table.
- No new tables beyond this — every `Schema.md` ask (Lounge reservations, service search,
  Shop inventory/staff/manager) maps onto `Booking`, `Inventory`, `Facility`, and
  `Staff_Schedule`, which already existed.

**Verified:** migration applied cleanly against live Supabase; re-running `npm run
migrate` is a confirmed no-op (idempotency check passed). Seed data loaded — row counts:
30 employees, 15 facilities, 16 customers, 15 flights, 15 bookings, 14 feedback, 540
revenue rows, 15 inventory, 15 staff_schedule, 15 communication, 15 incidents, 4 users.
Sample join (`Booking` → `Customer` → `Facility`) resolves correctly. Zero columns
matching `%adhaar%` remain anywhere in the live schema.

---

## ✅ Step 2 — Backend auth/identity routes

**Built:**
- `backend/src/routes/users.ts` rewritten:
  - `POST /` (signup) now runs a transaction: insert into `Customer` first, then `users`
    with the resulting `customer_id`. **This fixes a real pre-existing bug** — signup
    previously only wrote to `users`, so any new customer's `Booking`/`Feedback` inserts
    (both `NOT NULL FK → Customer`) failed because the matching `Customer` row never
    existed. `role` is now hardcoded to `'customer'` server-side regardless of what the
    request body sends, closing the self-service-admin-signup hole at the API level (not
    just hiding the UI dropdown).
  - `PUT /` (new) — fixes a second pre-existing bug: `customer_tab/Profile.tsx` already
    called this endpoint and 404'd because it never existed.
  - `POST /provision-staff` (new) — admin-only staff creation. Inserts `Employee` +
    `users` together in a transaction; only `Role='Manager'` gets manager-tier dashboard
    access, every other role lands on the employee dashboard (flagged simplification —
    revisit if a non-manager role ever needs elevated access).
- `backend/src/routes/customers.ts` (new) — `GET /search`, `POST /insert`, `PUT /update`,
  copying `employees.ts`'s established shape. Registered in `index.ts`.

**Verified live** (curl against the running dev server, connected to live Supabase):
signup creates a real linked `Customer` row; a forged `role:"admin"` in the signup body
still lands as `customer`; profile `PUT` updates persist; staff provisioning creates a
linked `Employee` (with `Role`/`Department`) + `users` row and returns a working
`loginId`. Test rows cleaned up after verification.

---

## ✅ Step 3 — Remaining backend routes

**Built:**
- `backend/src/routes/inventory.ts` (new) — joined to `Facility` so one route serves both
  the admin/manager CRUD view and the public cross-store inventory search ("Overview.md"'s
  "common all store Inventory search engine"). `GET /search` supports filtering by
  `type` (the joined `Facility.Type`) so a lounge-only or shop-only search is one query
  param. Registered in `index.ts`.
- `backend/src/routes/flights.ts` — added `origin`/`destination` filters to `GET /search`
  and params to `POST /create` / `PUT /update`. No changes needed for "flight status" or
  "dashboard for all flights" — those already worked via existing `flight_number` search
  and an unfiltered `/search` call.
- `backend/src/routes/bookings.ts` — `aadhaar_no` → `customer_id` throughout;
  `facility_id`/`flight_id` are now a validated exclusive arc on create; `employee_id` is
  optional (self-service bookings); new `PUT /checkin` route (guarded to flight bookings
  only — a lounge booking has nothing to check in to); `PUT /status` simplified to key on
  `booking_id` alone now that it's the sole PK.
- `backend/src/routes/feedback.ts` — `aadhaar_no` → `customer_id` throughout.
- `backend/src/routes/incidents.ts` — accepts `reported_by` (employee) **or**
  `reported_by_customer_id` (customer complaint), validated as exclusive; `assigned_to`
  defaults to the target facility's manager when omitted (the assignment-engine logic).

**Bug found and fixed during this step:** `bookings.ts`'s `POST /create` used
`date_time || null` — when the caller doesn't supply a timestamp, that sends an *explicit*
`NULL` to Postgres, which overrides the column's `DEFAULT NOW()` and trips the `NOT NULL`
constraint. This already existed in the original code (the admin booking form's
`date_time` field defaults to `""`, hitting the same path) but blocked the new
self-service flight booking flow outright, since there's no "when did you book this" input
for a customer to fill in. Fixed to `date_time || new Date().toISOString()`, matching the
pattern `feedback.ts`/`incidents.ts` already used correctly.

**Verified live:** flight search by origin/destination; inventory search by item name and
by facility type; a self-service flight booking (no `employee_id`) create → check-in →
`Checked_In` flips; checking in a lounge booking is correctly rejected; a customer
complaint auto-assigns to the correct facility manager.

---

## ✅ Step 4 — Frontend identity fixes + route guards

**Built:**
- `frontend/src/types/index.ts` — `User.aaddhaar_no` replaced with `customerId`/
  `employeeId`; `Booking`/`Feedback` use `customer_id`; new `Customer` interface; new
  exported `EMPLOYEE_ROLES`, `DEPARTMENTS`, `DASHBOARD_PATH` constants (shared instead of
  copy-pasted across the 3+ components that need them).
- `frontend/src/components/LoginSignUp.tsx` — Aadhaar input and the role `<select>`
  removed entirely; signup now collects Age/Sex/Nationality and always submits
  `role: 'customer'`; login redirect now switches on the user's actual `role` field
  (via the shared `DASHBOARD_PATH` map) instead of substring-matching the loginId string.
- `frontend/src/components/customer_tab/Booking.tsx` — `aadhaar_no` → `customerId`; **the
  dead `/bookings/update_customer` and `/bookings/delete_customer` URLs fixed to the real
  `/bookings/update` / `/bookings/delete`** (a third pre-existing bug — customer-side
  booking edit/delete 404'd before this).
- `admin_tab/BookingsTab.tsx`, `admin_tab/FeedbackTab.tsx` — "Aadhar(r) No" search field,
  table column, and form field renamed to "Customer ID" throughout.
- `EmployeeHome.tsx` — `Aadhaar_No` booking field → `Customer_Id`; added read-only
  `Department` to the profile view.
- `ManagerHome.tsx` — `Aadhaar_No` fields → `Customer_Id` in bookings/feedback; **added a
  real `inventory` entry to `entitySchemas`** (the sidebar only renders from
  `entitySchemas`'s keys — `entityIcons`/`entityLabels` already referenced an `inventory`
  key, but nothing backed it, so the tab silently rendered nothing before this); expanded
  the `employees` Role options to the full hierarchy via `EMPLOYEE_ROLES` and added a
  `Department` field.
- `frontend/src/components/RequireAuth.tsx` (new) — wraps the 4 dashboard routes in
  `App.tsx`. No `currentUser` → redirect to `/login`; wrong role → redirect to that user's
  own dashboard. **Closes a real gap**: previously any of `/AdminHome`, `/ManagerHome`,
  `/EmployeeHome`, `/CustomerHome` was reachable directly by URL with zero auth check.
- `App.tsx` — added a `/login` route (alongside the existing `/` and `/LoginSignup`,
  which still point at `LoginSignUp` for now — full consolidation happens in step 5 when
  Landing replaces `/`). All 4 dashboard routes wrapped in `RequireAuth`.
- Fixed the same bug in all 4 dashboards (`AdminHome`, `ManagerHome`, `EmployeeHome`,
  `CustomerHome`): the logout button called `navigate('/LoginSignUp', ...)` (capital
  S/U), which never matched the registered `/LoginSignup` path — logout silently went
  nowhere. All four now navigate to `/login`.

**Verified live, in a real browser** (chrome-devtools MCP, not just curl): unauthenticated
visit to `/AdminHome` redirects to `/login`; full signup → real `Customer` row created →
login with the generated `loginId` → lands on `/CustomerHome`, zero console errors;
logout correctly returns to `/login`; the booking-creation modal shows no Aadhaar field.

**Typecheck:** `npx tsc --noEmit` clean on both `backend/` and `frontend/` after every
step in this phase.

---

## ✅ Post-step-4 hardening pass

A validation pass (code-review + security-review + ponytail-audit, each run against commit
`4449691`) found real bugs and two security holes in steps 1-4's own work before step 5
started. All fixed, both `npx tsc --noEmit` clean throughout:

- **`URLSearchParams` stringifies JS `null` to the literal text `"null"`** — every booking
  and incident edit form spreads a fetched row (which always has one side of an exclusive
  arc as real `null`) into `formData`, so saving any existing booking/incident 500'd, and
  creating a new admin booking 400'd. Fixed at all 4 sites (`admin_tab/BookingsTab.tsx`,
  `admin_tab/IncidentTab.tsx`, `customer_tab/Booking.tsx`, `ManagerHome.tsx`) by filtering
  null/undefined out of `formData` before building the query string.
- **`ManagerHome.tsx`'s generic entitySchemas form used PascalCase `field.name` as the
  literal form/query key** (`Name`, `Role`, ...) while every backend route expects lowercase
  (`name`, `role`) — every create 400'd, every edit silently no-op'd. Fixed by lowercasing
  the key in `renderForm`. Also: `Facility_Id`/`Customer_Id` were marked non-editable and
  hidden from the create form entirely for bookings/inventory/staff_schedule, so those
  entities could never be created via this UI regardless — now editable.
- **`EmployeeHome.tsx`'s Profile tab fetched an unfiltered employee list** and showed
  `data[0]` as "your profile" — any employee saw (and could overwrite) whichever employee
  row the DB returned first. Now scoped to `?employee_id={currentUser.employeeId}`.
- **`PUT /bookings/update` and `PUT /incidents/update` never re-validated the exclusive-arc
  constraint** that `POST /create`/`POST /insert` already enforce — an update touching one
  side left both non-null, surfacing as a raw 500 instead of a clean 400. Fixed with the
  same check, and the newly-set side now auto-nulls the other.
- **`GET /bookings/summary` inner-joined `facility`/`employee`**, both made nullable by this
  same restructure (flight bookings have no facility, self-service bookings have no staff)
  — flight and self-service bookings silently vanished from the report. Now `LEFT JOIN`.
- **`employees.ts` never accepted/persisted `Department`**, even though `ManagerHome.tsx`'s
  Employees tab (added in step 4) shows an editable Department field — edits silently
  dropped. Fixed; also syncs the linked login's `users.role` (manager vs. employee
  dashboard tier) whenever `Employee.Role` crosses the Manager boundary, closing a gap the
  step 2 note already flagged ("revisit if a non-manager role ever needs elevated access").
- **`users.ts`'s two transactions (signup, provision-staff) had an unguarded `ROLLBACK`**
  inside their `catch` block — if the pooled connection itself had dropped, the ROLLBACK
  call could throw uncaught, and since Express 4 doesn't catch async rejections, that risked
  crashing the whole process, not just failing the one request. Fixed: `pool.connect()`
  moved inside the `try`, `ROLLBACK` wrapped in its own guarded `try/catch`.
- **Security — unauthenticated account takeover via `PUT /users`**: `login_id` is a
  guessable `{contactNumber}_{role}` string, not a secret, and the route let anyone
  overwrite any account's password with no ownership check. Compounding factor:
  `GET /users` also returned the plaintext password, so a naive "require current password"
  fix would've been defeated by fetching it first. Fixed properly: `GET /users` no longer
  returns `password` at all; a new `POST /users/login` does the comparison server-side
  (login flow moved off client-side compare in `LoginSignUp.tsx`); `PUT /users` now requires
  and verifies `currentPassword`; `customer_tab/Profile.tsx` gained a real "current password"
  field distinct from the optional "new password" one.
- **Security — unauthenticated privilege escalation via `POST /users/provision-staff`**:
  commented "admin-only" but enforced nothing, letting anyone mint a `Manager`-tier login.
  Fixed: requires `adminLoginId`/`adminPassword` in the body, verified server-side against
  an account with `role='admin'` before provisioning proceeds. (No frontend caller exists
  yet — step 10 will need to send these two fields.)
- **New migration** `database/migrations/0002_customer_contact_unique.sql` adds
  `UNIQUE (Contact_No)` on `Customer` — Aadhaar used to guarantee one row per person; the
  surrogate `Customer_Id` dropped that guarantee entirely. **Not yet applied** — see below.
- **Passwords are now hashed**, not stored in plaintext. Added `bcryptjs` (pure-JS, no
  native compilation — picked over `bcrypt` to avoid a build-toolchain dependency on
  Windows). `POST /` (signup) and `POST /provision-staff` hash on insert; `POST /login`
  and the `currentPassword`/`adminPassword` checks compare via `bcrypt.compare`; changing
  a password through `PUT /users` hashes the new value before storing. New migration
  `database/migrations/0003_pgcrypto.sql` enables `pgcrypto` (so `seed_users.sql` can
  produce bcrypt-compatible hashes in pure SQL via `crypt()`/`gen_salt('bf')`) and
  idempotently re-hashes any pre-existing plaintext password still in the `users` table —
  necessary because `seed_users.sql`'s `ON CONFLICT (login_id) DO NOTHING` won't touch
  rows that already exist. **Not yet applied** — see below. `seed_users.sql` updated to
  seed hashed passwords (plaintext values for login are in comments next to each insert).
- Deleted dead code found along the way: `PUT /bookings/status` (unused, superseded by
  `PUT /bookings/update`), `database/wrong_queries.sql` and `database/Show_tables.sql`
  (scratch/experiment files, not part of the live schema).

**Verified live** (chrome-devtools MCP + curl, once DB connectivity was restored on a
later retry — the IPv6 issue above turned out to be resolvable, not a hard blocker):
migrations `0002` and `0003` applied cleanly (no pre-existing duplicate `Contact_No`
values, plaintext passwords re-hashed). All 4 seeded roles log in via the new
`POST /users/login`. Admin: booking create + edit, incident edit. Manager: Employee
Department edit persists, Employee create, Inventory create (Facility ID field now
enterable). Employee: Profile tab shows the correct employee (30), not employee 1.
Customer: profile edit rejects empty/wrong `currentPassword` (400/403) and accepts the
correct one, with `GET /users` confirmed to no longer return `password` at all; self-service
booking create. `provision-staff` rejects missing creds (400), wrong admin password (403),
and a valid-but-non-admin account (403), accepts correct admin creds (201).
`GET /bookings/summary` now includes a self-service booking (`employee_name: null`) that
the old `INNER JOIN` would have dropped. `PUT /bookings/update` cleanly rejects a
facility_id+flight_id conflict with 400 instead of a raw 500.

**One more bug found during this pass** (not in the original diff — a pre-existing issue the
casing fix exposed by making creation reachable at all): `ManagerHome.tsx`'s "Create New"
button seeded `formData` as `{}`. A `<select>` with no value matching an option still
*visually* shows its first `<option>` (browser default), but React's controlled state stays
unset until the user manually touches the dropdown — so Employee creation 400'd with `role`
silently missing from the request, even though the form visibly showed "Manager" selected.
Fixed by pre-seeding `formData` with each select field's first option when opening the
create form, so the submitted state matches what's already shown.

---

## ✅ Step 5 — Landing page (+ Step 8 folded in)

Repurpose the dead stub `frontend/src/pages/Home.tsx` (10 lines today, linked from
nowhere) → `frontend/src/pages/Landing.tsx`, mounted at `/`. Public (no `RequireAuth`),
but reads `currentUser` from localStorage (same source `RequireAuth` already uses) to
decide, per section, whether to show the logged-out or logged-in version — this is a
content branch, not a route guard. Sections:
1. Flights — embeds `<SearchFlights />` directly (reuse, not rebuild); that component
   gains `origin`/`destination` inputs to match the backend's new filters. Logged out:
   read-only results. Logged-in customer: each result gains a "Book This Flight" button
   (this is Step 8, landing here instead of a separate page/tab).
2. Lounge information — `GET /facilities/search?type=Lounge`, showing the new
   `Description` field as benefits copy. Same logged-in-customer "Book This Lounge" button.
3. Navigation — `GET /facilities/search` (unfiltered) grouped by `Type`, plus a static
   to/from-airport paragraph (no map, per decision #4). Not auth-dependent.
4. Inventory/store search — hits the new `GET /inventory/search?item_name=...`. Not
   auth-dependent.
5. "What you get" cards. Logged out: static teasers (Book flights & lounges / Online
   check-in / Report an issue), each routing to `/login`. Logged-in customer: the same 3
   slots become real widgets — My Bookings (Step 8's booking list), Check-in (Step 9),
   Report an Issue (Step 7's complaint form + history). Build these as slot-in components
   from the start so 7/8/9 don't require reworking Landing later.
6. Header — Login/Signup CTAs when logged out; "Hi, {name}" + Logout when logged in.
   Profile editing is NOT a Landing section — reachable via the header (dropdown or a
   lightweight `/profile` route reusing `customer_tab/Profile.tsx` as-is), since it's
   account settings, not an airport-services feature.

Also: collapse `App.tsx`'s route table — `/` → `Landing`, drop the now-redundant
`/LoginSignup` registration (keep `/login` as the only canonical path). Remove the
`/CustomerHome` route and its `RequireAuth` wrapper entirely; repoint
`DASHBOARD_PATH.customer` (in `types/index.ts`) to `/`. No layout-jump on login — logging
in re-renders the same page with more content, not a redirect to a different-looking one.

**Built:** all 6 sections above, plus a design pass per the glassmorphism/dimensional-
layering direction agreed on (light glass — 0.78-0.92 opacity, not the classic 10-30%,
to keep text contrast — for hero/lounge/CTA cards over the gradient background; solid
elevated cards with no blur for data-dense areas: flight/inventory results and the
facility directory). New `frontend/src/components/landing/` holds `LoungeSection.tsx`,
`NavigationSection.tsx`, `InventorySection.tsx`, `MyBookings.tsx`. `ds.ts` gained `colors`,
`elevation`, `landing` style tokens, plus `useScrolled` and a native-`IntersectionObserver`
`useReveal` hook (no animation library added) for scroll-reveal, respecting
`prefers-reduced-motion`. `SearchFlights.tsx` restyled in place, gained origin/destination
inputs and the booking button. Deleted now-dead `pages/Home.tsx`,
`components/CustomerHome.tsx`, `customer_tab/Booking.tsx` (superseded by
`landing/MyBookings.tsx`), `customer_tab/Facilities.tsx` (superseded by Landing's
Navigation section) — `customer_tab/Profile.tsx` survives, now routed directly at
`/profile`. Added `Flight.flight_id` and a new `Inventory` interface to `types/index.ts`
(both were missing despite the backend already returning them).

**Scope note:** Report-an-Issue (Step 7's customer half) renders as a "Coming soon"
placeholder in the "what you get" slot — a real, separate feature with its backend
interaction already built, just not wired into a UI yet. My Bookings (part of Step 8) is
fully wired since it's the natural companion to the booking buttons. Check-in (Step 9)
is also fully wired — done later, as a per-row action inside My Bookings rather than its
own slot (see Step 9 below).

**Verified live in a real browser** (chrome-devtools MCP): logged-out and logged-in
(customer) states, desktop (1440px) and mobile (390px) widths, scroll-reveal and sticky
glass header confirmed via DOM inspection (a full-page screenshot's stitching made both
look broken in static captures — false alarms). Two real bugs caught by this and fixed:
fetch responses weren't guarded against non-array error bodies (crashed the whole page on
any API failure — now falls back to `[]`), and empty result sets rendered nothing instead
of a message. `npx tsc --noEmit` clean throughout. **Verified against live data** —
connectivity was fixed by switching `DATABASE_URL` to Supabase's transaction pooler
(`aws-1-ap-southeast-1.pooler.supabase.com:6543`, see `DatabaseConnectivity.md`); real
flights/lounges/directory/inventory rows confirmed rendering correctly.

## ⏳ Step 6 — Inventory admin/manager UI

New `admin_tab/InventoryTab.tsx` (copy `FacilityTab.tsx`'s shape: search form + table +
modal). `ManagerHome.tsx`'s `entitySchemas.inventory` entry (added in step 4) already
points at the real endpoint, so the generic renderer should work with no further backend
or schema changes — this step is the dedicated admin tab UI on top of that.

## ⏳ Step 7 — Incident/complaint extension (UI)

Update `admin_tab/IncidentTab.tsx` for the dual reporter type (employee vs. customer) and
the new `Assigned_To` column. New component (not a `CustomerHome` tab — renders inside
Landing's "Report an Issue" slot, per decision #8): lists a customer's past complaints
(`GET /incidents/search?reported_by_customer_id=...`) and a small form (Facility
`<select>`, Description) posting to `/incidents/insert` with `reported_by_customer_id`.

## ⏳ Step 8 — Flight/lounge booking confirmation UI

"Book this flight"/"Book this lounge" actions embedded directly in Landing's Flights and
Lounge sections for logged-in customers (`POST /bookings/create` with `flight_id` or
`facility_id`), plus a "My Bookings" widget in Landing's "what you get" slot listing the
customer's own bookings (reuses `customer_tab/Booking.tsx`'s list/edit logic, adapted to
render inside Landing rather than `CustomerHome`).

## ✅ Step 9 — Check-in tab (done, folded into My Bookings)

Built as a "Check In" button directly on each qualifying row inside the existing
`MyBookings` widget, not a separate component/slot as originally planned — My Bookings
already listed each flight booking's `checked_in` status, so a standalone "Check-in"
widget would've just been a second view over the same rows. Button renders only for
`flight_id` bookings where `checked_in` is false, calls `PUT /bookings/checkin`, refetches
the list on success (button disappears, status line flips to "Checked in"). The
placeholder "Check-in" card in Landing's account section was removed accordingly.

## ⏳ Step 10 — Admin staff-provisioning UI

Enhance `admin_tab/EmployeeTab.tsx`'s existing "Create" form with `contact_number`,
`department`, `initial_password` fields, repointing its submit to the already-built
`POST /users/provision-staff` (step 2). Expand the Role/Department `<select>` options in
`EmployeeTab.tsx` to the shared `EMPLOYEE_ROLES`/`DEPARTMENTS` constants (already added in
step 4's `types/index.ts`, already wired into `ManagerHome.tsx` — `EmployeeTab.tsx` is the
one file still using the old 6-value inline array).

---

## Out-of-scope extension points (per the decisions above)
- **Cab booking**: `Booking` is already facility/flight-agnostic. Phase 2 is a new
  `Facility.Type='Cab'` value, or a third nullable target column — no infrastructure
  built now.
- **Google OAuth**: no placeholder columns added speculatively. A future phase adds
  nullable `oauth_provider`/`oauth_id` to `users` then.
- **Interactive maps**: Navigation uses `Facility.Location` text only.
- **Crew/cargo/hangar/fuel/food/private jets**: not modeled. `Flight` only gained
  `Origin`/`Destination`.

## Verification checklist for the remaining steps

1. Landing page: visit `/` logged out — flight search, lounge info, navigation, inventory
   search all render and return data without auth; "what you get" cards route to `/login`.
2. Landing page, logged in as customer: same visit to `/` (no redirect) now shows "Book
   This Flight"/"Book This Lounge" buttons and the "what you get" slots replaced by real
   My Bookings (check-in included as a per-row action) / Report an Issue widgets.
3. Inventory admin UI: create/edit/delete an item as admin or manager, confirm it shows
   up in the public landing-page search.
4. Complaint flow end-to-end: file a complaint as a customer from Landing's Report-an-Issue
   widget, confirm it appears in `admin_tab/IncidentTab.tsx` with `Assigned_To` populated.
5. Flight booking UI: search a flight, book it as a logged-in customer from Landing's "Book"
   action, confirm it appears in Landing's My Bookings widget.
6. ~~Check-in UI: check in a flight booking from Landing's Check-in widget, confirm
   `Checked_In` flips and a lounge booking shows no check-in option.~~ Done and
   **verified live**: created a real flight booking, clicked Check In in the browser,
   confirmed `checked_in` flipped to `true` via the API and the button correctly
   disappeared from the UI afterward. Lounge bookings correctly show no check-in option
   (guarded on `flight_id`).
7. Staff provisioning UI: create a new staff member with a Department from the admin UI,
   confirm the generated `loginId` logs in and lands on `EmployeeHome` with Department
   visible on the profile tab.
