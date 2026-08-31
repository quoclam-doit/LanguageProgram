# CLAUDE.md

Project-level instructions for Claude Code working in this repo.

## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature-slug>/` (GitHub remote exists but `gh` CLI isn't set up on this machine yet). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line since there's no real label system on local markdown. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
