# Customer

> Last verified: 2026-07-05, against the codebase at commit `4a6574b`.

## Who this is

Anyone who signs up through "Sign Up" on the Landing page. This is the only role that
can self-register — Admin, Manager, and Employee accounts are all created *for* someone
by an Admin (see [admin.md](admin.md)).

## Getting an account

1. Click **Sign Up** (header, or any "Sign In" prompt on the page) — opens a modal, doesn't
   navigate anywhere.
2. Fill in: Full Name, Contact Number, Age (all required), Sex and Nationality (**optional**
   — the database allows either to be left blank), and a password.
3. On submit, the login ID is generated as `{contactNumber}_customer` and shown on screen,
   then the modal drops you straight into the Login tab with that ID pre-filled — just add
   the password you picked.

There's no email verification, no OAuth — this is a self-service form directly against the
database, nothing more.

## Logging in

Login ID + password, via the same modal (Login tab). On success you land on `/` — Landing
— exactly where you already were if you opened the modal from there. There is no separate
"customer home page"; Landing **is** the customer's account.

## What you can do

Everything lives on the Landing page as scrollable sections. Nothing here requires being
logged in to *view* — only booking, check-in, and reporting issues need an account.

- **Search flights** — by flight number, airline, origin, destination, or departure date.
  Results show live status (On Time / Delayed / Cancelled / Departed / Arrived).
- **Book a flight** — appears as a button on each search result once logged in.
- **Browse lounges** — every lounge, its location and hours, with a **Book This Lounge**
  button once logged in.
- **Browse the directory** — every facility grouped by type (Gym, Lounge, Restaurant, Shop,
  Other), plus general getting-to/from-the-airport info. View-only, no booking here.
- **Search the shop** — one search box across every store's inventory, returns item name,
  price (if set), and which store/location carries it. Search-only — there's no purchase
  flow, this just tells you where to find something.
- **My Bookings** — lists every booking you've made (flights and lounges together), each
  showing date/time and payment status.
  - **Check In**: appears per-row, only on flight bookings that aren't checked in yet.
  - **Cancel**: the trash icon on any booking, asks "Cancel this booking?" before deleting
    it outright — there's no "pending cancellation" state, it's gone immediately.
- **Report an Issue** — pick a facility from a dropdown, describe what's wrong, submit.
  Past reports you've filed show below with their status (Reported / In Progress /
  Resolved) — this is the same incident an Admin sees and resolves on their end.
- **Edit your profile** — Name and Contact Number are editable; Login ID and Role are shown
  but locked. You can also set a new password here.

## Things worth knowing

- **Any profile change requires your current password**, even if you're not changing your
  password — it's how the server confirms it's really you (there's no active session token
  to check instead). Leave "New Password" blank to keep your existing one.
- **Cancelling a booking is immediate and has no undo** — the confirm dialog is the only
  safety net.
- Age is required at signup and can't currently be left blank (Sex and Nationality can).
  There's no way to edit Age, Sex, or Nationality after signup from the UI.
- The header's "Hi, {name}" is a real link for you specifically — it opens your profile.
  (For staff roles it's just a label, not a link — see the other role docs.)
- If you ever land on a staff dashboard URL directly (typing `/AdminHome` into the address
  bar, say), you'll be bounced back to `/` — that's expected, not a bug.
