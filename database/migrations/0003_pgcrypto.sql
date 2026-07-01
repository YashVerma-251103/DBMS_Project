-- Lets seed_users.sql hash test-account passwords with crypt()/gen_salt('bf') so they're
-- valid bcrypt hashes the app's bcryptjs-based login can verify — SQL has no other way to
-- produce a bcrypt hash without a round-trip through Node.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Any users row seeded/signed-up before this migration still has a plaintext password —
-- seed_users.sql's ON CONFLICT DO NOTHING won't touch existing rows, so hash them here.
-- Idempotent: only rewrites rows whose password isn't already a bcrypt hash.
UPDATE users
SET password = crypt(password, gen_salt('bf'))
WHERE password !~ '^\$2[aby]\$';
