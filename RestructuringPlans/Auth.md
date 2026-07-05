# Logging-in and signing up

> **Status: superseded by Implementation.md decision #1.** Google OAuth was deferred, not
> built — the actual v1 is contact-number + password only, self-service signup for
> Customers. Left below as the original brief; `users/customer.md` documents current
> behavior.

## User (can use any method)
- Google OAuth
- Account Creation using Email and Mobile Number with password
### Compulsory info:
- Name, Age, Sex, Nationality. (Actual: Name/Contact/Age are required; Sex and
  Nationality ended up nullable in the schema and are optional in the signup form.)

## Admin & staff
### creation Order:
- Admin or creation engine takes input of details of new staff member
- engine creates id and inserts the record in the database.