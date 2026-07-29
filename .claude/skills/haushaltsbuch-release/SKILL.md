---
name: haushaltsbuch-release
description: Use when creating a new release for the HaushaltsBuch project — release branch, version bump, merge to master, rebase develop, tag, and GitHub release.
---

# HaushaltsBuch Release

## Overview

Gitflow-style release: create a `release/vX.Y.Z` branch off `develop`, bump the version there, merge into `master`, rebase `develop` onto `master`, tag, and publish the GitHub release. The release branch is kept.

## Branch Strategy

```
develop ──┬──────────────────────────────► develop (rebased)
          │                                    ▲
          └── release/vX.Y.Z (version bump) ──┤
                                               │ merge
                                            master ──► tag vX.Y.Z
```

## Files to Update (all four must match)

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

Ask the user which semver bump to apply (patch / minor / major) if not stated. Default: **patch**.

### 2 — Create release branch off develop

```bash
git checkout develop
git pull origin develop
git checkout -b release/v<NEW>
git push origin release/v<NEW>
```

### 3 — Bump version in all four files

Use the Edit tool (not sed) on each file. Replace the old version string exactly.

```bash
git add apps/backend/package.json apps/frontend/package.json \
        apps/frontend/src/environments/environment.ts \
        apps/frontend/src/environments/environment.prod.ts
git commit -m "chore: bump version to <NEW>"
git push origin release/v<NEW>
```

### 4 — Merge release branch into master

```bash
git checkout master
git pull origin master
git merge --no-ff release/v<NEW> -m "chore(release): merge release/v<NEW> into master"
git push origin master
```

### 5 — Tag on master

```bash
git tag v<NEW>
git push origin v<NEW>
```

### 6 — Rebase develop onto master

```bash
git checkout develop
git pull origin develop
git rebase master
git push origin develop --force-with-lease
```

### 7 — Generate changelog

```bash
git log v<PREV>..v<NEW> --oneline
```

Group commits by prefix:
- `feat:` → **Neue Features**
- `fix:` → **Bugfixes**
- `chore(deps)` / `chore(deps-dev)` → **Abhängigkeiten**
- other `chore:` → omit unless notable

### 8 — Create GitHub Release

```bash
gh release create v<NEW> --title "v<NEW>" --notes "<CHANGELOG>"
```

Write notes in German, structured markdown.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgot a version file | Check all four files before committing in step 3 |
| Push rejected on master | `git pull --rebase origin master` then push again |
| `develop` rebase conflicts | Resolve conflicts, `git rebase --continue`, then force-push |
| Tag already exists | `git tag -d v<X> && git push origin :refs/tags/v<X>` then re-tag |
| Merged into master without release branch | Start over from step 2 on a new release branch |
