---
name: pr-description
description: >-
  Write or revise a pull request description (the PR body/summary) in a concise,
  link-heavy, highly scannable style that still orients a newcomer despite
  minimal prose — replacing wordy explanations with links to the actual code,
  dashboards/logs/traces, and related PRs ("show, don't tell"). Use this
  whenever opening a PR, drafting or editing a PR body, tightening a verbose PR
  description, or when the user says things like "write the PR description",
  "open a draft PR", "make this PR body more concise", or "link to the code
  instead of describing it" — even if they don't name a style explicitly.
---

# PR description: concise, link-heavy, scannable

The goal: a reviewer should grasp **why** the change exists and **what** it does in well under a minute, and reach the actual evidence (code, metrics, prior art) in one click — not read paragraphs that re-narrate the diff. Prose is expensive; a precise link is cheap and authoritative. Lean on links so you don't have to *tell* when you can *show*.

This produces the PR body only. For title format, draft-vs-ready, branch hygiene, and what to omit, defer to the repo's `AGENTS.md` / `CONTRIBUTING.md` — they win over anything here.

## Structure

Two short headed sections by default. Add a third only if it earns its place.

```markdown
## Summary
<1–3 sentences, why-first. One clause of background so a newcomer knows the
domain. Inline links carry the specifics instead of prose.>

## Change
<1–2 sentences naming what changed, with links to the key call sites/functions.
Note scope/safety — what's affected and, just as important, what isn't.>

<optional closing line: a related-work link, a scope caveat, or a follow-up.>
```

Why this shape: **Summary answers "why should I care / what problem"**, **Change answers "what did you touch and is it safe"**. A reviewer who trusts the author reads two sentences and clicks through; a careful reviewer follows the links. Both are served.

## Show, don't tell — link instead of describe

Every time you're about to *describe* something concrete, link to it instead.

- **Code** — link to the exact lines, pinned to a commit SHA so the anchors don't drift as the branch moves. Resolve once with `git rev-parse HEAD`, find lines with `grep -n`, then:
  `https://github.com/<org>/<repo>/blob/<full-sha>/<path>#L<line>` (range: `#L10-L24`).
  Pinning to a branch name instead of a SHA means line anchors rot on the next push — use the SHA.
- **Many call sites** — don't list them in prose; enumerate as terse numbered links: `… at the engine's five reads ([1](url), [2](url), [3](url), [4](url), [5](url))`.
- **Evidence** (dashboards, logs, traces, metrics) — link the canonical URL behind the claim, e.g. "[thousands of reads per run](trace-url)" or "[sample mismatches](logs-query-url)". Prefer a **durable query URL** over a single ephemeral trace; if a link is time-bounded or may age out of retention, say so in one parenthetical so the reviewer isn't surprised by an empty view.
- **Related work / prior art** — link related PRs and issues with **full URLs**, never a bare `#123` (bare refs are ambiguous across repos and unclickable out of context).

The test: if a sentence is explaining *what some code does* or *what a metric shows*, it should usually become a link with a 2–4 word label.

## Scannability with minimal prose

Minimal prose must not mean a dense blob. Make it skimmable:

- Keep paragraphs to 1–3 sentences. One idea each.
- **Bold the subject** of a point or lead-in so the eye lands on it.
- Use `inline code` for symbol/file/flag names so they're visually distinct and greppable.
- Headings are navigation — keep them short and predictable (`Summary`, `Change`).
- Lead with the conclusion; supporting detail (or its link) comes after.

## Newcomer context without padding

A reviewer unfamiliar with the area needs just enough to orient — usually **one clause of background and one link to the broader effort**, not a history lesson. Examples:

- "Part of the memberships store migration ([tracking work](url)), …"
- "`X` is the read path that serves the dashboard's team list ([def](url)); …"

Name the domain, link the context, move on. Don't assume tribal knowledge, and don't over-explain it either — the link absorbs the depth.

## Why-first framing

Open with the problem or motivation, not the mechanics. "The membership sync re-reads team memberships mid-mutation, producing false parity mismatches" tells a reviewer why they're here; "Adds a `skipShadowRead` param" does not. State the behavioral intent and the impact first; the implementation links follow.

## What to leave out

- **Routine validation / CI hygiene** — typecheck, lint, "ran the tests", standard build steps. CI already enforces these on every PR; listing them is noise. Only include a validation note if it exercises change-specific behavior CI does *not* cover (a manual production probe, a dashboard spot-check, a one-off data query) — and keep it to a line.
- **Re-narrating the diff** — if the reviewer can see it in the Files tab or a linked line, don't prose it.
- **Hedging and filler** — "this PR aims to basically …". Say it plainly or cut it.

## Example

A tight body in this style (note: two sections, a one-line tail, links carrying the specifics):

```markdown
## Summary

The membership sync job re-reads a team's memberships [thousands of times per run](https://app.datadoghq.com/apm/trace/<id>) while it is actively mutating them, and each read runs a [shadow-read parity check](https://github.com/org/repo/blob/<sha>/pkg/memberships.ts#L153). Fired mid-mutation, that check reports transient, self-clearing divergence — noise that currently dominates the `membership.shadow_read.*` signal ([sample mismatches](https://app.datadoghq.com/logs?query=...)). This opts the sync job out via the existing [`skipShadowRead`](https://github.com/org/repo/blob/<sha>/pkg/memberships.ts#L20) flag, so it stops emitting false mismatches while every other caller keeps reliable signal.

## Change

Thread `skipShadowRead` (default `false`) through the shared resolvers [`getConfirmedMembershipByDirectoryId`](url), [`getMembershipByIdpId`](url), and [`getConfirmedMembershipByIdpId`](url), and set it `true` at the sync job's five reads in `membership_sync.ts` ([1](url), [2](url), [3](url), [4](url), [5](url)). Because it defaults to `false`, other callers (`teams-api`, `user-registration`) are unchanged and keep full coverage.

This removes measurement noise only — no change to writes. Related: [related sync work](https://github.com/org/repo/pull/<number>). Follow-up: the per-user N+1 reads this surfaced.
```

What makes it work: a newcomer learns the domain and the why in the first sentence; the claims ("thousands of reads", "the parity check", "sample mismatches") are links, not assertions; the change is a single sentence plus clickable call sites; scope/safety ("default `false`, other callers unchanged") and a follow-up are stated without ceremony; no validation section.

## Process notes

- Generate the code links *before* writing the prose — resolve the SHA and grep the line numbers first, then write around them. It's faster than retrofitting links and keeps you honest about "show, don't tell".
- If you push more commits, line anchors pinned to the old SHA drift — refresh the links (or re-pin to the new head) before requesting review.
- Editing an existing PR body: keep the same two-section spine, replace prose with links, and delete any routine-validation section.
