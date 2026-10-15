# Workforce management integrations

Research for [issue #13](https://github.com/Opsell1/opsell/issues/13), a child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1).
Researched 2026-10-14 against first-party developer docs, OpenAPI specs, help centers, and vendor-published customer counts.
It builds on [First POS integration](https://github.com/Opsell1/opsell/blob/research/first-pos-integration/docs/research/first-pos-integration.md) (issue #4), which chose Toast first, and does not repeat its Toast findings.

## Question

Which workforce management systems (WFM) should the Opsell MVP integrate with, given that many restaurants record clock-in/clock-out times and per-Employee tips there rather than in the POS?
Candidates compared: Harri, 7shifts, Fourth/HotSchedules, Homebase, Deputy, When I Work, Sling, and the WFM side of Toast Payroll & Team Management.
Criteria: adoption among US multi-Location restaurants, API access to timesheets (shifts, hours, breaks, Location worked), per-Employee tips, and the roster, partner requirements, cost, and webhooks vs polling.
Also: when an Organization uses both Toast and a WFM, which system is authoritative for hours, tips, and the roster, and what that means for a source-agnostic adapter.

## Recommendation

The MVP should integrate with **7shifts** and **Harri**, behind the same source-agnostic labor adapter that already serves Toast.

- **7shifts** is the first WFM integration to build.
It is restaurant-only (over 55,000 restaurants), and its API is fully documented in public, with an OAuth partner program, time punch and user webhooks, and per-punch declared tips.
Opsell can design, build, and test against it before any customer signs.
- **Harri** is the second, and the priority for enterprise multi-Location Organizations like the founder's former bakery.
It has the strongest enterprise footprint (70,000+ Locations, 800 corporate clients), and its developer portal has Time & Attendance, Employees, "Pay Sheets and Tips", and webhook APIs.
But its docs are visible only to Harri customers approved by Harri account management, and third-party partnership goes through a "Become a partner" form.
So the Harri integration should be scheduled once Opsell has a design-partner Organization on Harri that can request doc access, while Opsell applies to Harri's partner program in parallel.
- **Toast-native time clocking needs no WFM integration.**
Toast Payroll & Team Management and Sling by Toast write timesheets into Toast, so the Toast labor API from issue #4 already covers them.
- **Not in the MVP:** Fourth/HotSchedules (partner-gated, undocumented export API, enterprise chains), Homebase and When I Work (general small-business tools with weak multi-Location restaurant fit), Deputy (global, cross-industry), and Sling's own API (unofficial, and redundant with Toast).
- **Fallback for any other system:** Opsell's own per-shift tip entry (Senior-sup already enters tips per the map) plus a CSV timesheet import, so an Organization on an unsupported WFM can still run Tip Distribution.

## Comparison

| Criterion | 7shifts | Harri | Fourth / HotSchedules | Homebase | When I Work | Deputy |
|---|---|---|---|---|---|---|
| Segment | Restaurant-only, 55,000+ restaurants | Hospitality, 70,000+ Locations, 800 corporate clients, enterprise brands | Hospitality, 120,000+ Locations (HotSchedules), multi-unit chains | 150,000+ small businesses, cross-industry | 200,000+ workplaces, cross-industry | 390,000 workplaces, global, cross-industry |
| Timesheet API | `/time_punches`: clock in/out, breaks (paid flag), `location_id`, role, department, wage, `approved` | Time & Attendance API and punch export templates (details customer-only) | Time & Attendance API is inbound only (clock data into Fourth); docs not public | `/locations/{id}/timecards`, read-only | `/2/times`: start/end, `location_id`, `site_id`, `is_approved` | Timesheet resource (OAuth) |
| Per-Employee tips | `tips` (declared, cents) per punch; hours-and-wages report with cash, declared, card, auto-gratuity tips | "Pay Sheets and Tips" API; export "Clock-ins, clock-outs and declared tips" | No documented tips API | `cash_tips` per labor record; `credit_tips` Clover only | `cash_tips` per time | Not verified |
| Roster | Users, location assignments, external user mappings | Employees API | Employee API is UK only | `/employees` per Location | `/2/users` | Employee resource |
| Webhooks | `time_punch.*`, `user.*`, `location.*`, `role.*`, `authorization.revoked` | "Webhook Event Notifications" (details customer-only) | Not documented | None documented | Users events documented | Insert/update/delete on most resources |
| Access | OAuth client for vetted partners after onboarding | Docs for approved Harri customers; partner form | Partnerships team, certification | Read-only key per customer, approved by Homebase | Developer key through support | OAuth; Embed needs a commercial agreement |
| Customer plan gate | Non-POS partner categories need The Works (legacy) or higher | Not published | Not published | Not published | Not published | Not published |

## 7shifts in detail

### Adoption

7shifts says it serves "over 55,000 restaurants" ([7shifts about](https://www.7shifts.com/about)).
It is built for restaurants only, which matches Opsell's segment more closely than any other open-API WFM.

### Access and partner requirements

- "OAuth clients are issued only to vetted 7shifts partners"; a customer integrating its own data uses an access token instead ([OAuth authentication](https://developers.7shifts.com/docs/oauth-authentication)).
- Partner onboarding needs a shared technical contact email, the technical contact's name, the company name shown to customers, a logo, and a callback URL that receives the company GUID after a customer grants access ([OAuth authentication](https://developers.7shifts.com/docs/oauth-authentication)).
- Each customer grant yields a company GUID sent as `x-company-guid` on every request; tokens expire after one hour and there is no refresh token yet ([OAuth authentication](https://developers.7shifts.com/docs/oauth-authentication)).
- Scopes come in read/write pairs for companies, departments, locations, roles, users, sales, shifts, time punches, and events ([OAuth authentication](https://developers.7shifts.com/docs/oauth-authentication)).
- No partner fee is published.

### Customer plan gate

During onboarding 7shifts assesses which endpoints a partner uses and sets a minimum customer plan; a company below it is prompted to upgrade, and calls return `403 Forbidden` ([Plan requirements](https://developers.7shifts.com/docs/plan-requirements)).
For OAuth clients outside the POS categories ("All Other Categories"), the minimum is The Works on the legacy plans (Comp, Entrée, The Works, Gourmet) ([Plan requirements](https://developers.7shifts.com/docs/plan-requirements)).
Customers who joined on or after July 2, 2025 are on the new plans (Comp, Essentials, Pro, Premium); the docs do not map "All Other Categories" to a new plan name ([Plan requirements](https://developers.7shifts.com/docs/plan-requirements)).
Per-endpoint minimums: time punches and users need Entrée, worked hours and wages need The Works, company-level webhooks need Gourmet, and OAuth client webhooks and locations need only Comp ([Plan requirements](https://developers.7shifts.com/docs/plan-requirements)).
The Tip Pool manual entries reference lists Entrée as its minimum ([Retrieve Tip Pool Manual Entries](https://developers.7shifts.com/reference/fetchtippoolmanualentry)).
7shifts' list prices are not confirmable from its own pricing page (it renders client-side), so plan prices are left out here.

### Data 7shifts supplies

For hours per Employee per shift and Location:

- `/time_punches` returns `user_id`, `location_id`, `department_id`, `role_id`, `hourly_wage`, `clocked_in`, `clocked_out` (UTC), `breaks` (each with `paid`, `in`, `out`), `approved`, `deleted`, and `pos_type` ([Read time punch data](https://developers.7shifts.com/docs/read-time-punch-data), [List Time Punches](https://developers.7shifts.com/reference/gettimepunches)).
- Worked time is `clocked_out` minus `clocked_in`, without subtracting paid breaks, and 7shifts says to require `approved: true` before using a punch for payroll ([Read time punch data](https://developers.7shifts.com/docs/read-time-punch-data)).
- `pos_type` is "The source of the time punch", for example `toast` when the punch came from Toast or `web` from 7shifts' own apps ([List Time Punches](https://developers.7shifts.com/reference/gettimepunches)).
- Filters cover clock-in range, Location, department, and user; cursor pagination up to 200 per page; 10 requests per second per token ([Read time punch data](https://developers.7shifts.com/docs/read-time-punch-data)).

For tips:

- Each punch has `tips`: "Tips declared for the shift in cents" ([List Time Punches](https://developers.7shifts.com/reference/gettimepunches)).
- The hours-and-wages report returns per shift `regular_hours`, `overtime_hours`, `cash_tips`, `declared_tips`, `credit_card_tips`, `auto_gratuity`, and, when 7shifts tip pooling is on, `tip_in`, `tip_out`, and `earned_tips` ([Hours & Wages report](https://developers.7shifts.com/docs/hours-wages-report)).
Card and auto-gratuity tips there come from a connected POS.
- Tip Pool endpoints expose pool settings, manual entries, and summary and detailed reports ([API index](https://developers.7shifts.com/llms.txt)).
Opsell should read raw declared and manual tips, not 7shifts' pool outputs, because Opsell computes Tip Distribution itself.

For the roster:

- Users, user wages, location assignments, employment records, and external user mappings, which let Opsell store its own ID on a 7shifts user ([API index](https://developers.7shifts.com/llms.txt)).

### Webhooks

Topics include `time_punch.created`, `time_punch.edited`, `time_punch.deleted`, `user.created`, `user.modified`, `user.deactivated`, `user.reactivated`, `location.*`, `role.*`, `department.*`, `schedule.published`, `payroll_period.closed`, and `authorization.revoked` ([Webhooks introduction](https://developers.7shifts.com/reference/webhooks-introduction)).
OAuth partners ask api-support@7shifts.com to configure webhooks; the endpoint must accept unauthenticated POSTs and return 2xx before heavy processing ([Webhooks introduction](https://developers.7shifts.com/reference/webhooks-introduction)).
7shifts prefers webhooks over polling and recommends `time_punch.edited` to learn when punches are approved ([Read time punch data](https://developers.7shifts.com/docs/read-time-punch-data)).
Because webhook requests are unauthenticated, Opsell should treat a webhook as a hint and re-read the punch through the API.

## Harri in detail

### Adoption

Harri reports 70,000+ Locations, 800 corporate clients, 35 million employee profiles, and "6 of the 10 top hospitality brands", with logos including McDonald's, Wendy's, Raising Cane's, Shake Shack, and Cava, and a Jack in the Box rollout across 2,188 Locations ([Harri home](https://harri.ai/)).
It sells bundles to limited-service, full-service, multi-location, franchise, and enterprise operators, and its customer stories include a bakery (Blackbird Bakery) ([Harri home](https://harri.ai/)).
Harri is the enterprise multi-Location leader among these candidates, which is Opsell's target buyer.

### Access and partner requirements

- The Harri developer portal shows "Content is only available to members" on every API page ([Harri Developer Portal](https://developer.harri.com/)).
- Sign-up is for customers: "If you are a Harri customer and would like to access our developer documentation, please sign up below", and Harri's account management team reviews each request ([Sign up](https://developer.harri.com/sign-up/)).
- Vendors use a "Become a partner" form; partnerships are Direct, Referral, or Reseller ([Harri integrations](https://harri.ai/integrations/)).
- Pricing for every Harri bundle is "Custom - contact for pricing", and API terms are not published ([Harri pricing](https://harri.ai/pricing/)).
- No partner fee, timeline, or certification process is published.

### What the portal shows exists

Only titles are public, from the portal's sitemap ([sitemap](https://developer.harri.com/sitemap-posts.xml)):

- API sections: Authentication, Employer, Employees, Clocks, Pay Sheets and Tips, Webhook Event Notifications, and a "time attendance API" tag.
- Export templates relevant to Opsell: "Clock-ins, clock-outs and declared tips for hourly employees", "Actual labor punch data with tips and payroll ID for payroll integration", "Detailed employee punches with breaks and overtime for hourly employees", "Approved and pending punches for hourly employees", "Clock data for tip calculation integration with Gratshare", and "Employee hire, update and termination data".
- Standard POS integrations include employee sync to PAR Brink, Oracle Simphony, Qu, and NCR Aloha, plus sales feeds.

The Gratshare template shows Harri already feeds clock data to a third-party tip calculator, which is the same shape as Opsell's need.
The "Pay Sheets and Tips" section is the likely home of the per-Employee tips entered manually into Harri timesheets, as at the founder's bakery, but whether it is readable per shift and per Location cannot be confirmed without portal access.
Harri's integrations page lists Toast among 13 POS partners and 5 "Tips & Earned Wage Access" partners (Stream, Grateful, Tapcheck, TiPJAR) ([Harri integrations](https://harri.ai/integrations/)), but the portal lists no Toast-specific standard integration.

## Toast's own WFM: Toast Payroll & Team Management and Sling

- Sling is "Sling by Toast"; timesheets sync between Sling and Toast in real time, and edits in Sling flow back to Toast when the Location and position exist on Toast ([Overview for the Toast+Sling integration](https://support.getsling.com/en/articles/7938906-overview-for-the-toast-sling-integration), [Sling by Toast: Integration Overview](https://support.toasttab.com/en/article/Sling-by-Toast-Integration-Overview)).
- Timesheet sync requires Sling Pro; Sling Lite syncs only employee data ([Compare Sling Lite and Sling Pro](https://support.toasttab.com/en/article/Sling-by-Toast-Compare-Sling-Lite-and-Sling-Pro)).
- Toast Payroll's tip pooling (Tips Manager) is a separate subscription that sends tip entries to payroll per day ([Tips Manager With Toast Payroll](https://support.toasttab.com/article/Toast-Payroll-Tips-Manager-Setup)); issue #4 found no API for its results.

So an Organization whose time clock is Toast, Toast Payroll, or Sling is fully served by the Toast labor API, with no extra integration.
Sling's own public API is undocumented by Sling, so it is not worth integrating.

## Other candidates

### Fourth / HotSchedules

- Fourth claims HotSchedules is used at 120,000 Locations, and Fourth overall serves over 15,000 customers across 100,000 sites ([HotSchedules](https://www.fourth.com/product/hotschedules), [About Fourth](https://www.fourth.com/company/about)).
- Its Time & Attendance API is for sending clock data into Fourth, "we do not host documentation for this API online", and access goes through the Partnerships Team, then testing, go-live, and certification ([Time & Attendance API](https://developer.fourth.com/en-gb/time-attendance-api)).
- The listed Employee API is UK-only, and no tips API is documented ([Time & Attendance API](https://developer.fourth.com/en-gb/time-attendance-api)).
- Verdict: a candidate after the MVP if design partners use it, but not buildable from public docs today.

### Homebase

- "150,000+ small businesses use Homebase to manage hourly teams" ([Homebase](https://www.joinhomebase.com/)).
- Its public API spec is read-only, with keys requested per customer from API Settings and approved by Homebase; partners needing write access go through a Homebase representative ([Homebase Public API spec](https://app.joinhomebase.com/api/public/swagger_doc.json)).
- Endpoints cover locations, employees, shifts, timecards (clock in/out, breaks, `approved`), and labor by employee and role with `cash_tips` and `credit_tips` ("Clover merchants only"); rate limit 60 requests per minute per UUID; no webhooks documented ([Homebase Public API spec](https://app.joinhomebase.com/api/public/swagger_doc.json)).
- Verdict: easy to add later through the same adapter, but its base is single-Location small businesses, not Opsell's buyer.

### When I Work

- "More than 200,000 workplaces trust When I Work" ([When I Work](https://www.wheniwork.com/)).
- The Times resource has `user_id`, `location_id`, `site_id`, `position_id`, `start_time`, `end_time`, `length`, `hourly_rate`, `cash_tips`, and `is_approved` ([When I Work API spec](https://apidocs.wheniwork.com/external/monolith/docs-master.json)).
- The spec recommends webhooks over polling, but the help center documents only `users::*` events ([Webhooks reference](https://help.wheniwork.com/articles/webhooks-reference/)).
- Verdict: cross-industry small-business tool; not in the MVP.

### Deputy

- Deputy reports 1.5 million shift workers and 390,000 workplaces in over 100 countries ([Deputy newsroom](https://news.deputy.com/)).
- APIs use OAuth 2.0, webhooks cover insert, update, and delete on most endpoints, and Embed access needs a signed commercial agreement ([Public API facts and overview](https://developer.deputy.com/docs/public-api-facts-and-overview), [Timesheet webhook example](https://developer.deputy.com/docs/timesheet-webhook-example)).
- Verdict: technically strong, but global and cross-industry, with no restaurant-specific footprint published; not in the MVP.

## Which system is authoritative when an Organization has Toast and a WFM

The rule is per Location: **the system that runs the time clock owns hours and declared tips; the POS owns card tips and sales; the roster belongs to whichever system the Organization uses as its employee master.**

- **Hours.** Only one system clocks Employees in at a Location.
7shifts makes this explicit: with its own clock (7punches) on, it does not pull punches from Toast, so Toast declared tips do not reach 7shifts; with Toast as the clock, the "Actual Labor" setting imports Toast punches into 7shifts ([Why are my Toast declared tips not showing in 7shifts](https://kb.7shifts.com/hc/en-us/articles/42916209597971-Why-Are-My-Toast-Declared-Tips-Not-Showing-in-7shifts), [Toast POS](https://kb.7shifts.com/hc/en-us/articles/4417514408595-Toast-POS)).
In the second case the same shift exists in both Toast and 7shifts (`pos_type: toast`), and 7shifts adds manager approval on top.
Harri sells biometric and geofenced time clocks and pushes punch exports to payroll ([Harri manage](https://harri.ai/manage/), [sitemap](https://developer.harri.com/sitemap-posts.xml)), so a Harri Organization usually clocks in Harri.
- **Tips.** Card tips and auto-gratuities originate in the POS (Toast `tipAmount` on payments, per issue #4); a WFM only shows them if it imported them from the POS.
Declared cash tips are recorded wherever the Employee clocks out.
Manually entered per-Employee tips, as at the founder's bakery, live only in the WFM (Harri pay sheets, 7shifts tip pool manual entries).
A WFM's computed pool results (7shifts `tip_in`, `tip_out`, `earned_tips`) are derived data; Opsell should not import them, since Opsell computes Tip Distribution.
- **Roster.** Enterprise WFM/HR systems tend to be the employee master and push employees into the POS, as Harri's standard employee-sync integrations to Brink, Simphony, Qu, and Aloha do ([sitemap](https://developer.harri.com/sitemap-posts.xml)).
Smaller Toast shops often create employees in Toast first and sync them to the WFM (Sling syncs employee data from Toast even on Sling Lite).
So the roster master is an Organization setting, not a fixed rule.

## Implications for the adapter

The issue #4 decision called for a POS-agnostic adapter; this extends it to a source-agnostic labor and tips adapter.

- **Split by data domain, not by vendor.**
Define separate ports: sales and payments (POS only), time entries (hours and breaks per Employee per shift per Location), tip entries (with a kind: card, auto-gratuity, declared cash, manual), and roster (Employees, jobs or roles, Location assignments).
Toast implements all four; 7shifts and Harri implement time entries, tip entries, and roster; manual entry and CSV import implement time entries and tip entries.
- **Source of record per domain, per Location.**
Each Organization (overridable per Location) chooses which connection supplies hours, which supplies declared and manual tips, and which is the roster master.
Defaults: hours and declared tips from the time clock system, card tips from the POS, roster from the WFM if one is connected.
Opsell reads each domain from exactly one source per Location, which prevents double-counting shifts that a WFM mirrored from Toast.
- **Canonical records with provenance.**
Store each time entry and tip entry with its source, external ID, approval state, and last-modified time, so re-syncs are idempotent and edits replace rather than add.
Gate Tip Distribution on approved entries where the source has approval (7shifts `approved`, Homebase `approved`, Harri "approved and pending punches").
- **Cross-source Employee identity.**
One Opsell Employee links to a Toast employee GUID, a 7shifts user ID, and a Harri employee ID; prefer payroll ID or external employee ID for matching, and write Opsell's ID back where supported (Toast `externalEmployeeId`, 7shifts external user mappings).
- **Sync model.**
7shifts: webhooks as change hints plus a scheduled re-read of the day's punches.
Toast: polling, as issue #4 found.
Harri: unknown until portal access; design for polling with optional webhooks.
- **Location mapping.**
Each provider has its own Location IDs (Toast restaurant GUID, 7shifts `location_id`, Harri location); the Org Admin maps each to an Opsell Location during setup.

## Open points

- Harri: what the Time & Attendance, Pay Sheets and Tips, and Webhook APIs actually return, whether a vendor (not only a customer) can get credentials, and on what terms.
This needs a Harri customer to sign up for the portal and Opsell to submit the partner form.
- 7shifts: which new plan (Essentials, Pro, Premium) satisfies the "All Other Categories" minimum, and current per-Location prices; confirm during partner onboarding.
- 7shifts: whether onboarding involves a commercial review, certification, or a fee; the current OAuth page names none.
- Whether tips entered manually in Harri are stored per shift or per day, which matters for per-shift Tip Distribution and the 6-year per-shift record from issue #5.
- Restaurant-only Location counts for Deputy, When I Work, and Homebase are not published.
