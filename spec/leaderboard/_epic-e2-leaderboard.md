# Epic: Leaderboard

**Epic ID**: E2
**Priority**: P0 — Critical
**Description**: Display ranked programming languages in an interactive, sortable table — the primary surface users interact with when visiting the dashboard.

---

## Scope

### In Scope
- Ranked language table with position, name, composite score, and individual metrics
- Column-based sorting by any metric
- Visual differentiation for top 3 ranked languages
- Handling of large language lists (pagination or infinite scroll)
- Loading and empty states

### Out of Scope
- Inline editing of rankings
- Bookmarking or saving specific views
- Exporting leaderboard data

---

## Features

| Feature | Priority | Description |
|---------|----------|-------------|
| F2.1 Ranked Language Table | P0 | Core table displaying all ranked languages |
| F2.2 Metric Sorting | P0 | Re-sort by clicking any metric column |
| F2.3 Ranking Position Indicators | P1 | Visual badges for top 3 |
| F2.4 Pagination or Infinite Scroll | P1 | Access beyond initial viewport |

---

## Linkages

- **Depends on**: E1 (Ranking Engine — provides scored data), E7 (Responsive Shell — layout)
- **Required by**: E3 (Language Detail — drill-down from table row), E5 (Search & Filter — operates on table)
- **Workflow**: [Data to Ranking Display](../end-to-end/data-to-ranking-display.md) — Step 5
