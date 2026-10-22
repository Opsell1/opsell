-- A Demo Organization's seed is fixed with its flag: Reset regenerates from the same seed.
CREATE OR REPLACE FUNCTION organizations_is_demo_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
    RAISE EXCEPTION 'organizations.is_demo cannot be changed' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.demo_seed IS DISTINCT FROM OLD.demo_seed THEN
    RAISE EXCEPTION 'organizations.demo_seed cannot be changed' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER organizations_is_demo_immutable ON organizations;--> statement-breakpoint
CREATE TRIGGER organizations_is_demo_immutable
  BEFORE UPDATE OF is_demo, demo_seed ON organizations
  FOR EACH ROW EXECUTE FUNCTION organizations_is_demo_immutable();--> statement-breakpoint

-- The mock data source serves Demo Organizations only (ADR 0005). The API and worker refuse it
-- first; this keeps its rows out of a regular Organization even if that check were bypassed.
CREATE FUNCTION mock_source_only_in_demo() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.source = 'mock' AND NOT EXISTS (
    SELECT 1 FROM organizations WHERE id = NEW.organization_id AND is_demo
  ) THEN
    RAISE EXCEPTION 'the mock data source serves only Demo Organizations'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER locations_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint
CREATE TRIGGER positions_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint
CREATE TRIGGER employees_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint
CREATE TRIGGER sales_orders_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint
CREATE TRIGGER time_entries_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint
CREATE TRIGGER tip_entries_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON tip_entries
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint
CREATE TRIGGER source_backfills_mock_source_only_in_demo BEFORE INSERT OR UPDATE ON source_backfills
  FOR EACH ROW EXECUTE FUNCTION mock_source_only_in_demo();--> statement-breakpoint

-- The platform audit log is append-only for the API and worker: the default privileges from
-- 0001 granted them UPDATE and DELETE on every new table, so take those back here.
REVOKE UPDATE, DELETE, TRUNCATE ON platform_audit_log FROM opsell_app;
