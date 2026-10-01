---
name: pr-description
description: Use when writing or revising a pull-request description. Produces concise, link-heavy, reviewer-scannable Markdown.
---

# PR Description

Write a reviewer-oriented PR body. Explain why first, name the change second,
and link concrete evidence instead of narrating the diff.

## Structure

Use two short sections:

```markdown
## Summary
<Why this matters in one to three sentences.>

## Change
<What changed and its scope or safety in one or two sentences.>
```

Add a final line only for a related PR, scope caveat, or follow-up that earns
its place.

## Links

- Link key code with a full GitHub URL pinned to the current commit SHA.
- Link related issues and PRs with full URLs.
- Prefer short descriptive links to prose that repeats implementation detail.

## Style

- Lead with the problem or impact, not mechanics.
- Keep paragraphs to one idea and one to three sentences.
- Bold the subject and use inline code for symbols, paths, and flags.
- Include one clause of newcomer context when needed, then link deeper detail.
- Omit routine CI and test narration. Include validation only when it is specific
  to the change and not enforced by CI.

## Process

Before writing, resolve `git rev-parse HEAD` and the line ranges for linked
code. Refresh pinned links after pushing more commits. Use `gh ... --body-file`
for multiline Markdown.
