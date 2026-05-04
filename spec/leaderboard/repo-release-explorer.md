# Feature: Repository Release Explorer

**Feature ID**: F2.6
**Epic**: [E2 — Leaderboard](./_epic-e2-leaderboard.md)
**Priority**: P0 — Critical

---

## 1. Purpose & Scope

The central panel of the redesigned leaderboard page. Users can search for any public GitHub repository and immediately see two types of information side by side: a **star history chart** showing cumulative star growth over time, and a **release version list** showing the 10 most recent tagged releases with their dates and names.

A repository can be loaded into this panel either by:
1. Clicking a repo from the [Trending Repo Sidebar](./trending-repo-sidebar.md)
2. Typing a repo name directly into the search bar

**Intended Audience**: All user personas

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer** | Evaluates a repo's release cadence before adopting it as a dependency |
| **Engineering Manager** | Assesses project health by reviewing how frequently releases are cut |
| **Educator** | Confirms a library is actively maintained before adding it to curriculum |
| **Tech Content Creator** | Correlates release milestones with star growth spikes for storytelling |

---

## 3. User Stories

- As a **developer**, I want to search any public GitHub repository by name so that I can instantly explore its activity without leaving the dashboard.
- As a **developer**, I want to see the last 10 releases of a repo with their version tags and dates so that I can assess release frequency and maturity.
- As a **developer**, I want to see a star history chart so that I can understand when and how fast a project gained community traction.
- As an **engineering manager**, I want to spot repos whose star growth and release cadence both show upward trends so that I can confidently evaluate them for adoption.
- As a **content creator**, I want to see star history alongside release dates so that I can correlate growth events to specific release milestones.

---

## 4. Requirements

### Search Bar
- **REQ-001**: The central panel must display a prominently placed search bar at the top with placeholder text `Search a repository (e.g. facebook/react)`.
- **REQ-002**: The search bar must accept input in both `owner/repo` (exact) and free-text (fuzzy) formats.
- **REQ-003**: As the user types (after a minimum of 2 characters), the system must display an autocomplete dropdown with up to 5 matching public GitHub repositories (name, owner avatar, star count).
- **REQ-004**: Selecting a suggestion or pressing Enter on an exact `owner/repo` string must load that repository into the panel.
- **REQ-005**: If a repo loaded from the sidebar is already displayed, the search bar must show the current repo name pre-filled.

### Star History Chart
- **REQ-006**: When a repository is loaded, a **star history line chart** must be rendered showing cumulative star count on the Y-axis and date on the X-axis.
- **REQ-007**: The chart must cover the full life of the repository (first star to present).
- **REQ-008**: The chart must include a visible legend showing the repo name.
- **REQ-009**: Chart tooltips must appear on hover, showing the exact date and star count at that point.
- **REQ-010**: The chart must render gracefully for repos with fewer than 30 data points (e.g., new or very small projects).

### Release Version List
- **REQ-011**: When a repository is loaded, a **release list panel** must display the **10 most recent tagged releases**, sorted from newest to oldest.
- **REQ-012**: Each release item must display:
  - Version tag (e.g., `v2.1.0`)
  - Release name/title (if provided by the repo maintainer)
  - Publication date (formatted as human-readable relative time — e.g., "3 days ago" — with exact date visible on hover)
  - A direct link to the GitHub release page (opens in new tab)
- **REQ-013**: If a release has no name, the version tag is used as the display title.
- **REQ-014**: If a repo has fewer than 10 releases, all available releases are shown (no padding with empty rows).
- **REQ-015**: If a repo has **no releases**, the release panel must display an informative empty state: `"No releases found for this repository."`.

### General
- **REQ-016**: When no repository has been selected yet (initial empty state), the central panel must display a welcoming prompt guiding the user to search or select a repo from the sidebar.
- **REQ-017**: The panel must display a visible loading state (skeleton/spinner) while the star history or release data is being fetched.
- **REQ-018**: If either the star history or release data fetch fails, the corresponding section must show an error message with a Retry action — the other section must still render normally.
- **REQ-019**: The layout must be responsive — on mobile the star history chart and release list stack vertically; on desktop they can be displayed side by side or chart above list.

---

## 5. Acceptance Criteria

