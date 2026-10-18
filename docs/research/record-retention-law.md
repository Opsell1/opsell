# US record retention and deletion law

Research for [issue #42](https://github.com/Opsell1/opsell/issues/42), child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1), blocking [issue #31](https://github.com/Opsell1/opsell/issues/31).
Researched 2026-10-18.
This is product research, not legal advice; an employment and privacy lawyer should review the final retention schedule and the customer DPA before launch.

Builds on, and does not repeat, [e-signed-write-up-law.md](e-signed-write-up-law.md) (personnel files in CA, MA, CT, IL) and [us-tip-pool-law.md](us-tip-pool-law.md) (tip records).
One correction to the Write-up research is noted in section 3.

## Question

What US legal minimums and maximums govern how long Opsell's customers must (or may) keep each kind of record, and what must happen to records after an Employee separates or a customer stops using a SaaS vendor?
Scope: federal law plus California, New York, Massachusetts and Texas, with notable outliers.

## Short answer

- There is no general US maximum retention period for employment records; the law sets floors, and the only ceilings come from privacy law (CCPA "no longer than reasonably necessary") and narrow rules like Illinois' 4-year disclosure limit on discipline.
- The longest floors relevant to Opsell are New York's 6 years for payroll and tip records, Texas' 4 years for payroll under unemployment tax rules, California's 4 years for personnel files after the employment action, and New York's 18 years for the employer's record of workplace injuries.
- Opsell's copy of hours and sales from the time clock and POS is not the employer's primary payroll record, but Opsell's Tip Distributions probably are the only record of how tips were split, so they must be kept to payroll-record standards (6 years in New York).
- An injury HR Flag is evidence that feeds the OSHA 301 / workers' comp report, not the OSHA record itself, and restaurants are partially exempt from OSHA logs anyway; but any medical detail in it should be treated as a confidential medical record with restricted access.
- New York and Texas give private-sector former employees no general right to see their personnel file; payroll and OSHA access rights still apply.
- California employees have had full CCPA rights since 2023, but only against employers that meet the CCPA "business" thresholds, and retention required by law is an exception to deletion; Opsell as service provider must help with deletions and must not keep data beyond the contracted purpose.
- After a customer churns, nothing in US law sets the vendor's deletion clock; the market norm is a 30 to 90 day export window and deletion from all systems including backups within about 180 days.
- Deleting on a documented schedule is lawful once no legal hold applies; the duty to preserve starts when litigation or an investigation is reasonably anticipated, not only when it is filed.

## 1. Payroll, time, hours and tip records

### Federal

FLSA recordkeeping (29 CFR 516):

- Payroll records with the required employee data must be preserved "for at least 3 years" from the last entry, together with certificates, agreements and notices, and records of total sales volume ([29 CFR 516.5](https://www.law.cornell.edu/cfr/text/29/516.5)).
- "Basic time and earning cards or sheets on which are entered the daily starting and stopping time" of employees, and wage rate tables, are preserved for at least 2 years ([29 CFR 516.6](https://www.law.cornell.edu/cfr/text/29/516.6)).
- Tip-credit and mandatory-pool records are covered by [29 CFR 516.28](https://www.law.cornell.edu/cfr/text/29/516.28), summarized in the tip research; they fall under the 3-year rule.
- "No particular order or form of records is prescribed", and records may be kept in automated data processing form if reproductions "are clear and identifiable by date or pay period" ([29 CFR 516.1(a)](https://www.law.cornell.edu/cfr/text/29/516.1)).
- Records may be kept at the worksite or a central records office, but must be "made available within 72 hours following notice from the Administrator" ([29 CFR 516.7](https://www.law.cornell.edu/cfr/text/29/516.7)).
- FLSA claims have a 2-year limitations period, 3 years if willful ([29 U.S.C. 255(a)](https://www.law.cornell.edu/uscode/text/29/255)), which is why the 3-year floor matters in practice.

IRS employment tax records, which include tip reports and wages, must be kept "for at least four years after the due date of such tax or the date such tax is paid, whichever is the later" ([26 CFR 31.6001-1(e)(2)](https://www.law.cornell.edu/cfr/text/26/31.6001-1)).

Other federal Employee records Opsell may hold:

- Form I-9: three years after hire or one year after termination, whichever is later ([8 CFR 274a.2(b)(2)(i)(A)](https://www.law.cornell.edu/cfr/text/8/274a.2)).
- FMLA records: at least three years ([29 CFR 825.500(b)](https://www.law.cornell.edu/cfr/text/29/825.500)).
- Personnel and discipline records: 1 year (EEOC/ADEA), already covered in the Write-up research.

### California

- Payroll records showing "the hours worked daily by and the wages paid to" employees: "not less than three years" ([Cal. Lab. Code 1174(d)](https://california.public.law/codes/ca_lab_code_section_1174)).
- Itemized wage statements and deduction records: "at least three years"; current and former employees may inspect or copy "records pertaining to their employment", with a response "no later than 21 calendar days from the date of the request" ([Cal. Lab. Code 226(a)-(c)](https://california.public.law/codes/ca_lab_code_section_226)).
- Restaurant wage order: time records "showing when the employee begins and ends each work period", meal periods and total daily hours, kept "for at least three years", available to the employee on reasonable request ([8 CCR 11050 section 7](https://www.dir.ca.gov/t8/11050.html)).
- Gratuities: "Every employer shall keep accurate records of all gratuities received by him" ([Cal. Lab. Code 353](https://california.public.law/codes/ca_lab_code_section_353)); the section sets no period, so the 3-year payroll floor is the working minimum.

### New York (the outlier)

- Payroll records, including hours worked, rates, and allowances such as tip credits: "not less than six years" ([N.Y. Lab. Law 195(4)](https://www.nysenate.gov/legislation/laws/LAB/195)).
- Signed pay-notice acknowledgments: kept six years ([N.Y. Lab. Law 195(1)](https://www.nysenate.gov/legislation/laws/LAB/195)).
- Hospitality wage order: weekly payroll records "at least six years", including hours worked daily and weekly and tip credits ([12 NYCRR 146-2.1](https://www.law.cornell.edu/regulations/new-york/12-NYCRR-146-2.1)).
- Tip pools: a daily, per-shift log of tips and of each employee's share, kept at least six years ([12 NYCRR 146-2.17](https://www.law.cornell.edu/regulations/new-york/12-NYCRR-146-2.17), detailed in the tip research).
- Wage claims may be brought "within six years" ([N.Y. Lab. Law 198(3)](https://www.nysenate.gov/legislation/laws/LAB/198)).

### Massachusetts

- Name, address, occupation, wages each pay period and hours worked each day and week: kept "at least 3 years after the entry date of the record", and employees may inspect their own records "at reasonable times and places" ([M.G.L. c.151 s.15](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter151/Section15)).
- For employers of 20 or more, the personnel record includes "rate of pay and any other compensation paid", so pay data also falls under the 3-years-after-termination personnel rule ([M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C)).

### Texas

- Unemployment tax rules require each employer to keep, per worker, name, address, SSN, dates of service, wages per pay period and, for part-time pay periods, hours and dates worked, and "The records prescribed by this subchapter and the Act shall be preserved for four years" ([40 TAC 815.106](https://www.law.cornell.edu/regulations/texas/40-Tex-Admin-Code-SS-815-106)).
- TWC advises that because of this rule "it is a good idea to keep all wage and hour records for at least four years" ([TWC, Recordkeeping - General](https://efte.twc.texas.gov/recordkeeping_general.html)).
- Not verified: whether the Texas Minimum Wage Act imposes separate records duties on FLSA-covered employers; FLSA and TWC rules govern in practice.

### Does Opsell's snapshot count as the employer's payroll record?

The legal duty sits with the employer, and FLSA lets the employer keep required records in any form and place as long as they are complete and producible within 72 hours (516.1, 516.7).
So the question is which system holds the authoritative copy of each required data item.

- Hours worked, clock-in and clock-out, and wage rates: the system of record is the customer's time clock or payroll provider, which already carries the retention duty.
  Opsell's Closing Report snapshot is a derived copy, not the employer's record, as long as Opsell never becomes the only place an hours edit lives.
  If a manager adjusts hours or tips in Opsell and that adjustment is pushed to payroll, the Opsell entry becomes part of the payroll record for that pay period (inference; no rule addresses derived copies directly).
- Sales: the POS is the system of record for 516.5(c) sales volume; the Closing Report's sales figures are a copy.
- Tip Distributions: Opsell computes the per-shift tip lines and exports them as the payroll CSV.
  For most customers Opsell will be the only place that shows how a pool was split, who was eligible, and each Employee's share per shift, which is exactly what 12 NYCRR 146-2.17, 29 CFR 516.28 and Cal. Lab. Code 353 require the employer to keep.
  Treat Tip Distributions (inputs, rules, outputs, and edits) as payroll records: at least 6 years in New York, 4 years in Texas, 3 years elsewhere, and 4 years anywhere for IRS purposes as they back reported tip income.

## 2. Workplace injury records

### OSHA recordkeeping

- Retention: the OSHA 300 Log, the privacy case list, the annual summary and the 301 Incident Reports are kept "five (5) years following the end of the calendar year that these records cover", and the 300 Log must be updated during that period ([29 CFR 1904.33](https://www.law.cornell.edu/cfr/text/29/1904.33)).
- Small employers: a company with "10 or fewer employees at all times during the last calendar year", measured company-wide, need not keep the records unless asked in writing ([29 CFR 1904.1](https://www.law.cornell.edu/cfr/text/29/1904.1)).
- Restaurants are partially exempt: NAICS 7221 Full-Service Restaurants and 7222 Limited-Service Eating Places are on Appendix A ([OSHA, 1904 Subpart B App A](https://www.osha.gov/laws-regs/regulations/standardnumber/1904/1904SubpartBAppA)), and OSHA confirms that reclassification to 2012 NAICS 7225 "does not change their partially exempt status" ([OSHA FAQ 2-3](https://www.osha.gov/faq/2-3)).
  California's Cal/OSHA list exempts the same two codes ([8 CCR 14300.2](https://www.dir.ca.gov/t8/14300_2.html)).
  The exemption is per establishment, so a customer's catering kitchen or bar classified elsewhere may still owe logs.
- Reporting still applies to everyone: fatalities, in-patient hospitalizations, amputations and loss of an eye must be reported to OSHA even by exempt employers ([29 CFR 1904.1](https://www.law.cornell.edu/cfr/text/29/1904.1), [1904.39](https://www.law.cornell.edu/cfr/text/29/1904.39)).
- Recordability: a case is recorded only if it is work-related, new, and meets a general criterion ([29 CFR 1904.4](https://www.law.cornell.edu/cfr/text/29/1904.4)): death, days away, restricted work, medical treatment beyond first aid, loss of consciousness, or a significant diagnosed injury; bandages, cleaning a wound, hot or cold therapy and non-prescription medication are first aid ([29 CFR 1904.7](https://www.law.cornell.edu/cfr/text/29/1904.7)).
- Privacy cases: for injuries to an intimate body part, sexual assault, mental illness, HIV/hepatitis/TB, contaminated needlesticks, and illnesses where the employee asks, the employer writes "privacy case" instead of the name and keeps a separate confidential list ([29 CFR 1904.29(b)(6)-(9)](https://www.law.cornell.edu/cfr/text/29/1904.29)).
- Equivalent forms and computer records are allowed if they contain the same information and can produce the forms "when they are needed" ([29 CFR 1904.29(b)(4)-(5)](https://www.law.cornell.edu/cfr/text/29/1904.29)).
- Access: employees, former employees and personal representatives get 300 Log and 301 copies "by the end of the next business day"; union representatives get only the "Tell us about the case" part of the 301 within 7 calendar days ([29 CFR 1904.35(b)(2)](https://www.law.cornell.edu/cfr/text/29/1904.35)).

### State injury records

- New York (outlier): every employer "shall record any injury or illness incurred by one of its employees in the course of employment", and the record "shall be maintained by the employer, or a third party designated by the employer, for at least eighteen years"; lost-time or beyond-first-aid injuries are reported to the Workers' Compensation Board "within ten days" ([N.Y. Workers' Comp. Law 110](https://www.nysenate.gov/legislation/laws/WKC/110)).
  This applies regardless of the OSHA restaurant exemption.
- California: workplace violence incident logs (required of most employers since July 1, 2024) must be "maintained for a minimum of five years" and must omit personal identifying information; hazard records 5 years, training records 1 year ([Cal. Lab. Code 6401.9(d), (f)](https://california.public.law/codes/ca_lab_code_section_6401.9)).
  An HR Flag for a violent incident at a California Location is likely input to this log.

### Is an injury HR Flag an OSHA record?

No, not by itself.
An HR Flag is a manager's contemporaneous note that an event happened; the OSHA record is the 300 Log entry and the 301 form (or an equivalent with the same fields), made within 7 days once the employer decides the case is recordable ([29 CFR 1904.29](https://www.law.cornell.edu/cfr/text/29/1904.29)).
The HR Flag is evidence the employer uses to decide recordability and fill in the 301, and in New York it may be the start of the WCL 110 record.
It becomes an OSHA record only if the customer chooses to use Opsell as its 301 equivalent, which would require capturing every 301 field.
Because it is evidence about an injury, it is subject to legal-hold and retention logic, and keeping it at least as long as the official record it supports (5 years after the calendar year, 18 years in New York) is the defensible default.

### Medical confidentiality (ADA)

- Medical information obtained through employer examinations or inquiries must be "collected and maintained on separate forms and in separate medical files" and treated as a "confidential medical record", with only three exceptions: supervisors and managers may learn work restrictions and accommodations, first aid and safety personnel may be told if emergency treatment might be needed, and government investigators get relevant information on request ([29 CFR 1630.14(b)(1), (c)(1), (d)(4)](https://www.law.cornell.edu/cfr/text/29/1630.14)).
- FMLA medical certifications must likewise be kept in "separate files/records from the usual personnel files", under ADA confidentiality when the ADA applies ([29 CFR 825.500(g)](https://www.law.cornell.edu/cfr/text/29/825.500)).
- The regulations set no special retention period for medical files; the general personnel floors apply.
- Inference: a factual note ("cut hand on slicer, bandaged, finished shift") is an incident record; a diagnosis, treatment detail, restriction, or doctor's note is medical information that should sit in a restricted compartment visible only to HR, not to every manager who can see HR Flags.

## 3. Personnel-file access after separation: New York and Texas

### New York

- No private-sector personnel-file access statute was found; Labor Law 195 requires keeping records but does not give employees a right to inspect them, and the only employee-facing right is a written explanation of how wages were computed, on request ([N.Y. Lab. Law 195(3)](https://www.nysenate.gov/legislation/laws/LAB/195)).
- Separation duty: the employer must notify a terminated employee in writing of the exact termination date and the date benefits end, "In no case ... more than five working days after the date of such termination" ([N.Y. Lab. Law 195(6)](https://www.nysenate.gov/legislation/laws/LAB/195)).
- Former employees can still obtain records through OSHA access (1904.35), through discovery in a wage claim during the 6-year limitations period, and through the six-year payroll retention.

### Texas

- "Texas law does not require an employer to allow an employee to access his or her personnel file"; public employees use the Public Information Act, and TWC notes "most companies allow supervised access and copying of contents at the employee's cost" ([TWC, Personnel Files - Details](https://efte.twc.texas.gov/personnel_files_details.html); [TWC, Personnel Files - General](https://efte.twc.texas.gov/personnel_files_general.html)).
- OSHA records are the exception: employees and former employees get them by the end of the next business day ([same TWC page](https://efte.twc.texas.gov/personnel_files_details.html)).
- Not verified: Tex. Lab. Code 52.031 (a "service letter" rule descended from former art. 5196 letting a discharged employee of certain corporations demand a statement of the cause of discharge).
  Its 1907 predecessor was held unconstitutional in St. Louis Southwestern Ry. v. Griffin (Tex. 1914), and a 1989 Attorney General opinion treated that holding as still controlling ([Tex. Att'y Gen. Op. JM-1116](https://www.texasattorneygeneral.gov/sites/default/files/opinion-files/opinion/1989/jm1116.pdf)); the current codified text could not be retrieved.

### Correction to the Write-up research (California)

The Write-up research cited 2 CCR 11013 for a 2-year California floor.
The statute was lengthened: employers must keep applications and personnel records "a minimum period of four years after the records and files are initially created or received", and personnel files of terminated employees four years "after the date of the employment action taken", extended while a verified complaint is pending ([Cal. Gov. Code 12946](https://california.public.law/codes/ca_gov't_code_section_12946)).
California's floor for Write-ups and other personnel records is therefore 4 years after separation, not 3.

## 4. Employee data deletion rights (CCPA/CPRA)

### Who it covers

- The employee and applicant exemption in Civ. Code 1798.145(m) "shall become inoperative on January 1, 2023" ([Cal. Civ. Code 1798.145(m)(4)](https://california.public.law/codes/ca_civ_code_section_1798.145)), so California Employees are full "consumers" ("a natural person who is a California resident", [1798.140(i)](https://california.public.law/codes/ca_civ_code_section_1798.140)).
- Only a "business" owes the duties: a for-profit doing business in California with annual gross revenue over $25,000,000 as adjusted, or that buys, sells or shares data of 100,000+ consumers, or earns 50%+ of revenue from selling or sharing data ([1798.140(d)(1)](https://california.public.law/codes/ca_civ_code_section_1798.140)).
  The revenue threshold is $26,625,000 from January 1, 2025 ([CPPA, Updated Monetary Thresholds](https://cppa.ca.gov/regulations/cpi_adjustment.html)).
  A single restaurant usually falls below it; a multi-unit restaurant group often does not.
- Texas' comprehensive privacy law excludes "an individual acting in a commercial or employment context" from "consumer" ([Tex. Bus. & Com. Code 541.001, as enacted by H.B. 4 (2023)](https://capitol.texas.gov/tlodocs/88R/billtext/html/HB00004F.HTM)), so Texas Employees have no comparable rights.
- Not verified in this pass: New York and Massachusetts had no comprehensive consumer privacy statute covering employees as of the sources reviewed; recheck before launch.

### Rights and how retention interacts

- Right to delete: "A consumer shall have the right to request that a business delete any personal information" collected from them, and the business must tell its service providers and contractors to delete too ([1798.105(a), (c)](https://california.public.law/codes/ca_civ_code_section_1798.105)).
- Exceptions include keeping data reasonably necessary to "Comply with a legal obligation", for a service "reasonably anticipated by the consumer within the context of a business' ongoing business relationship", and for "solely internal uses that are reasonably aligned with the expectations of the consumer" ([1798.105(d)](https://california.public.law/codes/ca_civ_code_section_1798.105)).
  The Act also does not restrict a business's ability to comply with law or a subpoena, or to "Exercise or defend legal claims" ([1798.145(a)(1)](https://california.public.law/codes/ca_civ_code_section_1798.145)).
- So a former Employee's deletion request cannot remove payroll, tip, personnel, I-9 or injury records still inside their retention floor or under a legal hold.
- But a partial denial is still work: the business must explain the basis, "Delete the consumer's personal information that is not subject to the exception", use the retained data only for the excepted purpose, and instruct service providers to do the same ([11 CCR 7022(f)](https://www.law.cornell.edu/regulations/california/11-CCR-7022)).
- Deletion means permanently erasing, deidentifying, or aggregating ([11 CCR 7022(b)](https://www.law.cornell.edu/regulations/california/11-CCR-7022)); data in archived or backup systems may wait until the system is restored or next accessed ([11 CCR 7022(d)](https://www.law.cornell.edu/regulations/california/11-CCR-7022)).
- Retention ceiling: a business must disclose how long it keeps each category of personal information and may not keep it "longer than is reasonably necessary for that disclosed purpose" ([1798.100(a)(3)](https://california.public.law/codes/ca_civ_code_section_1798.100)).
  This is the only general US ceiling found; it means "keep everything forever" is not a defensible default for California customers.
- The right to know (access) also applies; it overlaps with Lab. Code 226 and 1198.5 access rights already covered.

### Opsell as service provider

- A service provider processes on a business's behalf under a written contract that prohibits it from selling or sharing the data and from "Retaining, using, or disclosing the personal information for any purpose other than for the business purposes" specified, or outside the direct relationship ([1798.140(ag)(1)](https://california.public.law/codes/ca_civ_code_section_1798.140); contract required by [1798.100(d)](https://california.public.law/codes/ca_civ_code_section_1798.100)).
- The contract must also list specific business purposes, require CCPA compliance at the same level of protection, allow the business to verify compliance, require notice if Opsell can no longer comply, and require Opsell to help the business answer consumer requests ([11 CCR 7051(a)](https://www.law.cornell.edu/regulations/california/11-CCR-7051)); subprocessors need flow-down contracts ([7051(b)](https://www.law.cornell.edu/regulations/california/11-CCR-7051)).
- On a deletion request passed on by the customer, Opsell must cooperate and notify its own subprocessors ([11 CCR 7022(c)](https://www.law.cornell.edu/regulations/california/11-CCR-7022)).
- On contract termination: 7051 does not prescribe return or deletion, but once the contract ends there is no business purpose left, so continued retention would breach the "no retaining for any other purpose" term; the DPA should state an export window and a deletion deadline (inference from 1798.140(ag)(1)).

## 5. SaaS churn norms: export, deletion, backups, certificates

No US statute sets a vendor's post-termination deletion deadline; these are contract and audit norms.

| Vendor | Export or recovery window | Deletion deadline | Source |
| --- | --- | --- | --- |
| Google Cloud / Workspace | Up to 30 days recovery after term ends | "within a maximum period of 180 days" | [Google Cloud DPA s.6.2](https://cloud.google.com/terms/data-processing-addendum) |
| Microsoft 365 | 90 days in a limited-function account | "No more than 180 days after expiration or termination" | [Microsoft Learn](https://learn.microsoft.com/en-us/compliance/assurance/assurance-data-retention-deletion-and-destruction-overview) |
| AWS | 30 days retrieval after termination (if paid up) | Not stated in the agreement | [AWS Customer Agreement s.5.3(b)](https://aws.amazon.com/agreement/) |
| Salesforce | 30 days to request export (not verified verbatim; PDF unreadable) | Per its Security, Privacy and Architecture docs | [Salesforce MSA](https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/legal/Salesforce_MSA.pdf) |

- Google's 180-day maximum also governs deletions made during the term, which is the clearest public statement that backups are included in a 180-day cycle ([Google Cloud DPA s.6.1](https://cloud.google.com/terms/data-processing-addendum)).
- SOC 2: the Trust Services Criteria include disposal criteria for confidential information (C1.2) and personal information (P4.3); the AICPA text itself was not retrieved, so the wording is unverified ([secondary summary](https://cyberday.ai/requirement/soc-2-p4-3-secure-disposal-of-personal-information)).
  In practice auditors test that a documented retention and disposal policy exists and is followed, which favors an automated, logged deletion job over ad hoc deletion.
- Deletion certificates: written confirmation of deletion on request is a common DPA term, not a legal requirement found in any US statute reviewed (unverified market practice).
- Disposal standards: state laws govern how records are destroyed, not when.
  California requires "all reasonable steps to dispose" of customer records by shredding, erasing or making them unreadable ([Cal. Civ. Code 1798.81](https://california.public.law/codes/ca_civ_code_section_1798.81)); Massachusetts requires electronic records be "destroyed or erased so that personal information cannot practicably be read or reconstructed", including by third-party disposers ([M.G.L. c.93I s.2](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXV/Chapter93I/Section2)); New York requires shredding, destroying, making unreadable, or "commonly accepted industry practices" ([N.Y. Gen. Bus. Law 399-h](https://www.nysenate.gov/legislation/laws/GBS/399-H)).

## 6. Legal hold

### What triggers it

- Litigation: the federal sanction rule applies to electronically stored information "that should have been preserved in the anticipation or conduct of litigation", and "Rule 37(e) is based on this common-law duty; it does not attempt to create a new duty to preserve" ([Fed. R. Civ. P. 37(e) and 2015 Committee Note](https://www.law.cornell.edu/rules/frcp/rule_37)).
  The trigger is reasonable anticipation (a demand letter, an attorney's letter, an injury that will clearly be claimed, a credible threat to sue), not only service of a complaint.
- Discrimination charges: once a charge is filed, the employer must preserve all relevant personnel records "until final disposition" ([29 CFR 1602.14](https://www.law.cornell.edu/cfr/text/29/1602.14)); California extends personnel record retention while a verified complaint is pending ([Cal. Gov. Code 12946(b)](https://california.public.law/codes/ca_gov't_code_section_12946)); Massachusetts while a legal action is pending ([M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C)).
- Government investigations: destroying or altering records with intent to impede a federal investigation "in relation to or contemplation of any such matter" is a crime punishable by up to 20 years ([18 U.S.C. 1519](https://www.law.cornell.edu/uscode/text/18/1519)); the "contemplation" language means a hold should start when an investigation is expected (for example, a DOL wage-hour visit or an OSHA inspection notice).

### Scheduled deletion without a hold

- Nothing found forbids deleting on a valid schedule once retention floors have run and no hold applies.
  The Supreme Court described document retention policies as "common in business" and said it is "not wrongful for a manager to instruct his employees to comply with a valid document retention policy" under ordinary circumstances ([Arthur Andersen LLP v. United States, 544 U.S. 696 (2005)](https://www.law.cornell.edu/supremecourt/text/04-368)).
- The Rule 37(e) note keeps "routine, good-faith operation of an electronic information system" as relevant to whether a party took reasonable steps, while warning that anticipated litigation may require intervening in the routine ([2015 Committee Note](https://www.law.cornell.edu/rules/frcp/rule_37)).
- Privacy law pushes the other way: CCPA's "no longer than reasonably necessary" rule means that, once floors and holds are cleared, deleting is the expected behavior, not merely allowed.

## Retention matrix (minimums)

Periods are minimums from the cited sources; "after separation" means after the employment ends.

| Record (Opsell feature) | Federal | California | New York | Massachusetts | Texas |
| --- | --- | --- | --- | --- | --- |
| Hours, time cards (Closing Report labor; time clock is system of record) | 2 yrs (516.6); 3 yrs payroll (516.5) | 3 yrs (Lab. 1174, WO 5) | 6 yrs (Lab. 195(4), 146-2.1) | 3 yrs (c.151 s.15) | 4 yrs (40 TAC 815.106) |
| Wage rates, pay, wage statements | 3 yrs (516.5); 4 yrs tax (26 CFR 31.6001-1) | 3 yrs (Lab. 226, 1174) | 6 yrs | 3 yrs; 3 yrs after separation if 20+ employees (c.149 s.52C) | 4 yrs |
| Tip Distributions (Opsell is likely the record) | 3 yrs (516.5, 516.28); 4 yrs tax | 3 yrs (Lab. 353 + payroll floor) | 6 yrs (146-2.17) | 3 yrs | 4 yrs |
| Sales totals (Closing Report; POS is system of record) | 3 yrs (516.5(c)) | - | - | - | - |
| Write-ups, personnel records | 1 yr from action (1602.14) | 4 yrs after action/separation (Gov. 12946); 3 yrs after separation (Lab. 1198.5) | none found | 3 yrs after separation if 20+ employees | none found (1 yr federal) |
| Injury HR Flag (evidence for OSHA / WC records) | 5 yrs after calendar year if OSHA log kept (1904.33); restaurants partially exempt | same (Cal/OSHA); violent incident log 5 yrs (Lab. 6401.9) | 18 yrs (WCL 110) | 5 yrs if logs kept | 5 yrs if logs kept |
| Medical details within an HR Flag | Separate confidential file, no fixed period (1630.14, 825.500(g)) | same | same | same | same |
| I-9 (if Employee records hold it) | Later of 3 yrs after hire or 1 yr after separation | same | same | same | same |
| Audit Log | No specific rule; keep as long as the records it proves | same | same | same | same |

Any open charge, complaint, lawsuit, or anticipated claim extends every row "until final disposition".
Illinois (outlier) limits disclosure of discipline older than 4 years, covered in the Write-up research.

## Product implications for Opsell

1. **Retention policy per record type, computed per Location jurisdiction.**
   Default floors: Tip Distributions and any Opsell-edited hours or tips, 6 years in NY and 4 years elsewhere (4 covers IRS and Texas); Write-ups and personnel records, separation + 4 years (California) or the Organization's chosen longer period; injury HR Flags, 5 years after the calendar year, 18 years for NY Locations; Closing Report sales and labor snapshots, 3 years (copies, so the floor is a convenience, not a legal duty).
   A simpler alternative is one 7-year default for everything except NY injury flags, at the cost of the CCPA "reasonably necessary" argument.
2. **Organizations may lengthen, never shorten below the floor.**
   This matches the Write-up research and makes the floor a product guarantee rather than a customer configuration risk.
3. **Deletion is a scheduled, logged job after the floor, not a manual action.**
   Each deletion writes an Audit Log entry (record type, ID, rule applied) that survives the deleted content; this is what SOC 2 and Arthur Andersen-style defensibility need.
4. **Legal hold as a first-class flag** on an Employee, a Location, or an Organization, set by HR or Platform Staff, which suspends deletion, CCPA deletion, and churn deletion until released, with set and release both audited.
5. **Treat Tip Distributions as payroll records:** immutable versions, edits as new versions, retained with the rules and eligibility that produced them.
   Also flag in the UI that Closing Report hours are a copy and the time clock remains the employer's record, unless edits flow back to payroll.
6. **Split HR Flag content into incident facts and a restricted medical section** visible only to HR, not to all managers who can see the flag; keep injury flags to the longer injury retention.
   Optionally offer an OSHA 301-equivalent form later, with all required fields, for customers who are not partially exempt.
7. **Employee data requests (CCPA):** the customer is the business, Opsell is the service provider.
   Provide tooling for HR to export an Employee's data and to run a deletion that removes everything not under a floor or hold, returns a list of what was kept and why, and propagates to subprocessors.
8. **Customer DPA and churn:** contractual commitments of a 30-day read-only export window after termination (full export: CSVs plus PDFs of Write-ups with their certificate pages and the Audit Log), deletion from production within 30 days after that, and backup expiry within 180 days of termination at most, with written deletion confirmation on request.
   Warn churning customers that their own retention duties (up to 6 years, or 18 for NY injury records) survive Opsell, which is why the export must be complete.
9. **Publish retention periods** in Opsell's privacy notice template for customers, since CCPA businesses must disclose per-category retention.
10. **Disposal:** deletion must make records unrecoverable (crypto-erasure or overwrite per provider guarantees), meeting Cal. Civ. 1798.81, M.G.L. c.93I and N.Y. GBL 399-h.

## Gaps and unverified items

- Tex. Lab. Code 52.031 current text and enforceability.
- Salesforce MSA export clause wording (PDF could not be parsed) and AICPA TSC verbatim text for C1.2 and P4.3.
- Whether New York or Massachusetts enacted a comprehensive privacy law reaching employee data after the sources reviewed.
- Cal. Lab. Code 1198.5 statute text (relied on prior research via Justia).
- The CCPA regulations were read via Cornell LII, not the CPPA's own PDF; section numbers should be rechecked against the current CPPA text.
- States outside scope with notable rules not checked here: Washington, Oregon, Colorado and Connecticut privacy laws (most exclude employees), and state workers' comp record periods other than New York.
