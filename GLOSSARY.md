# Opsell

Opsell is a multi-tenant operations product that helps restaurant managers spend less time on paperwork and gives corporate teams visibility into operations and employee records.

## Tenancy

**Organization**:
A customer company that subscribes to Opsell; the tenant boundary that owns all its Locations, people, and records.
_Avoid_: Tenant, company, restaurant, account

**Location**:
A single physical store operated by an Organization.
_Avoid_: Store, restaurant, branch, site

**Terminated Organization**:
An Organization whose contract has ended, kept read-only so its Org Admins can export it for a fixed window, after which all its data is purged.
_Avoid_: Churned, cancelled, closed, deleted Organization
**Suspended Organization**:
An Organization that Platform Staff have made read-only for everyone, usually for non-payment, until they reactivate it; unrelated to a suspension Write-up Level, which disciplines an Employee.
_Avoid_: Frozen, locked, deactivated, inactive Organization
**Demo Organization**:
An Organization populated entirely with fictional people and operations for showing Opsell to prospects, which can never hold real people or connect to a real data source.
_Avoid_: Sandbox, test tenant, trial account

## People

**Employee**:
A person employed by an Organization who works shifts at one or more Locations, whatever their Role, with a limited Opsell account of their own; corporate users with an Organization-wide Role are never Employees.
_Avoid_: Crew member, staff, worker

**Employment Period**:
One continuous stretch of an Employee's employment, from hire to separation; a rehire opens a new Employment Period on the same Employee rather than a new Employee.
_Avoid_: Stint, tenure, rehire record

**Team Member**:
The Role of an Employee with no supervisory duties, who sees only their own records.
_Avoid_: Employee (as a Role name), crew, hourly

**Org Admin**:
The role that owns an Organization's setup: its Locations, users, Role assignments, and settings.
_Avoid_: Admin, owner, super admin

**Platform Staff**:
Opsell's own support and operations people, who sit outside every Organization and access tenant data only through audited support access.
_Avoid_: Admin, super admin, vendor

**Role**:
One of the fixed, Opsell-defined sets of permissions assigned to a user within an Organization, adjustable only through per-Organization toggles.
_Avoid_: Permission group, user type

**Position**:
The job an Employee works on a given shift, such as server, cook or host, classed as front or back of house; it describes the work, never the Employee's permissions.
_Avoid_: Role (for the job worked), duty, job title

## Operations

**Business Day**:
A Location's operating day, ending at that Location's local cutoff rather than at midnight, so a late close still belongs to the day it started.
_Avoid_: Calendar day, shift day, date

**Go-live Business Day**:
The first Business Day a Location runs on Opsell; Closing Reports, Tip Distributions and their deadlines start from it, and nothing earlier is ever Overdue.
_Avoid_: Launch date, start date, cutover

**Closing Report**:
The single record a Location submits for each Business Day, combining Closing Notes with sales and labor figures.
_Avoid_: Closing notes (for the whole report), nightly report, sales report

**Closing Note**:
One entry in a section of a Closing Report, written by exactly one person and always shown under that person's name.
_Avoid_: Note entry, comment, remark, log entry

**Sales Channel**:
The Opsell-defined way an order reached a Location (Counter, Own online, Delivery apps, or Catering & advance), which each Organization maps its point-of-sale order types onto.
_Avoid_: Order source, revenue center, dining option, order type

**HR Flag**:
A record about exactly one Employee that routes an HR-relevant event to HR, either confirmed by a Closing Report's author from its notes or raised directly by a GM or Manager, and open until HR resolves it.
_Avoid_: HR ticket, HR issue, incident

## Employee records

**Write-up**:
A formal disciplinary record issued to exactly one Employee, delivered in a meeting, and attached to their history.
_Avoid_: Disciplinary form, warning, incident report

**Write-up Level**:
The step a Write-up sits at on Opsell's fixed disciplinary ladder: documented verbal warning, written warning, final written warning, or suspension.
_Avoid_: Severity, warning type

**Rebuttal**:
An Employee's own written response to a Write-up, which travels with it and never changes it.
_Avoid_: Comment, appeal, dispute

