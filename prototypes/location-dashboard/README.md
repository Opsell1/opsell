# Location dashboard prototype

Throwaway prototype for [Location dashboard for GM, Manager and Senior-sup](https://github.com/Opsell1/opsell/issues/41).
It is the visual and behavioral reference for implementing what in-store Roles see; the code itself is not production code and should be rewritten, not promoted.

Run it with `npx serve prototypes/location-dashboard` (or open `index.html`).
The bottom bar switches variant (← →), persona (GM with two Locations, Manager, Senior-sup) and clock (Friday closing vs Saturday morning).
State lives in memory; reload resets it.

## Chosen design: variant D

The founder chose **variant D** on 2026-10-18; A, B and C stay in the file only as the alternatives that were rejected.
In `prototype.js`, variant D is `VariantD`, `dashHome`, `reportD`, `tipsD`, `splitD` and `coverForm`.

### Home

- B's dashboard: greeting with the day the figures cover, four KPI cards with sparklines, a ranked Needs attention list, two charts.
- Plus A's Quick actions card at the top of the right column: Add a Closing Note, and for GM and Manager, Raise an HR Flag and Start a Write-up.
- A GM with several Locations gets a Location switcher (My Locations or one Location).
- Senior-sup sees hours and guests instead of labor % and the Tip Pool.

### Closing Report

- A dedicated page per Location and Business Day, with figures in a sticky column on the right.
- One Closing Notes card for the whole report, grouped by the five sections, with a single composer at the bottom.
- The writer never picks a section: Opsell files each Closing Note under Staffing, Guests, Facility & Equipment, Product & Inventory or Other after it is entered, and marks it "filed by Opsell".
- The writer can move their own Closing Note to another section, edit it or delete it; other writers' notes are locked.
- Submit opens the HR Flag suggestion review (confirm, edit, dismiss) in a modal; Submit is enabled once every suggestion is handled.

### Tip Distribution

- Card tips and cash tips come from the POS (Toast in the demo), like sales; an Additional tips field with a "From" note covers tips from other sources.
- The table is already filled from timesheet hours (Harri in the demo) when the Draft is created.
- **Refresh hours from Harri** re-pulls hours on demand; hours adjusted by hand in Opsell are kept.
- **Generate tips** fills each Employee's card, cash and additional share; changing hours or tips afterwards asks to generate again before **Finalize**.
- **Add Employee from another Location** adds someone who covered a shift by hand, with hours and a reason; they share in the pool of the Location they covered. Covering shifts the source already reports come in on their own.
- The table lists only people who can share; those who never share (GM, Manager, back-of-house in NY/MA, an MA Senior-sup who ran the shift) are named in one line under it.
- A new hire in a tip-eligible Position shows "Day N of 5" and shares from their 5th day worked; Home reminds the GM and Manager the day before.

## Still open

Tracked on the map, see [Location dashboard for GM, Manager and Senior-sup](https://github.com/Opsell1/opsell/issues/41) for links:

- whether cash an Employee declares as received directly stays out of the pool;
- whether the 5th-day waiting period is a per-Location Tip Policy setting, off by default, and where it is legal;
- whether a Closing Note covering two topics is split into two;
- how an unapproved timesheet line behaves until it is approved in the source.
