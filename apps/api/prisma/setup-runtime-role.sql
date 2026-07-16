-- ==========================================================
-- SEAPEDIA — Restricted Runtime Role Setup
-- Run once as a superuser (postgres) after `prisma migrate deploy`
-- This role is used by the application (DATABASE_URL).
-- The migration role (seapedia) retains superuser DDL privileges.
-- ==========================================================

-- 1. Create the restricted runtime role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_runtime_test') THEN
    CREATE ROLE app_runtime_test WITH LOGIN PASSWORD 'password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END
$$;

-- 2. Grant schema usage and DML (no DDL) on all current tables
GRANT USAGE ON SCHEMA public TO app_runtime_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_runtime_test;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_runtime_test;

-- 3. Ensure future tables also get DML grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_runtime_test;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_runtime_test;

-- 4. Verify the role is NOT superuser and NOT bypassrls
-- Expected: rolsuper = false, rolbypassrls = false
SELECT rolname, rolsuper, rolbypassrls
FROM pg_roles
WHERE rolname = 'app_runtime_test';
