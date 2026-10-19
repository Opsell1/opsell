# Tip Waiting Period pools a new hire's own tips, and is blocked in MN, CA and MA

A Location's Tip Policy can set a Tip Waiting Period: the new hire's hours are left out of the split, and the tips they earn stay in the Tip Pool for the eligible Employees, so they receive $0 from it until their waiting days are worked.
We chose this over handing a waiting Employee back the tips they earned because it matches how restaurants run a waiting period today, and because it needs no per-check tip attribution, which not every source provides.
The research ([Tip eligibility waiting periods under US law](https://github.com/Opsell1/opsell/issues/50)) recommended the opposite, so the setting is blocked outright where the law makes it forbidden or high risk (MN, CA, MA), and everywhere else the Organization carries the risk of its own Tip Policy.

## Considered Options

- **Give the waiting Employee back the tips they earned**: lawful wherever the setting is offered, but it needs card tips attributed per check, and the setting would be unavailable wherever the source can't provide that.
- **Also block NY, WA, OR, AK and MT**, where the research rated this leaning unlawful or unsettled: safer, but it rules out much of the market for a practice Organizations already run.

## Consequences

- Federally a tip credit is lost for hours where an Employee's tips go into a pool they take nothing from, so turning the setting on at a tip-credit Location requires confirming full cash minimum wage, and the payroll export flags those hours.
- Cash an Employee declares as received directly is never pooled, so it always stays with the new hire.
- Moving to the "give tips back" model later means adding per-check attribution to every data source and migrating every Tip Policy that uses the setting.
- The blocked-states list is data next to the tip credit and back-of-house gates, so it can grow if counsel advises it.
