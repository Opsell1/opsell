# E-signed Write-up legal requirements (US)

Research for [issue #6](https://github.com/Opsell1/opsell/issues/6), child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1).
Researched 2026-10-14.
This is product research, not legal advice; an employment lawyer should review the final Write-up template and retention policy before launch.

## Question

What legal and practical requirements apply in the US to issuing an Employee a disciplinary Write-up electronically and capturing the Employee's e-signature?
Covers: ESIGN/UETA validity, what an acknowledgment signature does and does not mean, an Employee who refuses to sign, record retention, and the audit trail that makes a signed record defensible.

## Short answer

- An electronically issued and e-signed Write-up is as valid as a paper one under federal ESIGN and state UETA; no law requires a Write-up to be on paper or signed in ink.
- No US statute requires an Employee to sign a Write-up at all, so the signature is evidence of delivery, not a legal precondition; the Write-up is valid and enforceable as an employer record whether or not the Employee signs.
- The signature should be framed as acknowledgment of receipt, never agreement, and the Employee must be able to add a written rebuttal; Connecticut requires the template to say so.
- Retention floor: federal law requires at least 1 year (longer while any charge or lawsuit is pending); several states require 3 years after employment ends; Illinois requires deleting disciplinary records older than 4 years before releasing a file to a third party.
- Defensibility comes from attribution: courts accept an e-signature when the employer can show it was made through credentials only that Employee controlled, with a timestamp, IP/device data, and an unaltered record of exactly what was signed.

## 1. Validity under ESIGN and UETA

### Federal: ESIGN (15 U.S.C. 7001 et seq.)

ESIGN says that for any transaction in or affecting interstate commerce, "a signature, contract, or other record relating to such transaction may not be denied legal effect, validity, or enforceability solely because it is in electronic form" ([15 U.S.C. 7001(a)(1)](https://www.law.cornell.edu/uscode/text/15/7001)).
An "electronic signature" is "an electronic sound, symbol, or process, attached to or logically associated with a contract or other record and executed or adopted by a person with the intent to sign the record" ([15 U.S.C. 7006(5)](https://www.law.cornell.edu/uscode/text/15/7006)).
So a typed name, drawn signature, or click-to-sign button all qualify, provided the Employee intends to sign.
"Transaction" covers "the conduct of business, consumer, or commercial affairs" between two or more persons ([15 U.S.C. 7006(13)](https://www.law.cornell.edu/uscode/text/15/7006)); employment records are generally treated as business affairs.

ESIGN's consumer-consent and disclosure regime in 7001(c) applies only where a law requires information to be given to a "consumer" in writing ([15 U.S.C. 7001(c)](https://www.law.cornell.edu/uscode/text/15/7001)).
A "consumer" is an individual who obtains products or services "primarily for personal, family, or household purposes" ([15 U.S.C. 7006(1)](https://www.law.cornell.edu/uscode/text/15/7006)).
An Employee receiving a Write-up is not a consumer, so the formal 7001(c) consent ceremony is not required.

ESIGN does not force anyone to use electronic records: it does not "require any person to agree to use or accept electronic records or electronic signatures" ([15 U.S.C. 7001(b)(2)](https://www.law.cornell.edu/uscode/text/15/7001)).
It also does not change substantive employment law; it only removes the "must be on paper / in ink" objection ([15 U.S.C. 7001(b)(1)](https://www.law.cornell.edu/uscode/text/15/7001)).

The ESIGN exceptions (wills, family law, most UCC, court documents, utility shutoff and foreclosure notices, notices of termination of health or life insurance benefits, product recalls, hazmat documents) do not include disciplinary records ([15 U.S.C. 7003](https://www.law.cornell.edu/uscode/text/15/7003)).
Note for later modules: if a termination flow ever sends a notice of termination of health insurance benefits, that notice is excepted from ESIGN and needs separate handling.

### State: UETA

UETA has been adopted by every state except New York, which has its own Electronic Signatures and Records Act; ESIGN applies everywhere regardless.
The quotes below are from Maine's enactment, which follows the uniform text.

- Legal recognition: "An electronic record or electronic signature may not be denied legal effect or enforceability solely because it is in electronic form", and "If a law requires a signature, an electronic signature satisfies the law" ([10 M.R.S. 9407](https://legislature.maine.gov/statutes/10/title10sec9407.html), UETA section 7).
- Consent by conduct: UETA "applies only to transactions between parties, each of which has agreed to conduct transactions by electronic means", and that agreement "is determined from the context and surrounding circumstances, including the parties' conduct" ([10 M.R.S. 9405(2)](https://legislature.maine.gov/statutes/10/title10sec9405.html), UETA section 5(b)).
- Opt-out per transaction: a party that agreed to electronic dealings "may refuse to conduct other transactions by electronic means", and this right "may not be waived by agreement" ([10 M.R.S. 9405(3)](https://legislature.maine.gov/statutes/10/title10sec9405.html), UETA section 5(c)).
- Attribution: a signature "is attributable to a person if it was the act of the person", and that act "may be shown in any manner, including a showing of the efficacy of any security procedure" ([10 M.R.S. 9409(1)](https://legislature.maine.gov/statutes/10/title10sec9409.html), UETA section 9(a)).
- Meaning: the effect of the signature "is determined from the context and surrounding circumstances at the time of its creation, execution or adoption" ([10 M.R.S. 9409(2)](https://legislature.maine.gov/statutes/10/title10sec9409.html), UETA section 9(b)).

Product consequences:

- Capture the Employee's affirmative agreement to receive and sign Write-ups electronically once, at account activation, and record it.
- Because UETA lets a party refuse electronic dealing for a given transaction, keep a paper fallback: HR can print the Write-up, get a wet signature or a refusal note, and upload the scan to the same record.

## 2. Acknowledgment vs agreement

No statute defines what an Employee's signature on a disciplinary record means; under UETA section 9(b) it means what the context at signing shows.
That makes the wording on the signing screen the deciding factor.

State personnel-file laws assume the Employee may disagree with what is in the file and give them a right to say so:

- Connecticut: every "documented disciplinary action" must include "a statement in clear and conspicuous language" that the employee may, if they disagree, "submit a written statement explaining his or her position", which must be kept in the file and accompany any disclosure to a third party ([Conn. Gen. Stat. 31-128e(b)](https://www.cga.ct.gov/current/pub/chap_563a.htm#sec_31-128e)).
- Illinois: if the employee disagrees and no correction is agreed, "the employee may submit a written statement explaining the employee's position", which the employer "shall attach" to the disputed record and include whenever it is released ([820 ILCS 40/6](https://www.ilga.gov/ftp/ILCS/Ch%200820/Act%200040/082000400K6.html)).
- Massachusetts: the employee may submit a written statement that becomes part of the record ([M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C)).

Product consequences:

- The signature line reads as acknowledgment of receipt, for example "My signature confirms I received and reviewed this Write-up. It does not mean I agree with it."
- Every Write-up template includes the rebuttal notice (mandatory in Connecticut, harmless and good practice everywhere).
- The Employee can attach a rebuttal statement to the Write-up, at signing or later, and the rebuttal travels with the Write-up in every view and export.
- The Employee's rebuttal is a separate, immutable entry; it never edits the Write-up text.

## 3. Refusal to sign

No federal or state statute found requires an Employee to sign a disciplinary record, and none makes the record invalid without the signature.
The signature exists to prove delivery; the employer's obligation in several states is to deliver, not to collect a signature.

- Connecticut: the employer "shall provide an employee with a copy of any documentation of any disciplinary action imposed on that employee not more than one business day after the date of imposing such action" ([Conn. Gen. Stat. 31-128b(c)](https://www.cga.ct.gov/current/pub/chap_563a.htm#sec_31-128b)).
- Massachusetts: the employer "shall notify an employee within 10 days" of placing in the personnel record information that may negatively affect the employee's qualification for employment, promotion, compensation, or possible disciplinary action ([M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C)).
- California: an employee who signs "any instrument relating to the obtaining or holding of employment" must "be given a copy of the instrument upon request" ([Cal. Lab. Code 432](https://codes.findlaw.com/ca/labor-code/lab-sect-432/)).

Unionized workplaces: under NLRB v. J. Weingarten, Inc., 420 U.S. 251 (1975), an employer may not discipline a union-represented employee for refusing to submit, without a representative, to an investigatory interview the employee reasonably believes may lead to discipline ([NLRB, Interfering with employee rights](https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law/interfering-with-employee-rights-section-7-8a1)).
That governs the meeting, not the form, but a Write-up flow that includes an "interview" step should let the manager record that a representative was requested or present.

Product consequences:

- "Refused to sign" is a first-class terminal state, not an error: the issuer records refusal, the time, and optionally a witness (another manager), and the Write-up is still filed and still delivered.
- Delivery is tracked separately from signing: the Write-up is delivered to the Employee's account (and optionally by email) the moment it is issued, with a delivered-at timestamp.
- Track a "viewed" event when the Employee first opens it, distinct from "signed".
- Signing has no deadline that blocks filing; reminders are fine, but the Write-up never sits in limbo waiting for the Employee.

## 4. Record retention

### Federal floor

- Title VII and ADA (EEOC): any personnel record made or kept by an employer, including records of discharge and discipline, must be kept "for a period of one year from the date of the making of the record or the personnel action involved, whichever occurs later"; for an involuntary termination, the terminated employee's personnel records must be kept one year from termination ([29 CFR 1602.14](https://www.law.cornell.edu/cfr/text/29/1602.14)).
- When a charge of discrimination is filed, the employer "shall preserve all personnel records relevant to the charge or action until final disposition", which runs to the end of the statutory period to sue or the end of the litigation ([29 CFR 1602.14](https://www.law.cornell.edu/cfr/text/29/1602.14)).
- ADEA: records of promotion, demotion, transfer, layoff, recall, or discharge must be kept "for a period of 1 year from the date of the personnel action", extended until final disposition of any enforcement action ([29 CFR 1627.3(b)](https://www.law.cornell.edu/cfr/text/29/1627.3)).

### State examples (stricter)

- California: personnel records must be kept at least 2 years from the record or personnel action, longer once a complaint is filed ([2 CCR 11013(c)](https://www.law.cornell.edu/regulations/california/2-CCR-11013)), and Labor Code 1198.5 requires keeping a copy of the personnel records for 3 years after the employee leaves (statute text not directly retrievable in this pass; confirmed via [Justia](https://law.justia.com/codes/california/code-lab/division-2/part-4/chapter-1/section-1198-5) and [california.public.law](https://california.public.law/codes/ca_lab_code_section_1198.5)).
- Massachusetts: an employer of 20 or more employees must keep the complete personnel record, without deletions, until 3 years after the employee leaves, and longer while a legal proceeding is pending ([M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C)).
- Connecticut: keep any personnel file at least 1 year after termination ([Conn. Gen. Stat. 31-128b(a)](https://www.cga.ct.gov/current/pub/chap_563a.htm#sec_31-128b)).
- Illinois (an upper bound on disclosure, not storage): before releasing a personnel record to a third party, the employer must "delete disciplinary reports, letters of reprimand, or other records of disciplinary action which are more than 4 years old", unless ordered in a legal action or arbitration ([820 ILCS 40/8](https://www.ilga.gov/ftp/ILCS/Ch%200820/Act%200040/082000400K8.html)).

### Electronic retention is enough

Under ESIGN and UETA, a retention requirement is met by an electronic record that "accurately reflects the information" and "remains accessible" for the required period "in a form that is capable of being accurately reproduced for later reference" ([15 U.S.C. 7001(d)(1)](https://www.law.cornell.edu/uscode/text/15/7001); [10 M.R.S. 9412](https://legislature.maine.gov/statutes/10/title10sec9412.html)).
UETA adds that such a record satisfies laws requiring retention "for evidentiary, audit or like purposes" and requiring an "original" ([10 M.R.S. 9412(4), (6)](https://legislature.maine.gov/statutes/10/title10sec9412.html)).
ESIGN lets a record be denied effect if it is not "capable of being retained and accurately reproduced for later reference by all parties or persons who are entitled to retain" it ([15 U.S.C. 7001(e)](https://www.law.cornell.edu/uscode/text/15/7001)), which means the Employee must be able to download or print their copy.

Product consequences:

- Default retention: keep Write-ups for the life of employment plus at least 3 years after separation (covers California, Massachusetts, and the federal floor); make the period a per-Organization setting that can only be lengthened.
- Legal hold: HR can place a hold on an Employee's records that suspends any deletion until released (covers the "until final disposition" rules).
- Separation does not delete anything; deletion runs only from a retention clock that starts at the separation date.
- Illinois: when a Write-up history is exported or shared outside the Organization for an Illinois Location, exclude disciplinary records older than 4 years unless HR marks the export as for a legal action or arbitration.
- Feeds the open map item "Record retention and deletion" in issue #1.

## 5. Audit trail that makes a signature defensible

UETA section 9 makes attribution a question of proof, and California courts show what proof works.

- In Ruiz v. Moss Bros. Auto Group, 232 Cal.App.4th 836 (2014) ([CourtListener](https://www.courtlistener.com/opinion/2764587/ruiz-v-moss-bros-auto-group/)), the employer lost because it showed only the employee's name in the signature block with a date and time stamp, and did not explain how the signature was placed or how it knew the employee was the one who placed it.
- In Espejo v. Southern California Permanente Medical Group, 246 Cal.App.4th 1047 (2016) ([CourtListener](https://www.courtlistener.com/opinion/3197094/espejo-v-southern-california-permanente-medical-group/)), the employer won by explaining the process: the employee signed with a unique username and password only he controlled, and the system recorded the date, time, and IP address of the signature.
- Later decisions (Banister v. Marinidence Opco, 2021; Garcia v. Stoneledge Furniture, 2024) went against employers that could not show the employee actually used unique credentials.

Caveat: the full opinion texts could not be retrieved directly in this pass; the holdings above are as consistently reported by multiple law-firm summaries ([Ogletree](https://ogletree.com/shared-content/content/blog/2016/april/california-appeals-court-provides-guidance-on-the-use-of-electronic-signatures-by-employees), [Orrick](https://infobytes.orrick.com/2016-05-06/california-court-appeals-rules-evidentiary-standard-attributing-esignature-signer/), [National Law Review](https://natlawreview.com/article/fact-intensive-inquiry-how-california-courts-are-resolving-authenticity-disputes)).
These are arbitration-agreement cases, where the employer needs the employee's signature; a Write-up dispute is usually lower stakes, but the same attribution standard applies if an Employee denies ever receiving or signing one.

Product consequences, the minimum event record per Write-up:

- Identity: the Employee signs only while authenticated to their own account (unique credentials), never with a manager's session; in-store signing on a shared device must require the Employee's own login or a one-time code sent to them, then end the session.
- Content integrity: store the exact rendered Write-up the Employee saw as an immutable version with a content hash; the signature binds to that version's hash.
- Versioning: any edit after issuance creates a new version that requires a new acknowledgment; earlier versions and their signatures are retained, never overwritten.
- Event log, append-only, each entry with server timestamp (UTC), actor user ID, Role, IP address, user agent / device, and authentication method: created, issued, delivered, viewed, e-sign consent, signed (with the exact acknowledgment wording shown), refused (with witness), rebuttal added, routed to HR, exported, legal hold set or released, deleted by retention.
- Explainability: HR can export a single PDF of the Write-up plus a certificate page listing the events above, so a declaration like the one in Espejo can be written from it.
- Platform Staff access to a Write-up is itself logged (ties to the open map item "Audit log and Platform Staff access").

## 6. Employee access to their own records

Many states give employees a statutory right to inspect and copy their personnel file, which includes Write-ups.

- California: inspection and copies within 30 calendar days of a written request ([Cal. Lab. Code 1198.5](https://law.justia.com/codes/california/code-lab/division-2/part-4/chapter-1/section-1198-5)), plus a copy of any signed employment instrument on request ([Cal. Lab. Code 432](https://codes.findlaw.com/ca/labor-code/lab-sect-432/)).
- Illinois: inspect, copy, and receive copies within 7 working days (plus 7 calendar days if reasonably needed), at least 2 requests per year, requests may be by email or text, and copies may be in "a reasonable and commercially available electronic format"; if the records are "already accessible by the employee", the employer may simply tell the employee how to access them ([820 ILCS 40/2](https://www.ilga.gov/ftp/ILCS/Ch%200820/Act%200040/082000400K2.html)).
- Illinois also bars giving a disciplinary report to a third party outside the employer or union without first mailing the employee written notice ([820 ILCS 40/7](https://www.ilga.gov/ftp/ILCS/Ch%200820/Act%200040/082000400K7.html)).
- Connecticut: inspect and copy within 7 business days for current employees, 10 business days for former employees who ask within 1 year of separation ([Conn. Gen. Stat. 31-128b](https://www.cga.ct.gov/current/pub/chap_563a.htm#sec_31-128b)); no disclosure to outsiders without written authorization except listed cases ([31-128f](https://www.cga.ct.gov/current/pub/chap_563a.htm#sec_31-128f)).
- Massachusetts: review within 5 business days of a written request ([M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C)).
- Other states with personnel-file access statutes worth checking before launch in them (not verified in this pass): Alaska, Delaware, Maine, Michigan, Minnesota, Nevada, New Hampshire, Oregon, Pennsylvania, Rhode Island, Washington, Wisconsin.

Product consequences:

- Every Employee sees all their own Write-ups, signed or not, with rebuttals, in their account, and can download a PDF copy at any time; under Illinois 40/2(d) this self-service access can itself satisfy a request.
- Access survives separation: a former Employee keeps read-only access (or can request an export) for at least the retention period, since Connecticut and California rights extend to former employees.
- HR gets a "personnel file request" export per Employee, with the request date tracked against the state deadline of that Employee's Location.
- Compliance rules are keyed by the state of the Employee's Location (fits "US only, state-aware compliance" in issue #1).

## Sources

Primary, fetched directly:

- [15 U.S.C. 7001](https://www.law.cornell.edu/uscode/text/15/7001), [7003](https://www.law.cornell.edu/uscode/text/15/7003), [7006](https://www.law.cornell.edu/uscode/text/15/7006) (ESIGN)
- [Maine UETA, 10 M.R.S. ch. 1051](https://legislature.maine.gov/statutes/10/title10ch1051.pdf) (sections 9402, 9405, 9407, 9409, 9412)
- [29 CFR 1602.14](https://www.law.cornell.edu/cfr/text/29/1602.14) (EEOC), [29 CFR 1627.3](https://www.law.cornell.edu/cfr/text/29/1627.3) (ADEA)
- [2 CCR 11013](https://www.law.cornell.edu/regulations/california/2-CCR-11013) (California CRD)
- [Conn. Gen. Stat. ch. 563a](https://www.cga.ct.gov/current/pub/chap_563a.htm) (31-128a to 31-128h)
- [820 ILCS 40](https://www.ilga.gov/legislation/ILCS/ilcs3.asp?ActID=2395&ChapterID=68) (Illinois Personnel Record Review Act, sections 2, 6, 7, 8)
- [M.G.L. c.149 s.52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C) (Massachusetts)
- [NLRB on Section 8(a)(1) and Weingarten](https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law/interfering-with-employee-rights-section-7-8a1)

Secondary, used where the primary text was not retrievable:

- California Labor Code 1198.5 and 432 via Justia, california.public.law, and FindLaw (leginfo.legislature.ca.gov blocked automated fetches).
- Ruiz and Espejo holdings via Ogletree, Orrick, and National Law Review summaries (opinion pages linked above on CourtListener).
