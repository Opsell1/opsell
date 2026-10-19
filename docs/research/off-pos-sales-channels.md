# Off-POS sales channels and NetSuite

Research for [issue #44](https://github.com/Opsell1/opsell/issues/44), a child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1).
Researched 2026-10-18 against Toast developer and support docs, Uber Eats and DoorDash developer and merchant docs, Deliverect developer docs, and Oracle NetSuite help.
Builds on [First POS integration](https://github.com/Opsell1/opsell/issues/4) and [Workforce management integrations](https://github.com/Opsell1/opsell/issues/13) and does not repeat them.

## Question

How do sales from channels beyond the in-store POS reach Opsell, and what does each source expose, so the adapter's canonical sales model can represent them?
Channels: third-party delivery marketplaces (Uber Eats, DoorDash, Grubhub), first-party online ordering, and advance, catering and wholesale orders, including those some restaurants manage in Oracle NetSuite.

## Answer in brief

- For a Toast Location, marketplace and first-party online orders already land in Toast as ordinary orders, so the sales adapter reads them from the Toast orders API with no extra source.
- A channel is identified by the order's dining option (with its `behavior`), its Other payment type, its revenue center and, for Toast-owned channels, its `source`.
- Toast carries what the guest was charged, never what the marketplace kept: commissions, marketing fees, error charges and payouts exist only in each marketplace's own reports.
- Marketplace guest tips usually belong to the courier, and on Toast Delivery Services orders they sit inside Toast's card tips, so the canonical model must say who owns every tip before it can enter a Tip Pool.
- Uber Eats and DoorDash do offer reporting APIs to third parties, but both are gated by written approval or an interest form; Grubhub's API is partner-only and its docs are not publicly readable.
- NetSuite can supply sales orders, cash sales and invoices per NetSuite location and date through SuiteTalk REST and SuiteQL with OAuth 2.0, but restaurants usually post summarized POS journal entries there, so NetSuite must only be read for channels that never touch the POS (wholesale, some catering).
- Advance orders carry both an ordered time and a promised time, and Toast assigns sales to the promised (fulfillment) business date; Opsell should do the same.
- Recommendation: one canonical sales order model with a channel, a fulfillment mode, ordered and promised times, gross and net amounts, and tips tagged by owner; marketplace fees as a separate, later, optional data type.

## Channels via Toast

### How marketplace orders get into Toast

Toast has direct integrations with DoorDash (including Caviar), Uber Eats and Grubhub, bought through Toast Shop.
DoorDash integration orders are received "directly on the Toast POS" and Toast charges a recurring DoorDash integration subscription separate from DoorDash's own commission ([Get Started With the DoorDash Integration](https://support.toasttab.com/en/article/Getting-Started-DoorDash-Integration)).
Uber Eats orders "use a unique payment type and dining option for ease of reporting and tracking" ([Get Started With the Uber Eats Integration](https://support.toasttab.com/en/article/Getting-Started-Uber-Eats-Integration)).
Grubhub orders likewise "use a unique payment type and dining option" ([Get Started With the Grubhub Integration](https://support.toasttab.com/en/article/Grubhub-Integration-Overview)).

Middleware is the other route.
Deliverect requires "Toast Partner Integrations" access, Takeout and Delivery dining options, and an Other Payment Option set up to Deliverect's specification; a dedicated revenue center is recommended ([Get Started With Deliverect Integration](https://support.toasttab.com/en/article/Get-Started-with-Deliverect-Integration)).
Deliverect's own guide says to create payment types and dining options "for each delivery platform (Uber Eats, DoorDash, etc.)" ([Toast: configure your POS for Deliverect](https://help.deliverect.com/en/articles/8200618-toast-configure-your-pos-for-deliverect)).
Otter and Chowly also inject marketplace orders into Toast, but neither publishes field-level mapping docs that could be read for this research (see Source gaps).

Either way, marketplace orders arrive in Toast through the same orders model, so the Toast sales adapter sees them without a second source.

### Fields that tell channels apart

From the Toast [Order schema](https://doc.toasttab.com/openapi/orders/tag/Data-definitions/schema/Order/):

- `source`: "the way that the order was placed", with values In Store, Online, Order-and-Pay-at-Table, API, Kiosk, Caller Id, Google, Invoice, Toast Pickup App, Toast Local, Toast Pay, Branded Online Ordering, Catering, Catering Online Ordering, Toast Tables, eCommerce Online ordering, Branded Mobile App and Voice AI - Drive-Thru (Grubhub is listed as deprecated).
It names Toast-owned channels well, but marketplace integrations are not given their own value.
- `diningOption`: a reference to a dining option whose `behavior` is DINE_IN, TAKE_OUT or DELIVERY, plus a `curbside` flag and a `name` ([DiningOption schema](https://doc.toasttab.com/openapi/configuration/tag/Data-definitions/schema/DiningOption/)).
Each marketplace integration creates its own locked dining options (for example "Uber Eats Takeout" and "Uber Eats Delivery"), so the dining option is the most reliable marketplace marker.
- Payment `type` OTHER with `otherPayment`: "a custom type configured by the restaurant" ([Payment schema](https://doc.toasttab.com/openapi/orders/tag/Data-definitions/schema/Payment/)); each integration creates its own Other payment option (for example "Uber Eats").
- `revenueCenter`: Uber Eats and DoorDash orders link automatically to a revenue center with a fixed name if one exists; Grubhub's is set manually or by request to Grubhub.
Revenue centers are optional and named by the restaurant, so they are a hint, not a key.
- `thirdPartyProviderInfo` exists on the order but is undocumented beyond a GUID reference.
- `channelGuid` is "Reserved for future use".
- `externalId` is "prefixed by the naming authority", which gives middleware-created orders a traceable external identity.

Implication: the adapter maps a Location's Toast dining options and Other payment options to Opsell channels once, at onboarding, rather than parsing names on every order.
Toast's own reporting does the same: its Sales Summary filters third-party orders by a Source drop-down of "delivery carriers" ([View Reports on Third-Party Delivery Orders](https://support.toasttab.com/en/article/Lookin-Up-Third-Party-Deliveries)).

### Gross, net, commissions and refunds in Toast

- The payment `amount` excludes tips and `tipAmount` holds the tip ([Payment schema](https://doc.toasttab.com/openapi/orders/tag/Data-definitions/schema/Payment/)).
- Refunds carry `refundAmount` (excluding tip), `tipRefundAmount`, `refundDate` and `refundBusinessDate` ([Refund schema](https://doc.toasttab.com/openapi/orders/tag/Data-definitions/schema/Refund/)), so a refund is dated to the day it was made, not the day of the sale.
- Voids carry `voided` and `voidBusinessDate` on the order.
- Service charges flag `gratuity`, `delivery`, `takeout` and `dineIn` ([AppliedServiceCharge schema](https://doc.toasttab.com/openapi/orders/tag/Data-definitions/schema/AppliedServiceCharge/)).
- Marketplace menu prices are often marked up: Toast lets a Location raise Uber Eats, DoorDash and Grubhub prices by a percentage or fixed amount without changing in-store prices, so marketplace "sales" in Toast are inflated relative to in-store prices for the same items.
- Marketplace facilitator tax: Uber Eats and Grubhub collect and remit sales tax in some states, and `marketplaceFacilitatorTaxInfo` is write-only for designated clients and is not returned by the API.
- Commissions and marketplace fees are not in Toast.
DoorDash "bills its commission and any delivery, service, or marketing fees separately" from Toast, and marketplace cancellations and guest refunds are handled in each marketplace's support, not in Toast.
- `mcaRepaymentAmount` on a payment covers amounts Toast withholds (Toast Capital, marketplace facilitator tax, Toast Delivery Services costs), not marketplace commissions.

So from Toast, Opsell can show marketplace sales gross (what the guest paid at the marketplace menu price, less discounts), but not net of commissions.

### Tips by channel

- Uber Eats: "Guest tips entered on the Uber Eats marketplace are paid directly to delivery drivers and managed entirely by Uber Eats" ([Uber Eats integration](https://support.toasttab.com/en/article/Getting-Started-Uber-Eats-Integration)).
- DoorDash pickup: customers can tip restaurant staff on pickup orders, "100% of tips go to your restaurant" and "Tips are included in your weekly payout", behind a merchant setting that is still rolling out ([How Order Pickup Works on DoorDash](https://help.doordash.com/en-us/merchants/article/order-pickup)).
Whether those staff tips appear as `tipAmount` on the Toast order is not documented.
- DoorDash self-delivery orders pass tips through to the merchant, but self-delivery "isn't compatible" with the Toast DoorDash integration.
- Grubhub: the Toast article does not cover tips, and no Grubhub page was found (see Source gaps).
- Toast Delivery Services (Toast's own delivery for first-party online orders, fulfilled by third-party couriers): "Your delivery provider collects the driver tips that guests leave on each Toast Delivery Services® (TDS) order", all such tips are assigned to a "TDS Driver" employee, and they "should be deducted from Credit/Non-Cash tips before paying out your restaurant staff" ([TDS Tip Payouts](https://support.toasttab.com/en/article/Toast-Delivery-Services-Tip-Payouts)).
- First-party pickup and dine-in online orders: tips are ordinary card tips on the payment and belong to the Location.

This matters for the [Tip Distribution workflow](https://github.com/Opsell1/opsell/issues/12): its Tip Pool takes "card tips", and a naive sum of Toast `tipAmount` would pool courier money.
The canonical model must carry each tip's owner (Location staff or courier), and only staff-owned tips feed a Tip Pool.

### Business date and advance orders in Toast

- `createdDate` is when Toast received the order, `promisedDate` is the scheduled fulfillment time (null for ASAP and dine-in), and `estimatedFulfillmentDate` is set for TAKE_OUT and DELIVERY ([Order schema](https://doc.toasttab.com/openapi/orders/tag/Data-definitions/schema/Order/)).
- `businessDate` is "the business date on which the order was fulfilled", while `openedDate` matches `createdDate` for same-day orders and `promisedDate` for scheduled ones.
- The bulk orders endpoint's `businessDate` filter covers "the business date that same-day orders opened or that scheduled orders are promised", while `startDate`/`endDate` filter on modified time ([ordersBulk](https://doc.toasttab.com/openapi/orders/operation/ordersBulkGet/)).
- Catering and invoices: "all sales are reported on the date the order is fulfilled" while "All payments are processed on the date the payment is captured" ([Manage Deposits With Toast Catering & Events](https://support.toasttab.com/en/article/Catering-and-Events-Deposits)).
- `approvalStatus` FUTURE marks scheduled orders not yet due.
- Marketplace scheduled orders do not keep their schedule in Toast: Uber Eats orders "fire to the kitchen as ASAP" and Grubhub orders fire on Toast prep time, and none of the integrations support viewing future scheduled orders.
So a marketplace pre-order appears in Toast near its fulfillment time, which still lands it on the fulfillment Business Day.

Implication: a sale belongs to the Business Day of its fulfillment (promised) time, and a deposit or prepayment taken earlier is a payment on its capture day, not a sale.
This matches Toast's own reporting, so Closing Report figures will reconcile with what managers see in Toast.

## Direct from marketplaces

### Uber Eats

- The Marketplace APIs include Store, Menu, Order, Promotions and Reporting, and "Access to These APIs May Require Written Approval From Uber" ([Uber Eats introduction](https://developer.uber.com/docs/eats/introduction)).
- Prerequisites are a sandbox app, an NDA and API licensing agreement, and partner approval through an Uber Eats partner manager; use cases beyond order fulfillment "require an aligned business agreement" ([Getting started](https://developer.uber.com/docs/eats/guides/getting-started)).
- Merchants link stores through the OAuth authorization code grant with `eats.pos_provisioning`; reports then use client credentials with the `eats.report` scope, "generate reports (e.g. transaction reports) for stores", and production scopes must be approved and allowlisted by Uber ([Authentication](https://developer.uber.com/docs/eats/guides/authentication)).
- Reports are CSV; "Net Payout in your system should match Payment Details Report total", "Tips appear as separate lines", "Refunds/chargebacks appear only in Reporting - not Orders API", dates are local "based on when the order was placed", data "may take up to 72 hours to settle" and "disputes may appear after 30 days" ([Reporting guide](https://developer.uber.com/docs/eats/guides/reporting)).
- The order object has `placed_at`, `estimated_ready_for_pickup_at`, a `type` of PICK_UP, DINE_IN, DELIVERY_BY_UBER or DELIVERY_BY_RESTAURANT, and charges `sub_total`, `tax`, `tip` (for the delivery provider), `total_fee` and `total` ("paid out to the merchant, excluding Marketplace Fees") ([Get Order Details](https://developer.uber.com/docs/eats/references/api/v2/get-eats-order-orderid)).

### DoorDash

- The Reporting API lets integration partners download Financial, Operations, Menu and Feedback reports, but "Reporting APIs are not yet generally available": access is by interest form reviewed by an access team ([About DoorDash Reporting API](https://developer.doordash.com/docs/reporting/overview/about_reporting)).
- Reports are CSV, refresh daily, cover up to 2 years, and are US, Canada and Australia only; DoorDash also names aggregators (Itsacheckmate, Nextbite) as an alternative route ([How to Access the DoorDash Reporting API](https://help.doordash.com/consumers/s/article/How-can-I-access-the-DoorDash-Reporting-API)).
- Payout arithmetic: "Net Total = Sales - (Commission & Fees + Marketing Spend) + Amendments", where amendments are error charges and adjustments; a payout covers its payout period, which can span two months, and reports show times in UTC and local time ([Payout and Monthly Statement](https://merchants.doordash.com/en-us/learning-center/payout-and-monthly-statement)).

### Grubhub

- Grubhub's developer portal (developer.grubhub.com) renders only behind a script and bot protection, so no first-party API terms could be read.
- Secondary sources describe a partner-only API with credentials after a partner form and pilot; treat that as unverified.

### Payout reports are not the only route, but they are the realistic one

For Opsell, the direct APIs are approval-gated partnerships per marketplace, just like Toast's.
Short of that, an Organization can upload each marketplace's CSV payout or financial report, which is the only place commissions, marketing spend and error charges exist.
Payout data settles days late (Uber Eats up to 72 hours, disputes after 30 days) and is grouped by payout period, so it cannot be part of a Closing Report snapshotted the next morning.

## Oracle NetSuite

### Access paths

- SOAP is ending: "With the 2028.2 release, SOAP will no longer be available in NetSuite" and "All newly built integrations should use REST web services with OAuth 2.0 for authentication" ([SuiteTalk SOAP overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N3412777.html)).
- SuiteQL runs through REST with a POST to `/services/rest/query/v1/suiteql` carrying `q`, a required `Prefer: transient` header, `limit`/`offset` paging, bound `params`, and "a maximum of 100,000 results" (more needs SuiteAnalytics Connect) ([Executing SuiteQL Queries Through REST Web Services](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157909186990.html)).
- Saved searches and RESTlets also exist, but a RESTlet is custom SuiteScript deployed in the customer's account, which makes it heavier than SuiteQL over REST for a read-only integration.

### Authentication

- OAuth 2.0 supports the authorization code grant (access and refresh tokens) and the client credentials (machine to machine) flow ([OAuth 2.0 for Integration Application Developers](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157780218434.html)).
- An administrator, or a user with the Integration Application permission, creates an integration record with scopes such as REST Web Services, RESTlets and SuiteAnalytics Connect ([Create Integration Records for OAuth 2.0](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html)).
- For client credentials, the customer's administrator maps an entity, a role and the application to an uploaded public certificate; at most five active certificates per integration record, and the setup is cleared on each sandbox refresh ([OAuth 2.0 Client Credentials Setup](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162686838198.html)).
- For the authorization code grant, Oracle's token page states the refresh token is valid for seven days for confidential clients (two days by default for public clients), so a code-grant integration needs a user to reauthorize weekly; client credentials avoids that ([Step Two POST Request to the Token Endpoint](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158081952044.html), read through search excerpts).
- Data access is bounded by the NetSuite role the customer maps, so the customer controls exactly which subsidiaries and records Opsell can read.

### Partner and SuiteApp requirements

- A custom integration needs no Oracle partnership: the customer creates the integration record and grants a role.
- Integration records can be auto-installed into a customer account, including as part of an SDF SuiteApp installation ([Auto-Installation of Integration Records](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4429293934.html)).
- Listing on the SuiteApp Marketplace requires a released version, an SDN listing review and a Built for NetSuite review, done through the Advanced Partner Center ([Requirements for SuiteApp Marketplace Availability](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1559316827.html)); SDF SuiteApps need a publisher ID registered by SDN.
- SDN and Built for NetSuite fees were not readable (see Source gaps).

### What NetSuite holds for a restaurant

- A sales order has a transaction `Date` (defaults to today), a header `Location` "Where to classify the sales order", line-level fulfillment locations and expected ship dates, a status of Pending Approval or Pending Fulfillment, and Subsidiary, Class and Department; "Sales orders don't affect your general ledger", and billing creates an invoice or a cash sale ([Creating Sales Orders](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1216500.html)).
- So per Location and per date, Opsell could read: sales orders (advance orders, by ship date), and invoices or cash sales (realized sales, by transaction date), filtered by NetSuite location.
- The common restaurant pattern, described by integration vendors rather than Oracle, is that POS sales reach NetSuite as one summarized journal entry per Location per day, broken down by revenue center, sales category, tax, tip and payment type ([Shogo](https://shogo.io/integrations/toast-netsuite), [Bookkeep](https://www.bookkeep.com/docs/apps/toast/bookkeep-for-toast-daily-summary-by-location); low-trust, vendor pages).
- NetSuite also commonly carries channels that never touch the POS: wholesale accounts invoiced on terms, and catering or advance orders entered as sales orders.
- NetSuite locations and Opsell Locations will not map one to one in every Organization (a commissary or wholesale kitchen can be a NetSuite location with no Opsell Location), so the mapping is an onboarding step.

The double-counting risk is the main design constraint: if the POS is a Location's sales source and NetSuite holds that same POS revenue as journal entries, reading NetSuite transactions too would count sales twice.
NetSuite should be readable only for named transaction types or forms that the Organization confirms are off-POS, never as a second copy of POS sales.

## Advance-order timestamps across sources

| Source | Ordered time | Promised or fulfillment time | Sales dated by |
|---|---|---|---|
| Toast | `createdDate` | `promisedDate`, `estimatedFulfillmentDate` | `businessDate` (fulfillment) |
| Toast Catering and invoices | invoice creation | scheduled event date | fulfillment date; payments on capture date |
| Uber Eats API | `placed_at` (local offset) | `estimated_ready_for_pickup_at` | reports by order placed time |
| DoorDash reports | transaction time (UTC and local) | not verified | payout period |
| Deliverect | `_created` (UTC) | `pickupTime`, `deliveryTime`, `deliveryIsAsap` | n/a ([Glossary - POS Orders](https://developers.deliverect.com/page/glossary-pos-orders)) |
| NetSuite | sales order `Date` | line expected ship date | invoice or cash sale transaction date |

Note the conflict: Uber Eats reports date by placed time, Toast by fulfillment time.
For a same-day ASAP order the difference is minutes, and only an order placed before a Location's cutoff and fulfilled after it changes Business Day.
Opsell should use the fulfillment time, matching Toast and the [Closing Report workflow](https://github.com/Opsell1/opsell/issues/8)'s one-report-per-Business-Day snapshot, and keep the ordered time for display and reconciliation.

## Recommendation for the canonical sales model

Sources the model must accommodate:

1. POS orders (Toast first) covering in-store, kiosk, first-party online, Toast Delivery Services, catering and marketplace orders injected natively or by middleware.
This is the only sales source a Closing Report needs.
2. An off-POS order source for wholesale and catering, from NetSuite or a CSV upload, read only for transaction types the Organization marks as off-POS.
3. Later and optional: marketplace settlement data (Uber Eats and DoorDash reporting APIs, or CSV payout uploads) as a separate data type for commissions and net payout, never mixed into the snapshotted Closing Report figures.

Each stays behind the per-data-type adapter decided in #13, with one source per data type per Location; the off-POS order source is a second sales feed by channel, not a second copy of the same sales.

Fields of a canonical sales order:

- `source`, `externalId`, `locationId`, `modifiedAt` and `state` (open, closed, voided), as in #13's canonical entries.
- `channel`: in_store, first_party_online, marketplace, catering, wholesale, other.
- `channelPartner`: uber_eats, doordash, grubhub, other, or none; `viaMiddleware` (deliverect, otter, chowly, none) for traceability.
- `fulfillment`: dine_in, pickup, delivery, curbside; and `deliveredBy`: location_staff, marketplace_courier, toast_delivery_services, none.
- `orderedAt`, `promisedAt` (null for ASAP), `fulfilledAt`, and `businessDate` derived from the fulfillment time in Location-local time with the Location cutoff.
- `grossSales` (item prices before discounts), `discounts` (with who funded them where known), `netSales` (gross minus discounts, excluding tax, tips and service charges), `tax` and `taxRemittedByMarketplace`, `serviceCharges` (with gratuity and delivery flags).
- `tips`, as a list of lines with `amount`, `kind` (card, cash, auto_gratuity) and `owner` (location_staff or courier); only location_staff tips feed the Tip Pool.
- `payments` with tender (card, cash, gift card, other with the mapped channel), and `refunds` with amount, tip refund and refund business date.
- Marketplace settlement, as a separate data type: per channel partner, per payout period and per Location, commission, marketing spend, error charges and adjustments, and net payout, with a provisional or settled flag.

Implications for #45:

- The Closing Report can break sales down by channel from Toast data alone.
- Marketplace sales can be shown gross with certainty; net of commissions only later and only where settlement data is connected, so it does not belong in the next-morning snapshot.
- Advance and catering orders count on their fulfillment Business Day, with deposits as payments on capture day.
- Courier tips (Uber Eats, TDS, DoorDash delivery) stay out of the Tip Pool; DoorDash pickup staff tips belong in it if they reach the source as tips.
- The mock data source should seed marketplace orders with marked-up prices, a TDS delivery with a courier tip, a DoorDash pickup staff tip, an ASAP marketplace order spanning the cutoff, a catering order with an earlier deposit, and at least one wholesale invoice on a non-POS feed.

## Source gaps

- Grubhub: no first-party API, partner terms or tip ownership pages could be read; developer.grubhub.com is script-rendered behind bot protection.
- Otter and Chowly: no public field mapping into Toast was found; ChowNow's Toast guide shows the same pattern (named dining options and an Other payment option), which suggests but does not prove theirs.
- Whether DoorDash pickup staff tips and middleware-injected marketplace tips appear as `tipAmount` on Toast payments is not documented.
- Toast's aggregated analytics API dimensions (for example by dining option or source) were not readable, so per-order reads are the assumed route.
- Toast `thirdPartyProviderInfo` is undocumented.
- Uber Eats and DoorDash report column definitions and exact scope access policies for third-party apps are not public.
- NetSuite marketing pages, SDN and Built for NetSuite fees and terms returned HTTP 403; restaurant usage patterns rely on integration-vendor pages.
- The NetSuite seven-day refresh token figure was read through search excerpts of Oracle's page rather than the page itself.
