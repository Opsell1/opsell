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

## Operations

**Business Day**:
A Location's operating day, ending at that Location's local cutoff rather than at midnight, so a late close still belongs to the day it started.
_Avoid_: Calendar day, shift day, date

**Closing Report**:
The single record a Location submits for each Business Day, combining closing notes with sales and labor figures.
_Avoid_: Closing notes, nightly report, sales report

**HR Flag**:
A record about exactly one Employee that routes an HR-relevant event to HR, either confirmed by a Closing Report's author from its notes or raised directly by a GM or Manager, and open until HR resolves it.
_Avoid_: HR ticket, HR issue, incident

## Employee records

**Write-up**:
A formal disciplinary record issued to an Employee and attached to their history.
_Avoid_: Disciplinary form, warning, incident report

## Tips

**Tip Distribution**:
The split of tips collected during a shift among eligible Employees in proportion to hours worked.
_Avoid_: Tip calculation, tip out
