# Anatomy of a corporate dashboard

Research for [issue #35](https://github.com/Opsell1/opsell/issues/35), a child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1).
Researched 2026-10-17 against vendor help centers (Toast, Square, 7shifts, Restaurant365, Lightspeed), design system guidance (Carbon, Atlassian), Microsoft Power BI docs, and dashboard literature (Nielsen Norman Group, Stephen Few, Edward Tufte, the Financial Times Visual Vocabulary).
It follows the founder's feedback on the [Corporate dashboards](https://github.com/Opsell1/opsell/issues/29) prototype.

## Question

What is the anatomy of an effective operations dashboard for corporate users of a multi-Location Organization, and how should work divide between the home dashboard and sections reached from a sidebar?
Sub-questions: what belongs on the home page, how comparable products structure navigation and home, which chart fits which operational metric, how many charts a dashboard can hold, and proven practice for drill-down, period comparison, and role-specific dashboards.

## Findings

### 1. A dashboard is a one-screen monitoring surface, and detail lives elsewhere

- Stephen Few defines a dashboard as a "single-screen display of the most important information people need to do a job" ([UXmatters review of *Information Dashboard Design*](https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php)).
- Among Few's thirteen common mistakes are exceeding a single screen, too little context for the data, too much detail or precision, and failing to make important data stand out ([UXmatters](https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php)).
- NN/g defines dashboards as "collections of data visualizations, presented in a single-page view" for at-a-glance monitoring, not deep exploration ([NN/g, Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)).
- NN/g separates operational dashboards (time-sensitive, act now) from analytical dashboards (prompt further investigation) ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
- Carbon makes the same split: presentation dashboards show "the current status of key performance indicators," while exploration dashboards support search, sort, filter, roll-up and drill-down ([Carbon, Dashboards](https://carbondesignsystem.com/data-visualization/dashboards)).
- Microsoft's Power BI guidance says the dashboard "is an overview, a single place to monitor the current state," readers drill into underlying reports, so "don't put a detail on the dashboard unless that's what your readers need to monitor" ([Microsoft Learn, Tips for designing a great Power BI dashboard](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- The same page says "having all the tiles on one screen is best," asks "Can you avoid scroll bars on your dashboard?", and says to "remove all but essential information" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).

Implication: the founder's instinct is backed by the literature.
The home page is the presentation dashboard; each sidebar section is an exploration surface.

### 2. How many charts

- None of the primary sources gives a fixed number of charts.
NN/g's article gives no limit beyond "single-page view" ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)), and Carbon says only to "limit the number of metrics" and provide non-essential information as needed ([Carbon](https://carbondesignsystem.com/data-visualization/dashboards)).
- The working constraint is screen fit: one screen with no scrollbar ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)), and fewer tiles on smaller displays ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- Power BI also warns to "avoid variety for the sake of variety" in chart types ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).

Implication: "more graphs" belongs in the sections, not on Home.
Home gets one or two charts plus sparklines inside KPI cards, which add trend context without adding tiles.

### 3. Layout and emphasis

