# Epic E3 — Ranking

**Epic ID**: E3
**Status**: Planned
**Priority**: P1 — High

---

## Overview

Provide dedicated, metric-focused ranking screens that surface the **top programming languages** by a single dimension — Stars, Forks, and Trending activity — in a visually clear, tab-based interface. Where the Leaderboard (E2) ranks by composite score, Ranking lets users explore rankings from a single-metric perspective with minimal friction.

---

## Business Motivation

- Users frequently want to know "which language has the most GitHub stars" or "which language is hottest right now" without computing a composite score.
- A dedicated tab-per-metric view provides an immediately scannable answer.
- Stars and Forks rankings serve developers evaluating widely-adopted languages; Trending serves educators and managers tracking momentum.

---

## Epic Scope

### In Scope
- A new `/top-ranking` route accessible from the primary navigation header.
- Three tab views: **Stars**, **Forks**, and **Trending** (activity in last 30 days).
- Each tab renders a ranked list of all qualifying languages sorted by the selected single metric.
- Data is sourced from the same cached ranking engine used by the Leaderboard — no additional API calls are made on page access.
- Header navigation updated to include a "Ranking" link after "Leaderboard".
- Loading state with skeleton placeholders.
- Responsive layout (mobile, tablet, desktop).

### Out of Scope
- Time-period filtering (e.g., last 7 days vs. 30 days) — handled by a future epic.
- Per-repository listings within a language — handled by Language Detail (future epic).
- Animated transitions between tabs.
- Paginating beyond the full language set.

---

## Child Features

| Feature ID | Name | Priority |
|------------|------|----------|
| [F3.1](./top-ranking-tabs.md) | Ranking Tabs Screen | P1 |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| E1 — Ranking Engine | Upstream | Provides cached `getRankings()` response |
| E2 — Leaderboard | Upstream | Header navigation pattern to extend |
| E7 — Responsive Shell | Upstream | Header component to modify |
