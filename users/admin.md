# Admin

> Last verified: 2026-07-05, against the codebase at commit `4a6574b`.

## Who this is

The top-level role. There's no self-signup for Admin — the first admin account is seeded
directly into the database (see `database/seed_users.sql`); every Manager and Employee
account after that is provisioned *by* an Admin, from inside the Admin dashboard.

## Logging in

Login ID + password. You land on Landing (`/`) with a "Welcome back" card and a
**Go to Administrator Dashboard** button. The dashboard is a separate page (`/AdminHome`)
since it's dense operational tables, not something that fits a scrolling consumer page —
there's a **Back to Landing** link in the sidebar to get back to Landing itself.

## What you can do

Nine tabs, full CRUD on almost all of them:

| Tab | Create | Edit | Delete | What it covers |
|---|:---:|:---:|:---:|---|
| **Flights** | Yes | Yes | Yes | Flight number, airline, departure/arrival time, status, gate, terminal. Flight Number is locked once created — it's the effective identifier. |
| **Facility** | Yes | Yes | Yes | Name, type, location, contact, opening hours, which manager runs it. |
| **Inventory** | Yes | Yes | Yes | Item name, quantity, price (₹), supplier, which facility stocks it. |
| **Bookings** | Yes | Yes | Yes | Facility/flight, customer, employee, date/time, payment status. |
| **Incidents** | Yes | Yes | Yes | See "the dual-reporter pattern" below — this is the shared inbox for issues reported by both staff and customers. |
| **Feedback** | Yes | Yes | Yes | Rating (1–5) and comments per facility/customer. |
| **Revenue** | — | — | — | **Read-only everywhere in this system** — there's no create/edit/delete for revenue at all, for any role. This tab is a filterable report (by facility, date range, monthly/yearly, average/total). |
| **Employee** | Yes | Yes | Yes | See "creating staff" below — this is also where Manager and Employee login accounts get created. |
| **Staff Schedule** | Yes | Yes | Yes | Employee, facility, shift date/start/end, task description. |

Across every tab: every **Delete** asks for confirmation first; **Create** and **Update**
save immediately with no confirmation step. Related records (which facility, which
employee, which customer) are mostly typed in by ID, not picked from a dropdown — you'll
want the relevant tab open in another view if you don't have IDs memorized.

### The dual-reporter pattern (Incidents)

An incident can be reported by a staff member *or* a customer — never both, never neither.
The form enforces this directly: filling in one reporter field clears the other, and
submitting with both empty or both filled is rejected. If you leave "Assigned To" blank,
it's automatically assigned to whoever manages the facility the incident was filed against.

### Creating staff (Employee tab)

Clicking **Add Employee** does two things in one step: it creates the Employee record
*and* provisions their login account — there's no separate "create a login" flow
elsewhere. Because this grants real dashboard access, it asks you to **re-enter your own
admin password** before it goes through. The generated login ID and a temporary password
you set are what you hand to the new hire.

Only the "Manager" job title gets routed to the Manager dashboard — every other job title
(Pilot, Security, Cleaner, and 18 others) lands on the plain [Employee](employee.md)
dashboard with identical capabilities regardless of title.

## Things worth knowing

- **Changing an employee's Role to or away from "Manager" changes their login access, not
  just their job title** — the next time they log in, they'll land on whichever dashboard
  matches the new role. There's no separate confirmation for this; the Role dropdown on the
  Employee tab doubles as an access-level control.
- **Deleting an employee does not delete their login.** Their account survives (they can
  still log in), but it's no longer linked to any Employee record. If you want someone
  fully locked out, deleting their Employee row alone isn't enough.
- **Facility has no way to set or view a description** in this dashboard, even though the
  database has room for one — it's simply not wired into this tab's form or table.
- **Feedback and Bookings accept any Facility/Customer/Manager/Employee ID you type**, with
  no check that the relationship makes sense (e.g. that a customer actually booked that
  facility). Useful for quick fixes, but there's no guardrail against typos creating
  orphaned-looking records.
- Logout clears your session fully and returns you to a logged-out Landing page.
