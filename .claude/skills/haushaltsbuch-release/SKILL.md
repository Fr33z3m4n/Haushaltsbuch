---
name: haushaltsbuch-release
description: Use when creating a new release for the HaushaltsBuch project — version bump, tagging, and GitHub release with changelog.
---

# HaushaltsBuch Release

## Overview

Bumps the version in all four files, commits, tags, and publishes a GitHub release with an auto-generated changelog.

## Files to Update

All four must match the same version string:

| File | Field |
|------|-------|
| `apps/backend/package.json` | `"version"` |
| `apps/frontend/package.json` | `"version"` |
| `apps/frontend/src/environments/environment.ts` | `version:` |
| `apps/frontend/src/environments/environment.prod.ts` | `version:` |

## Steps

### 1 — Determine new version

```bash
git tag --sort=-v:refname | head -3
```

Ask the user which semver bump to apply (patch / minor / major) if not already stated. Default: **patch** (`1.0.x`).

### 2 — Update version in all four files

Use Edit (not sed) on each file. Replace the old version string exactly.

`environment.ts` pattern:  `version: '1.0.x'`
`environment.prod.ts` pattern:  `version: '1.0.x'`

### 3 — Commit

```bash
git add apps/backend/package.json apps/frontend/package.json \
        apps/frontend/src/environments/environment.ts \
        apps/frontend/src/environments/environment.prod.ts
git commit -m "chore: bump version to <NEW>"
```

### 4 — Push & rebase if needed

```bash
git push origin <branch>
# If rejected: git pull --rebase origin <branch> && git push origin <branch>
```

### 5 — Tag

```bash
git tag v<NEW>
git push origin v<NEW>
```

### 6 — Generate changelog

```bash
git log v<PREV>..HEAD --oneline
```

Group commits by prefix:
- `feat:` → **Neue Features**
- `fix:` → **Bugfixes**
- `chore(deps)` / `chore(deps-dev)` → **Abhängigkeiten**
- other `chore:` → omit unless notable

### 7 — Create GitHub Release

```bash
gh release create v<NEW> --title "v<NEW>" --notes "<CHANGELOG>"
```

Write the notes in German, structured markdown.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgot `environment.ts` or `environment.prod.ts` | Check all four files before committing |
| Push rejected | `git pull --rebase` then push again |
| Tag already exists | `git tag -d v<X> && git push origin :refs/tags/v<X>` then re-tag |
| Wrong branch | Releases go out from `master` — merge `develop → master` via PR first |
