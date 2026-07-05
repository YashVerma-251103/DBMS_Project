# Manager

> Last verified: 2026-07-05, against the codebase at commit `4a6574b`.

## Who this is

A staff member provisioned by an Admin with the job title "Manager" — see
[admin.md](admin.md) for how staff accounts get created. This is the one job title that
gets its own dashboard instead of the plain [Employee](employee.md) one.

## Logging in

Login ID + password (issued by an Admin). You land on Landing (`/`) with a "Welcome back"
card and a **Go to Manager Dashboard** button. The dashboard is a separate page
(`/ManagerHome`) for the same reason every staff dashboard is: dense CRUD tables don't fit
a scrolling consumer page. There's a **Back to Landing** link in the sidebar to get back.

## What you can do

Seven tabs: **Facility, Employees, Bookings, Feedback, Revenue, Inventory, Staff Schedule.**

Every tab loads the **entire system's data for that entity — not scoped to any one
facility.** There is a `Manager_Id` field on Facility and Feedback, but nothing filters by
it; you see and can edit every facility, not just one you're notionally responsible for.
Keep that in mind before assuming "my facility" means anything here.

| Tab | Create | Edit | Delete | Notes |
|---|---|---|---|---|
| **Facility** | No | Yes | No | Name, Type, Location, Contact No, and Opening Hours are editable. Facility Id and Manager Id are shown but locked. |
| **Employees** | Yes | Yes | No | Name, Role, Department, Shift Timings all editable. **Changing someone's Role to/from "Manager" actually changes their dashboard access** — see gotcha below. |
| **Bookings** | Button shown, but **doesn't work** — see gotcha below | Yes | No | Facility, Customer, Employee, Date/Time, Payment Status editable. |
| **Feedback** | No | Button shown, but every field is locked — effectively read-only | No | View rating/comments per facility. |
| **Revenue** | No | No | No | Fully read-only by design — there's no edit capability for revenue anywhere in the system, for any role. |
| **Inventory** | Yes | Yes | No | Facility, item name, quantity, price, supplier. |
| **Staff Schedule** | Yes | Yes | No | Employee, facility, shift date/start/end, task description. |

**Delete isn't available from this dashboard for anything, on any tab** — even though the
backend supports deleting facilities, employees, bookings, feedback, and inventory. If
something needs to be deleted, that currently has to go through Admin (whose dashboard
does have delete) or directly against the database.

There's no search bar or column filter anywhere in this dashboard — every tab always loads
everything. No confirmation dialogs on Save either; it saves immediately.

## Things worth knowing

- **"Create New" on the Bookings tab currently doesn't work.** It calls an endpoint that
  doesn't exist on the backend, so nothing happens — no error message shown, it just
  silently fails. Booking creation for a customer needs to go through Admin, or the
  customer booking it themselves.
- **The Feedback tab has an Edit button, but every field is locked** — clicking it opens a
  form where nothing is actually changeable. In practice, Feedback is view-only here.
- **Editing an Employee's Role to "Manager" (or away from it) changes what dashboard they
  land on** — this isn't just a label. Their login account's access level updates to match,
  the next time they log in. Treat that dropdown with the same care as a permissions
  setting, not just a job-title field.
- There's no facility-level access restriction — a Manager account can see and edit every
  facility, employee, booking, inventory item, and schedule in the whole system, not a
  scoped subset. If your use case needs "a Manager only sees their own facility," that
  isn't built yet.