- Put "the highest level of data at the top left corner and show more detail" moving left-to-right, top-to-bottom ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- Carbon: "The most important data should have the highest contrast and occupy the largest area," and place the most important at the top, following the F-shaped reading pattern ([Carbon](https://carbondesignsystem.com/data-visualization/dashboards)).
- Card visualizations are "a good way to display an important number prominently," and each needs context ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- Use consistent colors per data set across a dashboard ([Carbon](https://carbondesignsystem.com/data-visualization/dashboards)), and do not mix time frames, such as last month next to a specific month ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- Scale big numbers: "3.4 million" reads faster than "3,400,000" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- Color should not encode quantity and should be a secondary cue, not the only one, partly because of color blindness ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).

### 4. Chart type per kind of question

- Length and 2D position are read most accurately, so bar, line and scatter charts suit quantitative data, and bars compare best when ordered by value ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
- For trends over time, "a line chart will work better than a bar chart"; bar charts are the default for comparisons, and horizontal bars fit long labels such as Location names ([NN/g, Choosing Chart Types](https://www.nngroup.com/articles/choosing-chart-types/)).
- Avoid pie and donut charts most of the time, avoid gauges (use bullet charts for value against target), avoid 3D, and keep treemaps out of actionable dashboards ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
Power BI agrees that pies, donuts and gauges "aren't ideal" and bars are better for comparing values ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
- Few recommends bullet graphs and sparklines for dashboards ([UXmatters](https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php)).
- Tufte defines a sparkline as "a small intense, simple, word-sized graphic," which in tables adds a time history beside each number and "improve[s] the attention span of tables" ([Tufte, Sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/)).
- The FT Visual Vocabulary lists the calendar heatmap under "Change over time," ordered bars under "Ranking," and diverging bars under "Deviation" from a target or average ([Financial Times, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)).
- Carbon defines a heat map as "a two-dimensional visualization in which individual values contained in a matrix are represented as colors," using sequential or diverging scales ([Carbon, Spatial charts](https://carbondesignsystem.com/data-visualization/spatial-charts/)).

### 5. Sidebar navigation

- NN/g: vertical navigation "is a good fit for broad or growing IAs," and B2B and enterprise products are the typical fit ([NN/g, Left-Side Vertical Navigation on Desktop](https://www.nngroup.com/articles/vertical-nav/)).
- Keep desktop navigation visible, not hidden behind a menu, use left-aligned, keyword-frontloaded text labels rather than icons alone, and put less important items at the bottom ([NN/g](https://www.nngroup.com/articles/vertical-nav/)).
- Avoid squeezing many destinations into a few generic categories ([NN/g](https://www.nngroup.com/articles/vertical-nav/)).
- Atlassian's Jira guidance recommends that a sidebar item be "a single link (recommended)," with deeper pages handled by in-page navigation rather than more sidebar items ([Atlassian, Jira navigation](https://developer.atlassian.com/cloud/jira/platform/navigation/)).

### 6. What comparable products do

**Toast.**
In Toast Web, Reports sits in the left navigation and opens to the Weekly Overview by default ([Toast, Weekly Overview](https://intercom.help/toast-central/en/articles/14728163-toast-reporting-dashboard-weekly-overview)).
The Weekly Overview has Key Metrics plus Net Sales, Labor Cost (dollars and percent of sales), Guest Count and Top Selling Items, each with percent change against the prior week, the same week last year, or two years ago ([Toast](https://intercom.help/toast-central/en/articles/14728163-toast-reporting-dashboard-weekly-overview)).
Each value drills into its full report: Net Sales to the Sales report, Labor Cost to Labor Summary ([Toast](https://intercom.help/toast-central/en/articles/14728163-toast-reporting-dashboard-weekly-overview)).
Reports are grouped into nine categories (Sales, Labor, Menus, Payments, Cash and Loss Management, and others), the Location filter appears only with more than one Location, and categories a user lacks permission for are absent from navigation ([Toast, Get started with analytics and reports](https://intercom.help/toast-central/en/articles/9308117-get-started-with-analytics-and-reports)).
The Location Overview report is a table with one row per Location, comparing against yesterday, the same day last week, the same day last year, or a custom range ([Toast, Location reports overview](https://support.toasttab.com/en/article/Locations-Reports-Overview)).

**7shifts.**
The help center's Dashboard section has separate Sales vs. Labor, Location, Engage, and Who's Working dashboards ([7shifts KB, Dashboard section](https://kb.7shifts.com/hc/en-us/sections/34668024975123-Dashboard)).
The Location dashboard summarizes totals across Locations, is sortable by sales, labor, SPLH and overtime, has a combined totals row, and shows managers only their assigned Locations ([7shifts KB, Location Dashboard Overview](https://kb.7shifts.com/hc/en-us/articles/34658648458899)).
The multi-location Location Overview shows combined sales, average labor percent and average SPLH against the prior week, and is hidden for single-location accounts ([7shifts KB, Operations and Enterprise Overviews](https://kb.7shifts.com/hc/en-us/articles/4417504701587)).
(The 7shifts KB blocks automated fetching; these three points come from the KB pages' indexed text.)
The Operations Overview compares Locations by day, week or month to find top and low performers, flags late arrivals and no-shows, and lets users "dive into per-location metrics" ([7shifts, Operations Overview](https://www.7shifts.com/operations-overview)).

**Restaurant365.**
The Home page in the Dashboards app (beta) combines a Profitability Overview, score details and a prioritized Recommendations widget, with a Location picker limited to Locations the user can access ([R365, Home overview](https://docs.restaurant365.com/docs/homeoverview)).
It appears automatically for specific roles, including Restaurant Manager, Above Store Manager and Operations Admin, and it "doesn't replace existing reports" ([R365](https://docs.restaurant365.com/docs/homeoverview)).

**Square.**
The Dashboard home page shows widgets for payment types, items and customers, and users "click into a widget to see more detailed reports" ([Square Community, Dashboard home page widgets](https://community.squareup.com/t5/Product-Updates/The-Dashboard-home-page-now-has-widgets/ba-p/679368)).
Reports such as Sales Summary filter to one Location or All locations, with daily, weekly or monthly comparison ([Square, Sales summary report](https://squareup.com/help/us/en/article/5530)).

**Lightspeed Restaurant (K-Series).**
The Back Office Dashboard is the home page after login, with date filters (Today, Yesterday, This week, This month, This year), sales metrics against the previous period where Today and Yesterday compare to the same day the previous week, and arrows that link to the detailed Sales summary and Products reports ([Lightspeed, Dashboard](https://k-series-support.lightspeedhq.com/hc/articles/4403208456603)).

**Harri and Crunchtime.**
Neither publishes public help-center documentation of its dashboards that could be verified, so they are not used as evidence here.

**Role-specific home pages beyond restaurants.**
Salesforce lets admins activate a Lightning home page as the org default, an app default, or for app-and-profile combinations, so each role gets its own home ([Salesforce Trailhead, Build a custom home page](https://trailhead.salesforce.com/content/learn/modules/lightning_app_builder/lightning_app_builder_homepage)).

### 7. Patterns across sources

- **Home is a summary with drill-through links, not a destination.**
Toast, Lightspeed and Square all make each home value a link into its full report ([Toast](https://intercom.help/toast-central/en/articles/14728163-toast-reporting-dashboard-weekly-overview), [Lightspeed](https://k-series-support.lightspeedhq.com/hc/articles/4403208456603), [Square](https://community.squareup.com/t5/Product-Updates/The-Dashboard-home-page-now-has-widgets/ba-p/679368)).
- **Every number has a comparison.**
The default restaurant comparison is the same day or week a week earlier ([Lightspeed](https://k-series-support.lightspeedhq.com/hc/articles/4403208456603), [Toast Location reports](https://support.toasttab.com/en/article/Locations-Reports-Overview)), matching Few's warning against data without context ([UXmatters](https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php)).
- **The cross-Location view is a sortable table with a totals row**, one row per Location ([Toast](https://support.toasttab.com/en/article/Locations-Reports-Overview), [7shifts](https://kb.7shifts.com/hc/en-us/articles/34658648458899)).
- **Navigation and widgets follow permissions**: hidden, not disabled, when the user lacks access ([Toast](https://intercom.help/toast-central/en/articles/9308117-get-started-with-analytics-and-reports), [R365](https://docs.restaurant365.com/docs/homeoverview), [7shifts](https://kb.7shifts.com/hc/en-us/articles/34658648458899)).
- **Exceptions get their own module**: R365's Recommendations ([R365](https://docs.restaurant365.com/docs/homeoverview)) and 7shifts' late and no-show flags ([7shifts](https://www.7shifts.com/operations-overview)) are the closest analogues to a "Needs attention" list.

## Recommendation for Opsell

### (1) Sidebar sections for corporate users

An always-visible left sidebar with text labels and icons, one link per section, grouped and ordered by how often corporate users need them ([NN/g](https://www.nngroup.com/articles/vertical-nav/), [Atlassian](https://developer.atlassian.com/cloud/jira/platform/navigation/)):

- **Home**
- *Operations*
  - **Closing Reports** - the Location x Business Day calendar grid, then each Closing Report.
  - **Sales & Labor** - trends and Location comparison.
- *People*
  - **HR Flags**
  - **Write-ups**
  - **Employees**
- *Tips*
  - **Tip Distribution** - by Pay Period and Location.
- **Locations** - the Location directory and each Location's own page.
- **Settings** - at the bottom, Org Admin only.

Sections a Role cannot use are absent from the sidebar, not greyed out, as in Toast and R365 ([Toast](https://intercom.help/toast-central/en/articles/9308117-get-started-with-analytics-and-reports), [R365](https://docs.restaurant365.com/docs/homeoverview)).

### (2) Home dashboard vs sections

Home is a presentation dashboard that fits one desktop screen with no scrolling ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips), [UXmatters on Few](https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php)), top to bottom:

1. **Greeting and scope line**: "Good morning, Dana" plus the Business Day shown and the Location count, for example "Yesterday, Thu Oct 16, across 12 Locations".
The scope line keeps the time frame explicit, so cards never mix time frames ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips)).
2. **KPI row, at most four cards**, each with the value, the change against the same weekday last week, and a 14-day sparkline ([Tufte](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/), [Lightspeed](https://k-series-support.lightspeedhq.com/hc/articles/4403208456603)): Net sales, Labor % of sales, Closing Reports submitted (for example 11 of 12), and Open HR Flags.
3. **Needs attention** (the largest block, top left, per [Carbon](https://carbondesignsystem.com/data-visualization/dashboards)): a ranked list of exceptions, each one line naming the Location and linking straight to the record.
Items include a missing or late Closing Report, labor % above target, an HR Flag open beyond the Organization's threshold, a Write-up awaiting delivery or with a new Rebuttal, and a Tip Distribution not finalized before its Pay Period closes.
4. **Two charts, no more**: a net sales line for the last 14 Business Days against the prior period, and labor % by Location as an ordered horizontal bar with a target line.

Each card, list item and chart links into its section, the pattern Toast, Lightspeed and Square use ([Toast](https://intercom.help/toast-central/en/articles/14728163-toast-reporting-dashboard-weekly-overview)).
Sections hold everything else: full tables, filters, date ranges, comparisons, exports, extra charts, and record detail ([Carbon](https://carbondesignsystem.com/data-visualization/dashboards)).
The founder's "more graphs" belongs in Sales & Labor, Closing Reports, HR Flags and Tip Distribution, not on Home.

### (3) Chart type per metric

| Metric | Chart | Where | Source |
|---|---|---|---|
| Net sales over Business Days | Line, with the prior period as a muted second line | Home, Sales & Labor | [NN/g](https://www.nngroup.com/articles/choosing-chart-types/) |
| Net sales or labor % by Location | Horizontal bar, ordered by value | Home (labor %), Sales & Labor | [NN/g](https://www.nngroup.com/articles/dashboards-preattentive/) |
| Labor % against target | Bullet chart per Location, or bars with a target line; never a gauge | Sales & Labor | [NN/g](https://www.nngroup.com/articles/dashboards-preattentive/) |
| Variance from target or last week | Diverging bar | Sales & Labor | [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) |
| Closing Report status per Location per Business Day | Calendar grid (categorical heat map) with icon plus color per status | Closing Reports | [FT](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md), [Carbon](https://carbondesignsystem.com/data-visualization/spatial-charts/), [NN/g on color](https://www.nngroup.com/articles/dashboards-preattentive/) |
| Labor % per Location per Business Day | Same grid with a sequential scale | Sales & Labor | [Carbon](https://carbondesignsystem.com/data-visualization/spatial-charts/) |
| Open HR Flags or Write-ups (count) | Single number card plus sparkline; by Location as an ordered bar | Home, HR Flags, Write-ups | [Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips), [Tufte](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) |
| HR Flags opened vs resolved over weeks | Column or line pair | HR Flags | [NN/g](https://www.nngroup.com/articles/choosing-chart-types/) |
| Write-ups by Write-up Level | Ordered bar, not a pie | Write-ups | [NN/g](https://www.nngroup.com/articles/dashboards-preattentive/) |
| Tip Pool per Business Day | Column | Tip Distribution | [FT](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) |
| Per-Location trend in a table | Sparkline in each row | Locations, Sales & Labor | [Tufte](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) |

No pies, donuts, gauges, 3D or treemaps anywhere ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
Each data set keeps one color across every chart ([Carbon](https://carbondesignsystem.com/data-visualization/dashboards)).

### (4) Per-role differences

One Home layout, filled per Role, the way R365 and Salesforce assign home content by role ([R365](https://docs.restaurant365.com/docs/homeoverview), [Salesforce Trailhead](https://trailhead.salesforce.com/content/learn/modules/lightning_app_builder/lightning_app_builder_homepage)):

- **Org Admin**: every section including Settings.
The KPI row and Needs attention cover operations and people.
- **Ops**: Home, Closing Reports, Sales & Labor, Tip Distribution, Employees and Locations.
No HR Flags or Write-ups in the sidebar, the KPI row (the Open HR Flags card becomes Labor hours or Tips), or Needs attention, unless the Organization toggle allows it; then they appear exactly as for Org Admin.
- **HR**: Home leads with Open HR Flags, Write-ups awaiting delivery, and new Rebuttals.
Sales and labor cards drop below or out, and the charts become HR Flags opened vs resolved and open HR Flags by Location.
Whether HR sees Sales & Labor at all is a permissions question for the Role definitions, not this research.

Hidden means absent: no locked items or empty cards ([Toast](https://intercom.help/toast-central/en/articles/9308117-get-started-with-analytics-and-reports)).

### (5) Calendar grid and drill-down

- The calendar grid is the landing view of **Closing Reports**: Locations as rows (sortable, with a totals row as in [7shifts](https://kb.7shifts.com/hc/en-us/articles/34658648458899) and [Toast](https://support.toasttab.com/en/article/Locations-Reports-Overview)), the last 14 Business Days as columns, and each cell showing submitted, late, missing, or contains HR Flags, with an icon and a color, never color alone ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
- Home does not repeat the grid.
Its Closing Reports KPI card and its missing-report items in Needs attention link into the grid, already filtered.
- Drill-down follows Organization, then Location, then Business Day:
  - A row header opens that Location's page, with its own KPIs, trends and open items.
  - A cell opens the Closing Report for that Location and Business Day.
  - A breadcrumb (Organization > Location > Business Day) leads back up.
  - Filters and date range persist on the way down and back, and linked charts update together ([Carbon](https://carbondesignsystem.com/data-visualization/dashboards)).
- Period comparison defaults to the same weekday last week, with last year as the alternative, matching restaurant products ([Lightspeed](https://k-series-support.lightspeedhq.com/hc/articles/4403208456603), [Toast](https://support.toasttab.com/en/article/Locations-Reports-Overview)).
- Sales & Labor reuses the same grid component with a sequential color scale for labor % per Location per Business Day ([Carbon](https://carbondesignsystem.com/data-visualization/spatial-charts/)).

## Open questions

- Exception thresholds (labor % target, HR Flag age) need defaults per Organization; their source is a Settings question.
- Whether HR sees Sales & Labor depends on the Role definitions.
- Harri and Crunchtime dashboard structures could not be verified from public docs; a design-partner Organization on Harri could show one.
