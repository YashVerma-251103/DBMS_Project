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
| 5 | Landing page | ⏳ Pending |
| 6 | Inventory admin/manager UI | ⏳ Pending |
| 7 | Incident/complaint extension (UI) | ⏳ Pending |
| 8 | Flight/lounge booking confirmation UI | ⏳ Pending |
| 9 | Check-in tab | ⏳ Pending |
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

## ⏳ Step 5 — Landing page (next up)

Repurpose the dead stub `frontend/src/pages/Home.tsx` (10 lines today, linked from
nowhere) → `frontend/src/pages/Landing.tsx`, mounted at `/`. Sections:
1. Flights — embeds `<SearchFlights />` directly (reuse, not rebuild); that component
   gains `origin`/`destination` inputs to match the backend's new filters.
2. Lounge information — `GET /facilities/search?type=Lounge`, showing the new
   `Description` field as benefits copy.
3. Navigation — `GET /facilities/search` (unfiltered) grouped by `Type`, plus a static
   to/from-airport paragraph (no map, per decision #4).
4. Inventory/store search — hits the new `GET /inventory/search?item_name=...`.
5. Static "what you get when you sign in" cards (Book flights & lounges / Online check-in
   / Report an issue), each routing to `/login` — the hint-at-logged-in-features section.
6. Header login/signup CTAs, visible throughout.

Also: collapse `App.tsx`'s route table — `/` → `Landing`, drop the now-redundant
`/LoginSignup` registration (keep `/login` as the only canonical path).

## ⏳ Step 6 — Inventory admin/manager UI

New `admin_tab/InventoryTab.tsx` (copy `FacilityTab.tsx`'s shape: search form + table +
modal). `ManagerHome.tsx`'s `entitySchemas.inventory` entry (added in step 4) already
points at the real endpoint, so the generic renderer should work with no further backend
or schema changes — this step is the dedicated admin tab UI on top of that.

## ⏳ Step 7 — Incident/complaint extension (UI)

Update `admin_tab/IncidentTab.tsx` for the dual reporter type (employee vs. customer) and
the new `Assigned_To` column. New `customer_tab/Complaints.tsx`: lists a customer's past
complaints (`GET /incidents/search?reported_by_customer_id=...`) and a small form
(Facility `<select>`, Description) posting to `/incidents/insert` with
`reported_by_customer_id`. Register as a new tab in `CustomerHome.tsx`.

## ⏳ Step 8 — Flight/lounge booking confirmation UI

"Book this flight" action on `SearchFlights.tsx` for logged-in customers
(`POST /bookings/create` with `flight_id`). Lounge booking already works structurally
(step 2's Customer-row fix + step 4's frontend fixes are both live).

## ⏳ Step 9 — Check-in tab

New `customer_tab/CheckIn.tsx`: lists the customer's flight bookings, a "Check In" button
per row (disabled if already `checked_in`) calling `PUT /bookings/checkin`. Register as a
new tab in `CustomerHome.tsx`.

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
   search all render and return data without auth; "sign in for more" CTA routes to
   `/login`.
2. Inventory admin UI: create/edit/delete an item as admin or manager, confirm it shows
   up in the public landing-page search.
3. Complaint flow end-to-end: file a complaint as a customer in the new UI, confirm it
   appears in `admin_tab/IncidentTab.tsx` with `Assigned_To` populated.
4. Flight booking UI: search a flight, book it as a logged-in customer from the new "Book"
   action, confirm it appears in `CustomerHome`'s bookings list.
5. Check-in UI: check in a flight booking from the new tab, confirm `Checked_In` flips and
   a lounge booking shows no check-in option.
6. Staff provisioning UI: create a new staff member with a Department from the admin UI,
   confirm the generated `loginId` logs in and lands on `EmployeeHome` with Department
   visible on the profile tab.
