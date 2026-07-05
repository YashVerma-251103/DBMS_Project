# Employee

> Last verified: 2026-07-05, against the codebase at commit `4a6574b`.

## Who this is

Any staff member an Admin provisions with a job title *other than* "Manager" — see
[admin.md](admin.md) for how accounts get created. That covers a wide range of actual job
titles (Pilot, Security, Cleaner, Air Traffic Control Employee, Store Staff, and 16 others —
the full list lives in `EMPLOYEE_ROLES` in `frontend/src/types/index.ts`), but **every one of
them gets the identical dashboard and capabilities described here**. A Pilot and a Cleaner
see exactly the same thing in this app — only the "Manager" job title gets a different,
bigger dashboard ([manager.md](manager.md)).

## Logging in

Login ID + password (issued to you by an Admin when your account was created — you don't
sign yourself up). On success you land on Landing (`/`) with a "Welcome back" card and a
**Go to Employee Dashboard** button. The dashboard itself is a separate page (`/EmployeeHome`)
because it's dense operational tables, not something that fits a scrolling consumer page —
but Landing is still your actual home; there's a **Back to Landing** link in the dashboard's
sidebar to get back.

## What you can do

Three tabs, and that's the complete list — Incidents, Staff Schedule, Feedback, and
Inventory management exist in this app but are not available to this role at all.

- **Profile** (default tab on login) — view your Employee ID, Role, and Department; **edit
  your Name and Shift Timings**. Role and Department are shown but locked — if your job
  title or department changes, that's an Admin edit, not a self-service one.
  - There's no password-change option on this screen. If you need your password changed,
    that goes through an Admin.
- **Facility** — view every facility in the system (name, type, location, contact, hours,
  which manager runs it). Read-only, no edit controls.
- **Bookings** — view every booking in the system (facility, customer, date/time, payment
  status) — not filtered down to your own bookings or the facility you work at, it's
  everything. Read-only, no edit controls.

## Things worth knowing

- **Facility and Bookings show the whole system, not just "yours"** — there's no
  facility-level or booking-level scoping for this role. If that surprises you, it's
  current behavior, not a bug in your specific account.
- The sidebar always displays your role label as "Staff", even if your actual job title
  (visible on the Profile tab) is something more specific like "Pilot" or "Security" — that
  label is just generic dashboard chrome, not your real title.
- Logout fully clears your session and returns you to a logged-out Landing page.
