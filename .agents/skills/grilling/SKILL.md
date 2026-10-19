---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round, each question carrying your recommended answer. Then wait for the user's answers before the next round.

Ask every round through the `AskUserQuestion` tool, never as questions printed in your reply:

- One tool question per frontier question. The tool takes at most 4 questions per call, so a larger round spans consecutive calls, all asked before the next round.
- `question`: the full question, ending in "?". `header`: a chip of 12 characters or fewer naming the decision.
- `options`: 2-4 concrete, mutually exclusive answers. Put your recommended answer first, with " (Recommended)" appended to its label. The tool adds "Other" for free-text answers, so leave it out.
- Put the context and trade-offs each answer implies in its option `description`. When the user must compare concrete artifacts (code shapes, schemas, UI mockups), show each in the option's `preview`.
- Set `multiSelect: true` only when the answers genuinely combine.

If the `AskUserQuestion` tool is unavailable in your harness, fall back to text: number each question, follow it with `➡️ <your recommended answer>`, and word it so "yes" accepts the recommendation.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
