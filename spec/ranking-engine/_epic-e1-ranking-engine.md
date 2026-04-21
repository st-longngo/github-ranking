# Epic: Ranking Engine

**Epic ID**: E1
**Priority**: P0 — Critical
**Description**: Fetch, process, and score programming languages from GitHub data. This epic is the foundation for every user-facing feature — without data acquisition and scoring, the dashboard has no value.

---

## Scope

### In Scope
- Fetching language-level metrics from GitHub APIs (REST + GraphQL)
- Normalizing metrics to a common scale
- Computing a weighted composite score
- Generating per-metric individual rankings
- Rate limit management and caching
- Excluding languages below the minimum repository threshold

### Out of Scope
- Persistent storage of historical data
- User-configurable scoring weights
- Data from sources other than GitHub

---

## Features

| Feature | Priority | Description |
|---------|----------|-------------|
| F1.1 GitHub Data Fetching | P0 | Retrieve language metrics from GitHub APIs |
| F1.2 Composite Score Calculation | P0 | Weighted score combining all metrics |
| F1.3 Per-Metric Rankings | P0 | Independent ranking per metric dimension |
| F1.4 Rate Limit Management | P0 | Caching, request optimization, graceful degradation |

---

## Linkages

- **Depends on**: None (foundational epic)
- **Required by**: E2 (Leaderboard), E3 (Language Detail), E4 (Comparison Tool), E5 (Search & Filter), E6 (Data Visualization)
- **Workflow**: [Data to Ranking Display](../end-to-end/data-to-ranking-display.md) — Steps 2-4
