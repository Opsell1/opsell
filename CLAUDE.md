# opsell

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Language level

Every skill from `mattpocock/skills` in `skills-lock.json` writes its prose in Simplified Technical English.
When one of these skills runs, the agent applies the `/ste` skill to all prose output.
Prose output includes chat replies, questions to the user, files, issues, PR bodies, and commit messages.
The `/ste` rules take precedence over any tone or style instruction in the skill.
Copy code, commands, identifiers, paths, and quoted literals byte for byte.
Keep the `GLOSSARY.md` terms exactly as defined.
Before you write a Markdown file to disk, run `bash .claude/skills/ste/scripts/ste-check.sh <file>` and fix each finding.

Edit no file under `.agents/skills/` to apply this rule.
`skills update` overwrites those files.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
