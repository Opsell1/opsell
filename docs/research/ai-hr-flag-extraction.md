# AI extraction of HR Flags

Research for [issue #7](https://github.com/Opsell1/opsell/issues/7), child of the map [issue #1](https://github.com/Opsell1/opsell/issues/1).
Researched 2026-10-14 against official Anthropic docs and California Privacy Protection Agency (CPPA) pages.

## Question

How feasible is it to detect HR Flags automatically from free-text Closing Report notes with an LLM, and what constraints does that put on the design?

## Answer in brief

Feasible, and cheap.
Extracting "Sam no-showed, Jo left 2h early" into per-Employee HR Flags is a short, single-call structured extraction task, which is the simplest tier of LLM use.
Use the Claude Messages API with structured outputs (`output_config.format` with a JSON schema) on `claude-opus-5-5` at low effort, one synchronous call per Closing Report save.
Pass the Location's Employee roster in the prompt with per-request opaque refs, have the model return refs plus a verbatim evidence quote, and resolve and validate everything server-side.
Cost is roughly 1 to 5 cents per Closing Report on Opus 5.5, well under a dollar per Location per month.
Request zero data retention (ZDR) from Anthropic, avoid ZDR-ineligible features (Batch API, Files API, code execution) and Covered Models (Fable, Mythos), and never put Employee names in the JSON schema.
Every suggestion stays a draft until the author confirms it; that human-in-the-loop design is also what keeps the feature outside California's automated decisionmaking rules.

## 1. Model and API

### Recommended model

Default to `claude-opus-5-5` ($4 input / $20 output per million tokens) [pricing].
It is Anthropic's recommended starting model for most workloads [models].
`claude-haiku-5-5` ($0.10 / $0.50 per million tokens for prompts under 100K tokens) is documented as "for high-volume, latency-sensitive tasks such as classification, extraction, and routing" and has the "Fastest" comparative latency [models].
Because the absolute cost on Opus 5.5 is already negligible (section 4), the recommendation is to ship on Opus 5.5 and only move to Haiku 5.5 if an eval (section 2) shows equal quality and latency matters.
That swap is a one-line model ID change, so it does not need to be decided now.

Opus 5.5 API specifics that shape the implementation [claude-api skill, models]:

- Thinking cannot be disabled on Opus 5.5 (`thinking: {type: "disabled"}` returns a 400); control cost and latency with `output_config.effort`, and set it explicitly to `low` for this task (the default is `medium`).
- Forced `tool_choice` (`any` or `tool`) returns a 400 on Opus 5.5, so use structured outputs (`output_config.format`) to get JSON back rather than a forced tool call.
- Always check `stop_reason` before parsing: `refusal` and `max_tokens` can produce output that does not match the schema, and refusals are still billed [structured-outputs].
- Enable the server-side refusal fallback (`fallbacks: "default"` with beta `server-side-fallback-2026-07-01`) so a rare safety-classifier refusal is retried on another model instead of losing the suggestion.

### Structured outputs

Structured outputs use constrained decoding, so the response is always valid JSON matching the schema, with guaranteed types and required fields and no retries for schema violations [structured-outputs].
Relevant limits [structured-outputs]:

- `enum` is supported (strings, numbers, booleans, nulls), so the HR Flag category set can be an enum.
- Enum casing is not guaranteed; compare category values case-insensitively.
- `additionalProperties: false` is required on every object; numeric and string-length constraints are not supported.
- The first request with a new schema pays a grammar-compilation latency hit; compiled grammars are cached for 24 hours from last use, so keep the schema fixed across Organizations.
- Structured outputs are GA on the Claude API, Claude Platform on AWS, Google Cloud, and Microsoft Foundry, but on Amazon Bedrock only on the legacy integration for Opus 4.6 and earlier, so do not plan on the new Claude in Amazon Bedrock integration for this feature.

### Suggested output schema (sketch)

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["flags", "unmatched_mentions"],
  "properties": {
    "flags": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["employee_ref", "category", "evidence", "confidence"],
        "properties": {
          "employee_ref": {"type": "string"},
          "category": {"type": "string", "enum": ["no_show", "late_arrival", "left_early", "conduct", "safety_or_injury", "customer_complaint", "other"]},
          "evidence": {"type": "string"},
          "confidence": {"type": "string", "enum": ["high", "low"]}
        }
      }
    },
    "unmatched_mentions": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["name_as_written", "candidate_refs", "category", "evidence"],
        "properties": {
          "name_as_written": {"type": "string"},
          "candidate_refs": {"type": "array", "items": {"type": "string"}},
          "category": {"type": "string", "enum": ["no_show", "late_arrival", "left_early", "conduct", "safety_or_injury", "customer_complaint", "other"]},
          "evidence": {"type": "string"}
        }
      }
    }
  }
}
```

The category list is a placeholder for the HR Flag workflow ticket to settle; it contains no personal data, so it is safe in the schema.

## 2. Expected accuracy

No primary source publishes accuracy figures for this exact task (short restaurant manager notes to per-Employee HR Flags), so any number here would be invented.
What can be said from the task shape: notes are short, the label set is small and closed, and the candidate Employees are a known, small roster, which removes the hardest part of open-ended entity extraction.
The realistic failure modes are ambiguous first names, nicknames and misspellings, implicit subjects ("closer called out"), negations or resolved events ("Jo was late but had cleared it with me"), and events that are not HR-relevant.
Treat accuracy as something to measure, not assume: before launch, build a small eval of 100 to 200 realistic notes (synthesized plus founder-written from bakery experience) with expected flags, and score precision and recall per category and Employee-match accuracy.
In production, every author confirmation, edit, and dismissal is a labelled example, so log suggestion versus confirmed result (section 6) and re-run the eval on any prompt or model change.
Design for precision over recall: a missed flag can be added manually by the author, while a wrong suggestion against the wrong Employee is the costly error.

## 3. Matching a mentioned name to the right Employee

Do the matching in the prompt plus server-side validation, not with a separate fuzzy matcher:

1. Build the roster from Employees at the Closing Report's Location, ideally narrowed to or ordered by those scheduled or clocked in that business day (the POS labor data gives this), with first name, last name, preferred name or nickname, and job title.
2. Assign each roster entry an opaque per-request ref (`E1`, `E2`, ...) and keep the ref-to-Employee-ID map on the server; the model never sees or returns internal IDs.
3. Put the roster in the message content, not in the schema: Anthropic caches JSON schemas separately from message content for up to 24 hours, and its docs explicitly warn not to put sensitive personal data in schema property names, `enum`, `const`, or `pattern` values [data-retention].
   So do not enumerate Employee names or IDs as a schema `enum`.
4. Instruct the model to return a ref only when exactly one roster entry fits, and otherwise to put the mention in `unmatched_mentions` with candidate refs (two Sams) or none (a name not on the roster, such as a new hire or someone from another Location).
5. Server-side, reject any `employee_ref` not in the request's map, and check that `evidence` is a verbatim substring of the note; drop or downgrade anything that fails.
6. The confirmation UI (section 6) resolves every unmatched mention by asking the author to pick the Employee, so ambiguity never silently routes to the wrong person.

## 4. Cost per Closing Report

Assumed token shape per call (estimate, to be confirmed with the token-counting endpoint): about 800 tokens of instructions and schema, about 15 tokens per roster entry (50 Employees is about 750 tokens), and about 100 to 300 tokens of notes, so about 2,000 input tokens.
Output is a few hundred tokens of JSON plus thinking tokens, which are billed as output; budget 300 to 2,000 output tokens at low effort.

| Model | Input $/MTok | Output $/MTok | Per report (2K in, 300 to 2K out) | Per Location-month (30 reports) |
| --- | --- | --- | --- | --- |
| `claude-opus-5-5` | $4.00 | $20.00 | about $0.014 to $0.048 | about $0.40 to $1.45 |
| `claude-sonnet-5-5` | $2.00 | $10.00 | about $0.007 to $0.024 | about $0.20 to $0.72 |
| `claude-haiku-5-5` | $0.10 | $0.50 | about $0.0004 to $0.0012 | about $0.01 to $0.04 |

Prices from [pricing].
Modifiers [pricing]:

- Prompt caching the fixed instructions cuts their repeat cost to 0.05x on Opus 5.5, but re-running on the same report within minutes is the only repeat pattern here, so it is a minor saving.
- US-only inference (`inference_geo: "us"`) costs a 1.1x multiplier on all token categories; worth it for a US-only product that wants to state where employee data is processed.
- The Batch API's 50% discount is not worth taking, because Batch is not ZDR-eligible and the suggestion needs to be interactive.

## 5. Latency

Anthropic publishes comparative, not absolute, latency: Haiku 5.5 "Fastest", Sonnet 5.5 "Fast", Opus 5.5 "Moderate", and actual latency "depends on prompt length, output length, and thinking effort" [models].
With about 2,000 input tokens and short output at low effort, expect low single-digit seconds on Opus 5.5 (unmeasured estimate; measure it with the eval).
The first call with a new schema adds grammar-compilation time, then the grammar is cached for 24 hours [structured-outputs].
Design implication: never block typing or submission on the call.
Run extraction asynchronously when the author pauses or moves to the review step, show a "finding HR Flags" state, and let the author submit with manual flags if the call fails or times out.

## 6. Data privacy obligations

### Anthropic side

- Default commercial API retention: inputs and outputs are deleted on Anthropic's backend within 30 days, with exceptions for Usage Policy enforcement, legal requirements, Covered Models, and flagged content (up to 2 years for inputs and outputs) [commercial-retention].
- Zero data retention (ZDR) is available per Organization by contacting Anthropic sales; under ZDR, prompts and responses are not stored at rest after the response returns [data-retention].
- ZDR covers the Messages API and structured outputs (only the JSON schema is cached, up to 24 hours) but not the Batch API (29-day retention), Files API, or code execution [data-retention].
- Covered Models (Fable 5, Fable 5.1, Mythos 5, Mythos 5.1) require 30-day retention and are not available under ZDR, so do not route HR Flag extraction to them [data-retention].
- Even under ZDR, Anthropic may retain flagged content up to 2 years or where legally required [data-retention].
- Commercial Terms: Anthropic may not train models on Customer Content, the customer owns Outputs, the Data Processing Addendum is incorporated by reference, and the customer warrants it has all rights to submit Inputs and must comply with privacy law [commercial-terms].
- ZDR does not support browser CORS calls, so all calls go through the Opsell backend (they should anyway, to keep the API key server-side) [data-retention].
- On Amazon Bedrock or Google Cloud, the cloud provider is the data processor instead of Anthropic [data-retention].

### Opsell side (US, state-aware)

- California: the CCPA's employment-data exemption expired on December 31, 2022, so Employee and applicant personal information of California residents is covered [cppa-faq].
  The customer Organization is the business; Opsell is its service provider, and Anthropic is Opsell's subprocessor, so the Opsell customer contract and DPA must list Anthropic as a subprocessor and flow down deletion requests [cppa-faq, commercial-terms].
- California ADMT rules: the CPPA's regulations took effect January 1, 2026, with ADMT obligations for "significant decisions" starting January 1, 2027 [cppa-announcement].
  The final rules narrowed ADMT to technology that substantially replaces human decisionmaking, meaning a decision made without human involvement, and employment decisions (including work allocation, compensation, discipline-adjacent decisions such as suspension or termination) are significant decisions [cppa-search, law-firm summaries; the approved text PDF could not be machine-read here, so confirm with counsel against `cppa.ca.gov/regulations/pdf/ccpa_updates_cyber_risk_admt_appr_text.pdf`].
  An HR Flag is a suggestion confirmed by its author and then reviewed by HR, so a human makes every decision; keeping that true by design (no auto-routing, no auto-Write-ups) is what keeps the feature outside ADMT scope.
- Sensitive data: notes may mention injuries or health ("Sam cut her hand"), which is sensitive personal information; the `safety_or_injury` category should route only to HR, and the prompt should not ask the model to infer health conditions, protected characteristics, or anything beyond what the note says.
- Notice: tell Organizations in their contract and in-product that Closing Report notes are processed by an AI subprocessor to suggest HR Flags, and give Org Admins a per-Organization toggle to turn the feature off (this fits the fixed-Roles-plus-toggles model on the map).

## 7. Confirm-before-routing UX

The glossary already fixes the rule: an HR Flag is suggested from a Closing Report's notes and confirmed by its author before it routes to HR.
Pattern:

1. Suggestions appear as draft cards beside the notes, each showing the Employee (name and job title), the category, and the evidence quote highlighted in the note text.
2. Each card has Confirm, Edit (change Employee or category), and Dismiss; unmatched mentions show as a "Who is Sam?" card with the candidates to pick from.
3. The author can add a flag manually that the model missed.
4. Nothing routes to HR until the author confirms; submitting the Closing Report with unreviewed suggestions either blocks with a clear prompt or treats them as dismissed (the HR Flag workflow ticket should choose; blocking is safer).
5. Editing the notes re-runs extraction and reconciles with existing cards by Employee and category, never discarding a confirmation the author already made.
6. Store each suggestion with model ID, prompt version, and the author's action (confirmed, edited, dismissed, added manually) for audit and as eval data.
7. Senior-sups draft Closing Reports but have no disciplinary visibility, so whether a Senior-sup author confirms flags or a Manager does is a Role question for the HR Flag workflow ticket.

## Constraints this puts on the design

- Backend-only LLM calls via the Messages API, synchronous, structured outputs, no Batch, Files, or code execution.
- Default model `claude-opus-5-5` at `effort: low`; never a Covered Model.
- ZDR requested from Anthropic before handling real Employee data; Anthropic listed as a subprocessor in the Opsell DPA.
- Roster in message content with opaque refs; no personal data in schemas.
- Server-side validation of refs and evidence quotes.
- Human confirmation is mandatory and logged; no automated routing or discipline.
- A per-Organization toggle to disable the feature.
- An eval set before launch, grown from confirmation logs after.

## Sources

- [models] Anthropic, Models overview: https://platform.claude.com/docs/en/about-claude/models/overview
- [pricing] Anthropic, Pricing: https://platform.claude.com/docs/en/about-claude/pricing
- [structured-outputs] Anthropic, Structured outputs: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- [data-retention] Anthropic, API and data retention: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
- [commercial-retention] Anthropic Privacy Center, How long do you store my organization's data: https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
- [commercial-terms] Anthropic, Commercial Terms of Service: https://www.anthropic.com/legal/commercial-terms
- [claude-api skill] Anthropic's bundled Claude API reference (model defaults, Opus 5.5 thinking, tool_choice, and refusal-fallback behavior), cached 2026-10-06
- [cppa-faq] CPPA, Frequently Asked Questions: https://cppa.ca.gov/faq.html
- [cppa-announcement] CPPA, California Finalizes Regulations to Strengthen Consumers' Privacy (2025-09-23): https://cppa.ca.gov/announcements/2025/20250923.html
- [cppa-search] CPPA regulations page and approved text: https://cppa.ca.gov/regulations/ccpa_updates.html
- Secondary, for the ADMT definitions only (verify against the approved text): Littler, https://littler.com/news-analysis/asap/californias-long-awaited-final-regulations-automated-decisionmaking-create-new and Akin Gump, https://www.akingump.com/en/insights/alerts/new-california-regulations-regarding-employer-use-of-automated-decision-making-technology-compliance-required-by-january-1-2027
