-- Whether an Organization is a Demo Organization, for the policies that confine a Platform Staff
-- context to Demo Organizations (ADR 0006). SECURITY DEFINER, so the check reads the flag
-- without passing through organizations' own policies, which would otherwise recurse through
-- memberships. It reveals only the flag of an id the caller already holds.
CREATE FUNCTION is_demo_organization(organization uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce((SELECT is_demo FROM organizations WHERE id = organization), false);
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION is_demo_organization(uuid) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION is_demo_organization(uuid) TO opsell_app;
