# Agent Rules

Shared agent skills: each lives in `skills/<name>/SKILL.md` and installs by symlink via `setup.sh`
/ `setup.ps1`, so edits take effect on the next pull.

## Changes

- When adding, renaming, or retiring a skill, update the `## Skills` table in `README.md`.
- `setup.sh` and `setup.ps1` both parse `SKILL.md` frontmatter for the generated `INDEX.md`; change
  them together.
- CI runs `shellcheck` on every `*.sh`; run it locally before pushing.

## Pull requests

- Never push to `main`; open a PR from a feature branch with `gh`.
- PR bodies follow this repo's own [`pr-description`](skills/pr-description/SKILL.md) skill:
  `## Summary` (1–3 sentences, why-first, one clause of newcomer context) + `## Change` (1–2
  sentences, key lines, scope/safety); optional one-line tail. Link code at a pinned commit SHA and
  related PRs/issues as full URLs instead of describing them; omit routine CI/validation notes.
- Write multiline bodies to a temp file and pass `gh ... --body-file`.
