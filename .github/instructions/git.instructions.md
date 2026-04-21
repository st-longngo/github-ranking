---
applyTo: '**/.github/**,**/.husky/**'
description: 'Conventional commits, branch naming, PR format, and changelog rules'
---

# Git Standards

## Commit Messages
- Use conventional commits: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`
- Scope: module or feature name (`feat(auth): add login flow`)
- Description: imperative mood, lowercase, no period (`add user search`, not `Added user search.`)
- Max 72 characters for subject line
- Body: explain **what** and **why**, not **how**

## Branch Naming
- `feature/<ticket-id>-short-description` (e.g., `feature/GR-42-user-rankings`)
- `bugfix/<ticket-id>-short-description`
- `hotfix/<ticket-id>-short-description`
- `chore/<description>` for maintenance tasks

## Pull Requests
- Title matches commit convention: `feat(rankings): add weekly ranking page`
- Description sections: **What**, **Why**, **Testing**, **Screenshots** (if UI change)
- Squash merge to main — one clean commit per PR
- Keep PRs small and focused — one feature or fix per PR

## Anti-Patterns
- Do NOT force push to shared branches
- Do NOT commit `.env`, `node_modules/`, `.next/`, or build artifacts
- Do NOT commit `console.log` debug statements
- Do NOT amend published commits