## Tips

**Tip Pool**:
The tips a Location collects in one Business Day that are shared among its eligible Employees: the card and cash tips recorded in its POS, plus any additional tips from other sources, but not cash an Employee declares as received directly.
_Avoid_: Tip jar, tip bucket, shift tips

**Additional Tips**:
Staff tips a Location received outside its POS on a Business Day, such as a counted tip jar or a catering tip check, each recorded with its amount and, optionally, where it came from, and added to that day's Tip Pool.
_Avoid_: Extra tips, cash jar, manual tips, other tips

**Tip Distribution**:
The split of one Tip Pool among the Employees eligible on that Business Day, in proportion to their hours weighted by the Position they worked.
_Avoid_: Tip calculation, tip out, tip split

**Covering Shift**:
A shift an Employee works at a Location that is not one of their works-at Locations; it belongs to, and pools at, the Location where it was worked.
_Avoid_: Loan, transfer, borrowed shift

**Tip Policy**:
A Location's effective-dated rules for its Tip Pool: which Positions are eligible, each Position's weight, whether a tip credit is taken, and the length of any Tip Waiting Period.
_Avoid_: Tip rules, tip settings

**Tip Policy Notice**:
The written statement of one version of a Location's Tip Policy that Employees who may share in its Tip Pool receive before that version takes effect.
_Avoid_: Tip policy document, tip disclosure, tip agreement

**Tip Policy Acknowledgment**:
An Employee's signed confirmation that they received a Tip Policy Notice, which records receipt rather than agreement.
_Avoid_: Tip policy signature, consent, agreement

**Tip Waiting Period**:
The first days a newly hired Employee works in tip-eligible Positions, during which they take no share of any Tip Pool even though tips they earn stay in it.
_Avoid_: Probation, training period, tip eligibility delay

**Pay Period**:
The Organization's recurring payroll window (weekly, biweekly or semimonthly) that groups Tip Distributions for export to payroll.
_Avoid_: Pay cycle, payroll week

## Retention

**Retention Period**:
How long Opsell keeps a kind of record before purging it, never shorter than Opsell's legal minimum for that kind of record, and lengthened only by the Organization.
_Avoid_: TTL, expiry, archive period

**Purge**:
The permanent deletion of a record and its files once its Retention Period has ended and no Legal Hold applies; the only way a record ever leaves Opsell, unlike voiding or archiving, which keep it.
_Avoid_: Delete, remove, expire

**Legal Hold**:
A hold on everything about one Employee, or on a whole Organization, that stops every Purge until it is released, placed when a lawsuit, charge or investigation is expected.
_Avoid_: Freeze, lock, litigation flag
## Oversight

**Audit Log**:
The append-only record of every change to an Organization's data, and of every Platform Staff read or export, naming who did it, when, and what changed from what.
_Avoid_: Activity feed, history, change log

**Support Access**:
A time-boxed, read-only window an Org Admin grants Platform Staff into their Organization, excluding Write-ups, HR Flags and Rebuttals unless the Org Admin includes them.
_Avoid_: Impersonation, admin access, login as

**Break-glass Access**:
Support Access that Platform Staff open without an Org Admin's grant when none can give it, with a stated reason and a second Platform Staff approval, never including Write-ups, HR Flags or Rebuttals.
_Avoid_: Emergency override, god mode
## Notifications

**Notification**:
A message in a user's Opsell inbox telling them that something happened on a record they can see, which they mark read rather than act on.
_Avoid_: Alert, message, ping

**To-do**:
An item in a user's inbox asking them to act on a specific record, which clears itself once that work is done rather than when it is read.
_Avoid_: Task, action item

**Reminder**:
An item a person writes for a Location or for themselves to remember something, either a Location Reminder shared with the Location or a Personal Reminder only its writer sees; unlike a To-do, it does not clear itself when work on a record is done.
_Avoid_: To-do, task, note

**Digest**:
A single scheduled email summarizing a user's Notifications, open To-dos and Overdue items since the previous one.
_Avoid_: Summary email, newsletter, report
