-- The API and worker log in as members of opsell_app, which has no BYPASSRLS and does not own
-- these tables, so Row-Level Security applies to every query they run (ADR 0001).
GRANT USAGE ON SCHEMA public TO opsell_app;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO opsell_app;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO opsell_app;--> statement-breakpoint

-- An Organization is a Demo Organization from creation, forever (ADR 0005).
CREATE FUNCTION organizations_is_demo_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
    RAISE EXCEPTION 'organizations.is_demo cannot be changed' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER organizations_is_demo_immutable
  BEFORE UPDATE OF is_demo ON organizations
  FOR EACH ROW EXECUTE FUNCTION organizations_is_demo_immutable();