- **AC-001**: Given the leaderboard page loads and no repo is selected, when the user views the central panel, then the empty state prompt is displayed.
- **AC-002**: Given the user types at least 2 characters in the search bar, when autocomplete results are available, then up to 5 matching repositories are shown with name, avatar, and star count.
- **AC-003**: Given the user selects a repo from autocomplete or presses Enter on an `owner/repo` string, when the selection is confirmed, then the star history chart and release list load for that repo.
- **AC-004**: Given a repo is being loaded, when data is in flight, then loading skeletons/spinners are displayed in both the chart and release list areas.
- **AC-005**: Given a repo is loaded successfully, when the central panel renders, then a star history line chart is displayed showing cumulative stars over time with a repo-name legend.
- **AC-006**: Given a repo is loaded successfully, when the release list renders, then a maximum of 10 releases are displayed, newest first, each showing: version tag, release name, relative publication date, and a link to GitHub.
- **AC-007**: Given a repo has fewer than 10 releases, when the release list renders, then all available releases are shown without empty placeholders.
- **AC-008**: Given a repo has zero releases, when the release list renders, then the message `"No releases found for this repository."` is displayed.
- **AC-009**: Given the release data fetch fails while the star history succeeds, when both sections render, then the release section shows an error with Retry and the chart section renders normally.
- **AC-010**: Given a repo is selected from the sidebar, when the central panel updates, then the star history and release list load for that sidebar-selected repo and the search bar pre-fills with its name.
- **AC-011**: Given a desktop viewport (≥ 1024 px), when the central panel is rendered, then the star history chart and release list are displayed in a readable layout (chart prominent, release list alongside or below).
- **AC-012**: Given a mobile viewport (< 640 px), when the central panel is rendered, then the chart and release list stack vertically and both are scrollable.

---

## 6. Layout & UI Behaviour

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 [Search a repository (e.g. facebook/react)         ]    │
├────────────────────────────────┬────────────────────────────┤
│                                │  📦 Releases               │
│   Star History Chart           │  ─────────────────────     │
│                                │  v3.2.0  "Summer Release"  │
│   ★ Stars                      │  2 days ago  ↗ GitHub      │
│   │   ╭────────────────────    │  ─────────────────────     │
│   │  ╭╯                        │  v3.1.0  "Spring Patch"    │
│   │ ╭╯                         │  1 month ago  ↗ GitHub     │
│   │╭╯                          │  ─────────────────────     │
│   ╰──────────────────── Date   │  ... (up to 10)            │
│                                │                            │
└────────────────────────────────┴────────────────────────────┘
```

- **Chart area**: Takes ~60% of panel width on desktop; full width on mobile
- **Release list**: ~40% of panel width on desktop; full width below chart on mobile
- **Autocomplete dropdown**: Floats below the search bar, max 5 items, dismisses on outside click or Escape key

---

## 7. Test & Validation Criteria

### Test Perspectives
- **Empty state**: Verify welcome prompt renders when no repo is selected
- **Search autocomplete**: Verify dropdown appears after 2 characters; shows ≤ 5 results
- **Search exact input**: Verify `owner/repo` input loads the correct repo on Enter/click
- **Chart rendering**: Verify chart displays with correct axes, legend, and tooltips
- **Chart sparse data**: Verify chart renders for repos with < 30 star data points
- **Release list — full**: Verify 10 releases shown, newest first
- **Release list — partial**: Verify < 10 releases shown (no empty rows)
- **Release list — empty**: Verify "No releases found" message shown
- **Release item content**: Verify tag, name, relative date, and GitHub link per item
- **Sidebar integration**: Verify selecting a sidebar repo loads data in this panel
- **Loading state**: Verify skeletons/spinners during data fetch
- **Partial failure — release**: Verify release error + chart OK
- **Partial failure — chart**: Verify chart error + releases OK
- **Responsive — desktop**: Verify chart and list layout side by side or chart above
- **Responsive — mobile**: Verify vertical stacking at < 640 px

### Edge Cases
- Repo with 0 stars (chart shows flat line at 0)
- Repo created today (single-point chart)
- Release tag with no name (tag used as fallback title)
- Very long release name (truncated, full text on hover/expand)
- Search input with leading/trailing whitespace (trimmed before query)
- Non-existent repo string entered (display "Repository not found" error)

---

## 8. Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Repo autocomplete | GitHub Search API — `GET /search/repositories` | Triggered after 2 chars; debounced 300 ms |
| Star history | GitHub API — star history endpoint or third-party service | Paginated; cached client-side for session |
| Release list | GitHub REST API — `GET /repos/{owner}/{repo}/releases` | Returns max 10 per request; no pagination needed |

---

## 9. Out of Scope

- Comparing multiple repos' star histories simultaneously (separate Comparison feature)
- Displaying release changelogs / full release notes body inline
- Downloading or exporting star history data
- Showing pre-releases or draft releases (only published releases shown)
- Displaying tags without a GitHub release (must have an associated release object)
- User-saved repo history or favourites
