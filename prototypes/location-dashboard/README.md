# Location dashboard prototype

Throwaway prototype for [Location dashboard for GM, Manager and Senior-sup](https://github.com/Opsell1/opsell/issues/41).
It is the visual and behavioral reference for implementing what in-store Roles see; the code itself is not production code and should be rewritten, not promoted.

Run it with `npx serve prototypes/location-dashboard` (or open `index.html`).
The bottom bar switches variant (← →; E is the default), persona (GM with two Locations, Manager, Senior-sup) and clock (Friday closing vs Saturday morning).
State lives in memory; reload resets it.

## Variant E: D updated with the decisions of Oct 18-19

Variant E is the default and keeps D's design; flip back to D (← →) to see what changed.
In `prototype.js` it is the `Variant E` block: `VariantE`, `tipsE`, `poolCardE`, `coverFormE`, `chanBlock` and `chanChart`.

- **Sales Channel** ([#45](https://github.com/Opsell1/opsell/issues/45)): the Closing Report figures gain Sales by channel (Counter, Own online, Delivery apps with each app, Catering & advance), each with share and change vs the same weekday last week.
- Delivery apps are shown before the apps' commissions, a catering order shows when it was ordered and counts on its pickup day, and a late refund counts on the day it happens.
- Court St's Grubhub tag is **Unmapped**: it counts in every total, and the Org toggle "Org Admin maps Grubhub" moves it to Delivery apps in Sales & Labor and on open drafts, while submitted Closing Reports keep their snapshot.
- Sales & Labor gains a Sales by Sales Channel chart; Home is unchanged.
- **Tip Pool by source** ([#47](https://github.com/Opsell1/opsell/issues/47)): card tips, auto-gratuities and cash tips from Toast, plus any number of **Additional Tips** lines (amount, Cash or Non-cash, source Tip jar, Catering, Handed to a manager or Other, note required for Other).
- Cash lines split with cash tips and Non-cash lines with card tips, so the table keeps only Card and Cash columns.
- A "Not pooled" column shows courier tips (Toast Delivery Services at Mass Ave) and declared cash, so totals reconcile with Toast.
- **Generate tips and Refresh hours** ([#48](https://github.com/Opsell1/opsell/issues/48)): the Draft exists from the start of the Business Day, so at closing time it is already open.
- Any input change marks the shares **Out of date**; after Generate, a Harri edit only shows a "Harri has changes" banner (Mass Ave Friday simulates one 4 seconds after Generate, or from Org toggles).
- Refresh hours updates untouched lines, and an edited line Harri changed becomes a disagreement with **Keep mine** / **Use Harri** that blocks Finalize; Refresh is disabled for a minute after.
- **Covering Shift** ([#49](https://github.com/Opsell1/opsell/issues/49)): pick anyone in the Organization, with start and end times, break and a fixed reason; time that overlaps their home shift comes off the home line ("4.0 h moved to cover at Mass Ave") and the home GM and Managers are told.
- Once the covered Location finalizes, the home Location sees the cover read-only under "Covering Shifts at other Locations".
- **Tip Waiting Period** ([#51](https://github.com/Opsell1/opsell/issues/51), ADR 0008): Court St (NY) has 4 waiting days in its Tip Policy, so new hire Sofia Ruiz shows "Waiting period: day 4 of 4" with a $0 share, and Home has an FYI that she finished it.
- Mass Ave (MA) blocks the setting, so Noah Brooks shares from his first day; in D he still waits.

Try it as the GM: on Mass Ave Friday, Generate tips, wait for the Harri banner, Refresh hours, settle Lucy Tran's disagreement, add a Covering Shift for Maya Kim from 12:00 to 16:00, then open Court St Friday.

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

Tracked in [Tip and Closing Note details from the Location dashboard](https://github.com/Opsell1/opsell/issues/55):

- whether a Closing Note covering two topics is split into two;
- how an unapproved timesheet line behaves until it is approved in the source (E keeps D's "Unapproved in Harri" with "Include by hand").

Settled since D and shown in E: declared cash never pools (ADR 0008), and the waiting period is a per-Location Tip Policy setting, 0 days by default and blocked in MN, CA and MA ([#51](https://github.com/Opsell1/opsell/issues/51)).
Not shown: the Tip Policy notice and acknowledgment ([#62](https://github.com/Opsell1/opsell/issues/62)) and Reminders ([#58](https://github.com/Opsell1/opsell/issues/58)).
