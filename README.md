<p align="center">
  <img src="https://images.unsplash.com/photo-1692067166728-e2724f563c19?w=1200&h=400&fit=crop&crop=center" alt="Alpine meadow of wildflowers with mountain peaks in the background" width="100%" />
</p>

# Skills

> Reusable [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and Codex skills for autonomous
> development workflows — PR shepherding, dashboard maintenance, and more.
>
> _From the wildflower meadows of Colorado, with love._

Skills are command skills that teach Claude Code and Codex _how_ to do complex, multi-step tasks. They're
plain Markdown files with structured instructions — readable by humans, executable by bots. Think of
them as detailed trail guides: clear enough for anyone to follow, thorough enough to reach the
summit without hand-holding.

This repo is designed for a **worktree-based workflow**: multiple agent sessions running in
parallel via `git worktree`, each on its own branch, blazing its own trail to the summit.

## Quick Start

### Linux / macOS

```sh
git clone git@github.com:photon-grove/skills.git ~/code/photon-grove/skills
cd ~/code/photon-grove/skills
./setup.sh
```

To install a single skill:

```sh
./install-skill.sh <skill-name>
```

### Windows

**Git Bash (recommended)** — works without elevated privileges:

```sh
git clone git@github.com:photon-grove/skills.git ~/code/photon-grove/skills
cd ~/code/photon-grove/skills
bash setup.sh
```

To install a single skill:

```sh
bash install-skill.sh <skill-name>
```

**PowerShell** — requires Developer Mode (Settings > For developers) or an elevated (admin) prompt:

```powershell
git clone git@github.com:photon-grove/skills.git ~\code\photon-grove\skills
cd ~\code\photon-grove\skills
.\setup.ps1
```

To install a single skill:

```powershell
.\install-skill.ps1 <skill-name>
```

---

Skills are symlinked into `~/.claude/skills/` and `~/.codex/skills/`, plus the skill-only roots used
by Pi (`~/.pi/agent/skills/`) and OpenCode (`~/.config/opencode/skills/`), so changes to this repo
are reflected immediately — pull the repo and you're up to date. No reinstall needed. The
PowerShell installers (`setup.ps1`, `install-skill.ps1`) currently target `~/.claude` and
`~/.codex` only.

## Skills

| Skill | Command | What it does |
|-------|---------|-------------|
| **AWS Cost Check** | `/aws-cost-check` | Discovers AWS resources, attributes spend, and flags runaway costs, errors, and anomalies |
| **Dashboard** | `/dashboard` | Updates a Notion follow-ups tracker and dashboard using machine-local configuration |
| **Optimize Tests** | `/optimize-tests` | Audits, removes, consolidates, and rewrites tests for higher confidence per maintenance cost |
| **PR Description** | `/pr-description` | Writes concise PR bodies with commit-pinned evidence links |
| **Shepherd to Merge** | `/shepherd-to-merge` | Single-PR or sequential queue mode: reviews, fixes feedback, rebases, and auto-merges |
| **Unslop** | `/unslop` | Detects and rewrites generic, overly polished, or AI-sounding prose while preserving meaning |

### Dashboard configuration

The `dashboard` skill requires an authenticated Notion MCP server at
`https://mcp.notion.com/mcp`. The skill installers do **not** register MCP servers.
Before invoking it, add the server to each client you use and complete Notion OAuth:

- **Claude Code:** run `claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp`,
  then open `/mcp` in Claude Code and authenticate the `notion` server.
- **Codex:** run `codex mcp add notion --url https://mcp.notion.com/mcp`, then
  `codex mcp login notion`.
- **OpenCode:** run `opencode mcp add notion --url https://mcp.notion.com/mcp`, then
  `opencode mcp auth notion`.
- **Pi:** use an HTTP/OAuth-capable MCP extension, such as `pi-mcp-adapter`.
  Use its `mcp` gateway's `install` action with `url: "https://mcp.notion.com/mcp"`,
  then complete the OAuth prompt.

Authorize access to the dashboard and tracker. Reconnect or restart the client if
needed, then verify the Notion tools can fetch both before attempting updates.
Do not put OAuth tokens in the dashboard configuration or this repository.

Keep workspace-specific settings in `~/.dashboard.json`, outside this repository.
Do not overwrite an existing configuration.

**Linux / macOS / Git Bash:**

```sh
cp -n skills/dashboard/dashboard.example.json ~/.dashboard.json
chmod 600 ~/.dashboard.json
```

**PowerShell:**

```powershell
$configPath = Join-Path $HOME '.dashboard.json'
if (-not (Test-Path $configPath)) {
    Copy-Item skills/dashboard/dashboard.example.json $configPath
}
```

On Windows, use the file's Properties → Security settings to restrict access to
your account and required system administrators. `chmod` is not available in
PowerShell.

Replace the example's `dashboard_url` with your Notion dashboard URL. Optionally set
`tracker_data_source_url` to the tracker's `collection://...` URL and list exact project
names in `excluded_projects`. Otherwise the skill discovers the tracker from the page
and follows its maintenance conventions. If several trackers exist, it asks you to
choose rather than guessing. Each machine can point to a different dashboard.

The skill preserves embedded databases and maintenance conventions, updates tracker
rows before dashboard summaries, and checks live evidence before marking work done.
See [`skills/dashboard/SKILL.md`](skills/dashboard/SKILL.md) for the layout and schema.
It does not automatically create a Notion dashboard. A differently named local
dashboard skill is left in place for a later migration.

**Existing skill named `dashboard`:** before running either installer, move any
local `dashboard` directory and its `dashboard.bak` copies to a backup directory
outside all skill roots, such as `~/.local/share/skill-backups/`. Check each root
you use: `~/.claude/skills/`, `~/.codex/skills/`, `~/.pi/agent/skills/`, and
`~/.config/opencode/skills/`. Existing symlinks to this repo can stay. The installers
otherwise replace a same-named local directory with a repo symlink and leave a
`.bak` directory inside the discovery path, which can expose two skills with the
same frontmatter name. Archive first, configure `~/.dashboard.json`, then install
the public skill. Do not remove a differently named local skill until you have
verified the new workflow.

## Skill Discoverability

Run `./setup.sh` (or `./setup.ps1` on Windows) to refresh installed skills and generate a canonical
index at:

- `~/.claude/skills/INDEX.md`
- `~/.codex/skills/INDEX.md`

When a skill is removed upstream, re-run `setup.sh`: stale symlinks pointing into this repo are
removed automatically and the INDEX files are regenerated. Real (non-symlink) copies must be
removed manually, for example `rm -r ~/.claude/skills/<name>`. Check backup directories
and synced copies too: a directory ending in `.bak` can still contain a discoverable
`SKILL.md`. Cloud-managed copies may return until removed from their source.

This keeps a stable, single-file inventory of installed skills so command discovery is consistent
across sessions.

## Extras

- **`statusline/statusline.sh`** — CLI statusline showing session name, context %, cost, and model.
  Detects worktree names from `.claude/worktrees/<name>/` and `.codex/worktrees/<name>/` paths.
- **`hooks/`** — Hook scripts (empty for now — add hooks as needed).

## Updating

```sh
cd ~/code/photon-grove/skills && git pull
```

Since skills are symlinked, existing ones update automatically. Run `./setup.sh` (or `.\setup.ps1`
on Windows) again only to pick up newly added skills or hooks.

## Writing New Skills

A skill is a directory under `skills/` containing a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-skill
description: One-line description shown in /help
argument-hint: <optional args>
---

# My Skill

Instructions go here. Write them like you're onboarding a sharp colleague
who's never seen the codebase — enough context to be autonomous, not so
much that it's a novel.
```

After adding a new skill, run `./setup.sh` (or `.\setup.ps1` on Windows) to symlink it into
`~/.claude/skills/` and `~/.codex/skills/`.

Good skills are **specific**, **sequential**, and **verifiable** — they tell the agent what to do,
in what order, and how to know it reached the summit.

## Common Pitfalls

Cairns marking where others have stumbled:

| Problem | Cause | Fix |
|---------|-------|-----|
| Wrong repo targeted | Agent derived repo from wrong remote | Use explicit `owner/repo` argument |
| Push to wrong branch | Didn't verify tracking before push | Run `git branch -vv` before pushing |
| CI won't trigger | Stale workflow YAML on branch | Rebase onto latest main |
| Worktree branch conflict | Tried to switch to `main` | Use `claude/<worktree-name>` or `codex/<worktree-name>` instead |
| Cache misses after runner change | Mixed cache actions | Use repo's standard cache action consistently |

## CLAUDE.md Integration

Skills are generic — they work across repos. For repo-specific behavior, add context to the repo's
`CLAUDE.md` or `AGENTS.md`:

- **Repository identity** — correct org/repo name to prevent wrong-repo targeting
- **CI architecture** — runner type, cache action, build constraints
- **Branch conventions** — naming patterns, protected branches
- **Verification commands** — test/lint/build commands for the project's toolchain

Implementation skills read `AGENTS.md`/`CLAUDE.md` for repository constraints. Keep those files
accurate to reduce wrong-repo edits and incorrect verification commands.

## License

MIT

---

<p align="center"><sub>Happy trails from the high country.</sub></p>
<p align="center"><sub>Banner: <a href="https://unsplash.com/photos/jiTG4IQo3o4">Alpine Meadow</a> by Brice Cooper on Unsplash</sub></p>
