---
name: pr-description
description: Use when writing or revising a pull-request description. Produces concise, link-heavy, reviewer-scannable Markdown.
---

# PR Description

Write a reviewer-oriented PR body. Explain why first, name the change second,
and link concrete evidence instead of narrating the diff.

## Structure

Read the target repository's `AGENTS.md`, `CLAUDE.md`, contribution guide, PR
template, and existing PR body before writing. Preserve required sections,
checklists, and metadata. Repository requirements take precedence over this
skill's default layout.

When no stronger template applies, use two short sections:

```markdown
## Summary
<Why this matters in one to three sentences.>

## Change
<What changed and its scope or safety in one or two sentences.>
```

Add a final line for an applicable issue-closing directive, related PR, scope
caveat, or follow-up. Use `Closes #<issue-number>` (or a repo-qualified reference)
when the PR actually resolves that issue. Do not claim closure for partial work.

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

For an existing PR, resolve its actual head commit and head repository with
`gh pr view <target> -R <owner/repo> --json headRefOid,headRepository`. Verify the
local checkout matches that commit before reading line ranges, or inspect the
remote tree at that commit. Link to the head repository, including for fork PRs.
Do not assume local `git rev-parse HEAD` belongs to the PR.

For a new PR, verify the intended repository and branch, push its commits, then
use that pushed head and its line ranges. Refresh pinned links after each push.
Use `gh ... --body-file` for multiline Markdown.
