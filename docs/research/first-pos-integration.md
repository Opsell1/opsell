# First POS integration

Research for [issue #4](https://github.com/Opsell1/opsell/issues/4), a child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1).
Researched 2026-10-14 against first-party developer docs, partner pages, and investor filings.

## Question

Which POS system should Opsell integrate with first, given the target segment (US multi-Location restaurants, bakeries, cafes)?
Candidates compared: Toast, Square, Clover, Lightspeed Restaurant (K-Series).
Criteria: market share in the segment, API access to daily sales, labor hours, tips, and Employee/time-clock data, partner requirements and timelines, cost, and webhooks vs polling.

## Recommendation

Integrate with **Toast** first, through the Toast partner integration program.
Design the integration behind a POS-agnostic adapter so **Square** can follow as the second integration with little extra work.

Why Toast:

- It is the restaurant-specialist POS with the largest disclosed restaurant footprint: about 180,000 Locations as of June 30, 2026, up 22% year over year ([Toast Q2 2026 results](https://pos.toasttab.com/news/toast-announces-second-quarter-2026-financial-results)).
- Its labor API exposes exactly what Tip Distribution needs on each time entry: regular and overtime hours, breaks, hourly wage, declared cash tips, non-cash tips, tips withheld, and auto-gratuities ([TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/)).
- Its orders, cash management, and restaurants APIs cover the sales and cash side of a Closing Report ([API overview](https://doc.toasttab.com/doc/devguide/apiOverview.html)).
- Restaurant groups are a first-class concept: credentials and the analytics API work across a management group of Locations ([Analytics API overview](https://doc.toasttab.com/doc/devguide/apiAnalyticsOverview.html)).

The main cost of choosing Toast is access, not money: partnership is gated, multi-stage, and prioritized by customer demand.
Square is the opposite trade: free, self-serve OAuth and richer webhooks, but a weaker position in multi-Location full-service restaurants (Square does not disclose restaurant-specific Location counts, so this is a judgment, not a sourced figure).

## Comparison

| Criterion | Toast | Square | Clover | Lightspeed K-Series |
|---|---|---|---|---|
| Segment fit | Restaurant-only POS, ~180k Locations (Q2 2026) | General SMB POS with restaurant product; no restaurant Location count disclosed | General SMB POS; no restaurant Location count found | Restaurant POS, stronger outside the US; no US count found |
| Sales | Orders API (checks, payments, tips), Analytics API aggregated sales | Orders API, Payments API | Orders and Payments REST APIs | REST API (not verified in depth) |
| Labor hours | Labor API time entries: regular, overtime, breaks, wage | Labor API Timecards with breaks and wage | Employee shifts with clock in/out | Shifts endpoint with clock-in/out events |
| Tips | Per time entry: declared cash, non-cash, withheld, gratuities; per payment `tipAmount` | `declared_cash_tip_money` on Timecard; card tips on Payment/Order | Cash tips on shift; card tips on payment | Declared cash tips on shift |
| Webhooks | Orders, menus, stock, partners, and others; **no labor or employee webhook** | Labor (`labor.timecard.*`), orders, payments, team members | Orders, payments, employees, cash adjustments, and others | Not verified |
| Access | Partner application, discovery, legal/security approval, signed agreement, certification, alpha, beta | Free developer account plus seller OAuth | App approval by Clover before App Market publication | Partners and approved merchants only, by request |
| Cost to Opsell | No published partner fee found | APIs free for developers | Clover bills merchants and pays developers 70% | Not published |

## Toast in detail

### Integration types

Toast has four integration types ([Integration types](https://doc.toasttab.com/doc/devguide/apiIntegrationTypes.html)).

- **Partner integrations**: "Technology providers create partner integrations that extend the Toast platform", and they "read and write data on behalf of customers they share with Toast."
This is the type that fits a multi-tenant SaaS like Opsell.
- **Custom integrations**: for "Toast customers working with their own development teams".
- **Standard API access**: self-service, read-only credentials a restaurant creates in Toast Web; requires Restaurant Management Suite (RMS) Essentials or higher, and the user must be an active employee of the Location with the Manage Integrations permission ([Standard API access requirements](https://doc.toasttab.com/doc/devguide/devApiAccessRequirements.html)).
Its scopes include `labor:read`, `labor.employees:read`, `orders:read`, `cashmgmt:read`, and `restaurants:read` ([scopes](https://doc.toasttab.com/doc/devguide/devApiAccessScopes.html)).
It is production-only, with no sandbox ([Standard API access overview](https://doc.toasttab.com/doc/devguide/devApiAccessUserGuide.html)).
- **Analytics API access**: read-only reporting data (aggregated sales and labor, check reporting, payouts) across a management group; requires RMS Pro or higher and separate credentials issued by the Toast integrations team ([Analytics API overview](https://doc.toasttab.com/doc/devguide/apiAnalyticsOverview.html)).

The docs do not say whether a third-party vendor may run its product on a customer's standard API access credentials.
Treat that path as unapproved until Toast confirms it in writing.

### Partner requirements and timeline

The partnership process has eight stages ([Integration partnership process](https://doc.toasttab.com/doc/devguide/integrationDevProcess.html)):

1. Application, where Toast vets fit and notes it "receives a high volume of applications for partnership".
2. Discovery of business opportunity and technical readiness.
3. Partner agreement: "A partnership agreement must be signed before moving forward".
Before development, the partner also needs approval from Toast's compliance, privacy, security, and legal teams and an assigned integration representative.
4. Development kickoff, with sandbox partner credentials.
5. Certification: a one-hour demo-style review of workflows.
6. Alpha: one restaurant, with Toast checking logs after about a week.
7. Beta: three to five Locations or management groups, each using it in production "for several weeks".
8. General availability: listed on Toast's integrations site.

Toast publishes no overall timeline and no partner fee.
Applications are prioritized by factors including customer demand, so the application should name mutual customers who want the integration ([Toast partner application](https://pos.toasttab.com/partners/integration-partner-application)).
A realistic plan is several months from application to general availability, dominated by the review, alpha, and beta stages; this estimate is an inference from the stage list, not a Toast figure.

### Data Toast can supply

For the **Closing Report**:

- Daily sales: the orders API returns checks and payments, filterable by business date; the analytics API returns aggregated sales for a restaurant if the Organization has RMS Pro.
- Cash: the cash management API returns cash drawer events.
- Labor hours and labor cost: sum `regularHours` and `overtimeHours` from time entries, and estimate wages as hours times `hourlyWage` ([payroll integration checklist](https://doc.toasttab.com/doc/cookbook/apiIntegrationChecklistPayroll.html)).
- Location identity and hours: the restaurants API.

For **Tip Distribution**:

- Hours per Employee per shift: time entries carry `employeeReference`, `jobReference`, `inDate`, `outDate`, `businessDate`, `regularHours`, `overtimeHours`, and paid/unpaid `breaks` ([TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/)).
- Tips collected: `declaredCashTips`, `nonCashTips`, `tipsWithheld`, `cashGratuityServiceCharges`, and `nonCashGratuityServiceCharges` on each time entry, final once `outDate` is set.
- Toast's own guidance is to compute tips from the orders API (`tipAmount` on payments) instead, because time entry tip values can miss orders handled outside the shift and do not update after manager edits ([payroll integration checklist](https://doc.toasttab.com/doc/cookbook/apiIntegrationChecklistPayroll.html)).
- Employees and jobs: `/employees` and `/jobs`, which also let Opsell match Toast employees to Opsell Employees by name, email, or `externalEmployeeId`.

### Data Toast cannot supply, or supplies poorly

- **No labor or employee webhooks.** The webhook reference lists configured delay, guest order fulfillment status, menus, orders, packaging preferences, partners, restaurant availability, online ordering schedule, and stock ([Webhooks reference](https://doc.toasttab.com/doc/devguide/apiWebhooksReference.html)).
Opsell must poll `/labor/v1/timeEntries` (up to 30 days per request) and `/employees`.
That is fine for an end-of-day Closing Report and a per-shift Tip Distribution.
- **Overtime factor.** "The labor API does not expose the overtime factor," so overtime pay cannot be computed from Toast alone.
- **Tip pooling results.** The docs reviewed do not describe any API for Toast's own tip pooling or tip-out outcomes, so Opsell should compute Tip Distribution itself from raw tips and hours, which matches the product's intent.
- **Closing notes and anything non-financial** (incidents, maintenance, HR events) are not in the POS; they stay Opsell-native.
- **Accounting-grade figures.** Analytics data "is for informational purposes only" and does not follow GAAP.

### Webhooks vs polling

Toast webhooks require an HTTPS POST endpoint that returns 2xx within 2 seconds, deduplication by event GUID, and a periodic fallback poll because every webhook has a fallback API ([Webhook basics](https://doc.toasttab.com/doc/devguide/apiWebhookBasics.html)).
The partners webhook (`partner_added`, `partner_removed`, `partner_updated`) tells Opsell when an Organization connects or disconnects a Location ([Partners webhook](https://doc.toasttab.com/doc/devguide/apiPartnersWebhook.html)).
Labor and employee data are polling-only.

## Square in detail

- Labor API Timecards record one shift each, with breaks, job-based hourly wage, and `declared_cash_tip_money` ([Labor API overview](https://developer.squareup.com/docs/labor-api/what-it-does)).
- Card tips live in `tip_money` on Payment and `total_tip_money` on Order ([Labor API webhooks guide](https://developer.squareup.com/docs/labor-api/webhooks)).
- The `Shift` object was deprecated in API version 2025-05-21 and retired in 2026-05-21; new work must use Timecards and `labor.timecard.*` webhooks, which require `TIMECARDS_READ` ([Labor API webhooks reference](https://developer.squareup.com/reference/square/labor-api/webhooks)).
- "Square APIs and SDKs are free for developers to use"; sellers pay processing fees, and the Orders API with a non-Square payment processor costs 1% per transaction ([Payments pricing](https://developer.squareup.com/docs/payments-pricing)).
- Sellers authorize apps through OAuth with no partnership gate ([OAuth API](https://developer.squareup.com/docs/oauth-api/overview)).

Square is the easiest integration to build and the best second integration, but it is not the strongest fit for the multi-Location restaurant groups Opsell targets first.

## Clover in detail

- Shifts carry clock-in/out times and a cash tips amount; card tips sit on payments ([Create shift](https://docs.clover.com/dev/reference/employeecreateshift), [Get all payments](https://docs.clover.com/dev/docs/get-all-payments)).
- Webhooks cover employees, orders, payments, cash adjustments, customers, merchants, and apps ([Use webhooks](https://docs.clover.com/dev/docs/webhooks)).
- Clover must approve an app before it can be published to the App Market ([App approval](https://docs.clover.com/dev/docs/developer-app-approval-archive)).
- Clover bills merchants for App Market apps and pays developers 70% ([Monetize your apps](https://docs.clover.com/dev/docs/monetizing-your-apps)), which would put a 30% share on Opsell's pricing if Opsell billed through Clover.

Clover is a general SMB terminal widely sold through banks, and is a weaker fit for multi-Location restaurant groups.

## Lightspeed Restaurant (K-Series) in detail

- A REST API with OAuth 2.0 exposes shifts with clock-in/out events and declared cash tips ([Get Shifts](https://api-docs.lsk.lightspeed.app/operation/operation-staff-apigetshift)).
- Access is limited to partners and approved merchants, and developers building for all merchants must apply to become partners ([K-Series development community](https://community.lightspeedhq.com/en/categories/k-series-development)).

Lightspeed's restaurant base is concentrated outside the US, so it is the lowest priority for a US-only product.

## Implications for Opsell

- Apply to the Toast partner program now, naming any design-partner Organizations that run Toast, because Toast prioritizes by customer demand and the process has several gated stages.
- Keep a POS-agnostic seam: a provider adapter that yields per-Location daily sales, cash, per-Employee time entries (hours, breaks, wage), and tips, so Square can be added second.
- Build sync as scheduled polling of time entries and employees per Location, plus the orders and partners webhooks where available.
- Compute Tip Distribution in Opsell from raw tips and hours; do not depend on the POS's own tip pooling.
- Collect overtime rules per state in Opsell (the frame already requires state-aware compliance), since Toast does not expose the overtime factor.
- Closing Report fields that are not financial remain Opsell-native input.

## Open points

- Whether Toast allows a vendor to operate on a customer's standard API access credentials while partnership is pending; confirm with Toast before relying on it.
- Whether Toast charges partners any fee or revenue share; none is published.
- Whether partner integrations require the Organization to hold a particular RMS tier.
- Segment-level market share for Square, Clover, and Lightspeed among US multi-Location restaurants; no first-party figures exist, so a third-party market study would be needed if this matters.
