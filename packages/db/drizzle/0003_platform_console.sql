CREATE TYPE "public"."house" AS ENUM('front', 'back');--> statement-breakpoint
CREATE TYPE "public"."fulfillment" AS ENUM('counter', 'pickup', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('card', 'cash');--> statement-breakpoint
CREATE TYPE "public"."time_entry_approval" AS ENUM('approved', 'pending');--> statement-breakpoint
CREATE TYPE "public"."tip_kind" AS ENUM('card', 'cash_on_payment', 'auto_gratuity', 'declared_cash');--> statement-breakpoint
CREATE TYPE "public"."tip_owner" AS ENUM('location_staff', 'courier');--> statement-breakpoint
CREATE TYPE "public"."data_source" AS ENUM('mock');--> statement-breakpoint
CREATE TABLE "employee_locations" (
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	CONSTRAINT "employee_locations_employee_id_location_id_pk" PRIMARY KEY("employee_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "employee_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"source" "data_source" NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "employees_source_key" UNIQUE("organization_id","source","external_id")
);
--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"house" "house" NOT NULL,
	"source" "data_source",
	"external_id" text,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "positions_organization_name_key" UNIQUE("organization_id","name"),
	CONSTRAINT "positions_source_key" UNIQUE("organization_id","source","external_id")
);
--> statement-breakpoint
ALTER TABLE "positions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" bigint GENERATED ALWAYS AS IDENTITY (sequence name "platform_audit_log_sequence_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"staff_id" uuid NOT NULL,
	"action" text NOT NULL,
	"organization_id" uuid,
	"details" jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform_audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "platform_staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "platform_staff_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"staff_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_staff_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "platform_staff_enrollments_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "platform_staff_passkeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"staff_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"aaguid" text,
	"created_at" timestamp with time zone,
	CONSTRAINT "platform_staff_passkeys_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "platform_staff_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"staff_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "platform_staff_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "platform_staff_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"source" "data_source" NOT NULL,
	"external_id" text NOT NULL,
	"business_date" date NOT NULL,
	"modified_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone NOT NULL,
	"order_type" text NOT NULL,
	"channel_partner" text,
	"fulfillment" "fulfillment" NOT NULL,
	"ordered_at" timestamp with time zone NOT NULL,
	"promised_at" timestamp with time zone,
	"fulfilled_at" timestamp with time zone NOT NULL,
	"gross_cents" integer NOT NULL,
	"discount_cents" integer NOT NULL,
	"net_cents" integer NOT NULL,
	"tax_cents" integer NOT NULL,
	"service_charge_cents" integer NOT NULL,
	"refund_cents" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	CONSTRAINT "sales_orders_source_key" UNIQUE("organization_id","source","external_id")
);
--> statement-breakpoint
ALTER TABLE "sales_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "source_backfills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"source" "data_source" NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	"days" integer NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "source_backfills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"source" "data_source" NOT NULL,
	"external_id" text NOT NULL,
	"business_date" date NOT NULL,
	"modified_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone NOT NULL,
	"employee_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"clock_in_at" timestamp with time zone NOT NULL,
	"clock_out_at" timestamp with time zone,
	"approval" time_entry_approval NOT NULL,
	CONSTRAINT "time_entries_source_key" UNIQUE("organization_id","source","external_id")
);
--> statement-breakpoint
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tip_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"source" "data_source" NOT NULL,
	"external_id" text NOT NULL,
	"business_date" date NOT NULL,
	"modified_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone NOT NULL,
	"kind" "tip_kind" NOT NULL,
	"owner" "tip_owner" NOT NULL,
	"amount_cents" integer NOT NULL,
	"order_external_id" text,
	"employee_id" uuid,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tip_entries_source_key" UNIQUE("organization_id","source","external_id")
);
--> statement-breakpoint
ALTER TABLE "tip_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "source" "data_source";--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "demo_seed" integer;--> statement-breakpoint
ALTER TABLE "employee_locations" ADD CONSTRAINT "employee_locations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_locations" ADD CONSTRAINT "employee_locations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_locations" ADD CONSTRAINT "employee_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD CONSTRAINT "platform_audit_log_staff_id_platform_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."platform_staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD CONSTRAINT "platform_audit_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_staff_accounts" ADD CONSTRAINT "platform_staff_accounts_staff_id_platform_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."platform_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_staff_enrollments" ADD CONSTRAINT "platform_staff_enrollments_staff_id_platform_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."platform_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_staff_passkeys" ADD CONSTRAINT "platform_staff_passkeys_staff_id_platform_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."platform_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_staff_sessions" ADD CONSTRAINT "platform_staff_sessions_staff_id_platform_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."platform_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_backfills" ADD CONSTRAINT "source_backfills_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_entries" ADD CONSTRAINT "tip_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_entries" ADD CONSTRAINT "tip_entries_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_entries" ADD CONSTRAINT "tip_entries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employee_locations_location_id_idx" ON "employee_locations" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "platform_audit_log_sequence_idx" ON "platform_audit_log" USING btree ("sequence");--> statement-breakpoint
CREATE INDEX "platform_staff_accounts_staff_id_idx" ON "platform_staff_accounts" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "platform_staff_enrollments_staff_id_idx" ON "platform_staff_enrollments" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "platform_staff_passkeys_staff_id_idx" ON "platform_staff_passkeys" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "platform_staff_sessions_staff_id_idx" ON "platform_staff_sessions" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "platform_staff_verifications_identifier_idx" ON "platform_staff_verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "sales_orders_location_day_idx" ON "sales_orders" USING btree ("location_id","business_date");--> statement-breakpoint
CREATE INDEX "source_backfills_organization_id_idx" ON "source_backfills" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "time_entries_location_day_idx" ON "time_entries" USING btree ("location_id","business_date");--> statement-breakpoint
CREATE INDEX "tip_entries_location_day_idx" ON "tip_entries" USING btree ("location_id","business_date");--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_source_key" UNIQUE("organization_id","source","external_id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_demo_seed_only_for_demo" CHECK ("organizations"."is_demo" = ("organizations"."demo_seed" is not null));--> statement-breakpoint
CREATE POLICY "locations_staff_only_in_demo" ON "locations" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("locations"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("locations"."organization_id"));--> statement-breakpoint
CREATE POLICY "memberships_staff_only_in_demo" ON "memberships" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("memberships"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("memberships"."organization_id"));--> statement-breakpoint
CREATE POLICY "organizations_platform_read" ON "organizations" AS PERMISSIVE FOR SELECT TO public USING ("organizations"."is_demo" and nullif(current_setting('app.staff_id', true), '')::uuid is not null);--> statement-breakpoint
CREATE POLICY "organizations_create" ON "organizations" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("organizations"."id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "organizations_staff_only_in_demo" ON "organizations" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or "organizations"."is_demo") WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or "organizations"."is_demo");--> statement-breakpoint
CREATE POLICY "employee_locations_tenant" ON "employee_locations" AS PERMISSIVE FOR ALL TO public USING ("employee_locations"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("employee_locations"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "employee_locations_staff_only_in_demo" ON "employee_locations" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("employee_locations"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("employee_locations"."organization_id"));--> statement-breakpoint
CREATE POLICY "employees_tenant" ON "employees" AS PERMISSIVE FOR ALL TO public USING ("employees"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("employees"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "employees_staff_only_in_demo" ON "employees" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("employees"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("employees"."organization_id"));--> statement-breakpoint
CREATE POLICY "positions_tenant" ON "positions" AS PERMISSIVE FOR ALL TO public USING ("positions"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("positions"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "positions_staff_only_in_demo" ON "positions" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("positions"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("positions"."organization_id"));--> statement-breakpoint
CREATE POLICY "platform_audit_log_read" ON "platform_audit_log" AS PERMISSIVE FOR SELECT TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is not null);--> statement-breakpoint
CREATE POLICY "platform_audit_log_append" ON "platform_audit_log" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("platform_audit_log"."staff_id" = nullif(current_setting('app.staff_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "sales_orders_tenant" ON "sales_orders" AS PERMISSIVE FOR ALL TO public USING ("sales_orders"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("sales_orders"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "sales_orders_staff_only_in_demo" ON "sales_orders" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("sales_orders"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("sales_orders"."organization_id"));--> statement-breakpoint
CREATE POLICY "source_backfills_tenant" ON "source_backfills" AS PERMISSIVE FOR ALL TO public USING ("source_backfills"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("source_backfills"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "source_backfills_staff_only_in_demo" ON "source_backfills" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("source_backfills"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("source_backfills"."organization_id"));--> statement-breakpoint
CREATE POLICY "time_entries_tenant" ON "time_entries" AS PERMISSIVE FOR ALL TO public USING ("time_entries"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("time_entries"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "time_entries_staff_only_in_demo" ON "time_entries" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("time_entries"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("time_entries"."organization_id"));--> statement-breakpoint
CREATE POLICY "tip_entries_tenant" ON "tip_entries" AS PERMISSIVE FOR ALL TO public USING ("tip_entries"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid) WITH CHECK ("tip_entries"."organization_id" = nullif(current_setting('app.organization_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "tip_entries_staff_only_in_demo" ON "tip_entries" AS RESTRICTIVE FOR ALL TO public USING (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("tip_entries"."organization_id")) WITH CHECK (nullif(current_setting('app.staff_id', true), '')::uuid is null or is_demo_organization("tip_entries"."organization_id"));