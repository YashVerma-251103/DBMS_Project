-- Aadhaar used to guarantee one Customer row per real person. The surrogate Customer_Id
-- (0001_baseline.sql) dropped that guarantee entirely, so the same person could sign up
-- repeatedly and fragment their booking/feedback history across duplicate rows.
-- Contact_No is the closest thing to a natural key left on Customer, so it becomes the
-- uniqueness anchor going forward.
--
-- If this fails on live data, there are already-duplicate Contact_No rows to resolve first
-- (merge or delete the extras) before re-running the migration.

ALTER TABLE Customer ADD CONSTRAINT customer_contact_no_unique UNIQUE (Contact_No);
