# Opsell

Opsell is a multi-tenant operations product that helps restaurant managers spend less time on paperwork and gives corporate teams visibility into operations and employee records.

## Tenancy

**Organization**:
A customer company that subscribes to Opsell; the tenant boundary that owns all its Locations, people, and records.
_Avoid_: Tenant, company, restaurant, account

**Location**:
A single physical store operated by an Organization.
_Avoid_: Store, restaurant, branch, site

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
The role that owns an Organization's setup: its Locations, users, Role assignments, settings, and billing.
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

**Closing Report**:
The single record a Location submits for each Business Day, combining closing notes with sales and labor figures.
_Avoid_: Closing notes, nightly report, sales report

**HR Flag**:
A per-Employee item, suggested from a Closing Report's notes and confirmed by its author, that routes an HR-relevant event to HR.
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
The tips a Location collects in one Business Day that are shared among its eligible Employees: card tips plus the counted cash tip jar, but not cash an Employee declares as received directly.
_Avoid_: Tip jar, tip bucket, shift tips

**Tip Distribution**:
The split of one Tip Pool among the Employees eligible on that Business Day, in proportion to their hours weighted by the Position they worked.
_Avoid_: Tip calculation, tip out, tip split

**Tip Policy**:
A Location's effective-dated rules for its Tip Pool: which Positions are eligible, each Position's weight, and whether a tip credit is taken.
_Avoid_: Tip rules, tip settings

**Pay Period**:
The Organization's recurring payroll window (weekly, biweekly or semimonthly) that groups Tip Distributions for export to payroll.
_Avoid_: Pay cycle, payroll week
