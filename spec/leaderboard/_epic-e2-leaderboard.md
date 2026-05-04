# Epic: Leaderboard

**Epic ID**: E2
**Priority**: P0 — Critical
**Description**: A two-panel dashboard page — a left sidebar ranking GitHub repositories by trending/all-time/random signals, and a central Repository Explorer for searching any public repo, viewing its star history, and browsing up to 10 most recent releases.

---

## Scope

### In Scope
- Left sidebar: ranked list of GitHub repositories with Weekly / All-time / Random filter tabs
- Sidebar list items: rank position, repo name, star count, weekly star delta
- Central panel: search bar for any public GitHub repository
- Central panel: star history chart for the currently selected/searched repository
- Central panel: release version list (maximum 10 most recent releases per repo)
- Loading and empty states for both panels
- Visual differentiation for top 3 ranked repos in the sidebar

### Out of Scope
- Inline editing of rankings
- Bookmarking or saving specific views
- Exporting leaderboard data
- Ranked programming language table (moved to language-specific views)
- User authentication or personalised lists

---

## Features

| Feature | Priority | Description |
|---------|----------|-------------|
| F2.1 Ranked Language Table | P0 | Core table displaying all ranked languages (retained, see ranked-language-table.md) |
| F2.2 Metric Sorting | P0 | Re-sort by clicking any metric column |
| F2.3 Ranking Position Indicators | P1 | Visual badges for top 3 |
| F2.4 Pagination or Infinite Scroll | P1 | Access beyond initial viewport |
| F2.5 Trending Repo Sidebar | P0 | Left-panel leaderboard of repos by Weekly / All-time / Random |
| F2.6 Repository Release Explorer | P0 | Central panel for repo search, star history chart, and release list |

---

## Linkages

- **Depends on**: E1 (Ranking Engine — provides scored data), E7 (Responsive Shell — layout)
- **Required by**: E3 (Language Detail — drill-down from table row), E5 (Search & Filter — operates on table)
- **Workflow**: [Data to Ranking Display](../end-to-end/data-to-ranking-display.md) — Step 5
- **New features**: [Trending Repo Sidebar](./trending-repo-sidebar.md), [Repo Release Explorer](./repo-release-explorer.md)
