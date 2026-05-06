# Feature: Repository Detail Page

**Feature ID**: F2.7
**Epic**: [E2 — Leaderboard](./_epic-e2-leaderboard.md)
**Priority**: P0 — Critical
**Status**: Draft
**Date**: 2026-05-05

---

## 1. Purpose & Scope

Replace all current behaviours that open GitHub.com in a new tab when a repository item is clicked. Instead, clicking any repository item — from the Trending feed, Ranking table, or any ranked list — navigates the user to an **in-app repository detail page** at the route `/repo/:owner/:name`.

The page is a three-panel layout inspired by star-history.com:

| Panel | Content |
|-------|---------|
| **Left sidebar** | Ranked list of nearby repositories ("Nearby Ranks") — shows the repositories ranked immediately above and below the viewed repo, with the current repo highlighted |
| **Centre content area** | Tabbed view — Overview (radar/spider metric chart), Star History (full chart), Contributors, Badges |
| **Right info panel** | Repository metadata card — name, description, key stats, weekly activity, "View on GitHub" link |

**Intended Audience**: All user personas, particularly developers evaluating repositories.

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer (primary)** | Wants deep context on a repository — star trajectory, contributor count, language, release cadence — before adopting it |
| **Engineering Manager** | Needs a quick health check: activity trend, weekly momentum, and community size |
| **Tech Educator** | Verifies a project is active and has sufficient community before recommending it |
| **Content Creator** | Needs shareable in-app URLs to link to repository analyses in articles |

---

## 3. User Stories

### S-001 — In-App Navigation
**As a** user browsing the Trending feed or any ranked list,
**I want** clicking a repository item to open an in-app detail page instead of GitHub,
**so that** I stay in the ranking context and can navigate to nearby repos without losing my place.

### S-002 — Nearby Ranks Sidebar
**As a** developer viewing a repository's detail page,
**I want** to see a sidebar listing the repositories ranked immediately above and below the one I am viewing,
**so that** I can quickly compare it to similar-ranked repos without going back to the feed.

### S-003 — Active Repo Highlighting
**As a** user on the detail page,
**I want** the current repository to be visually highlighted in the Nearby Ranks sidebar,
**so that** I immediately understand where it sits in the ranking.

### S-004 — Overview Tab with Radar Chart
**As a** developer,
**I want** to see an Overview tab with a radar/spider chart plotting five dimensions (Stars, Forks, New Stars, New Pushes, Contributors),
**so that** I can assess the repo's strengths and weaknesses at a glance without reading individual numbers.

### S-005 — Star History Tab
**As a** developer or content creator,
**I want** a dedicated Star History tab showing the full cumulative star count chart,
**so that** I can understand the project's growth arc over its entire lifetime.

### S-006 — Right Panel Metadata
**As a** user,
**I want** a persistent right panel showing the repository's key facts (name, description, star count, global rank, forks, language, license, creation date, weekly activity),
**so that** I always have the essential snapshot visible regardless of which centre tab I am viewing.

### S-007 — Weekly Activity Summary
**As a** engineering manager,
**I want** to see this-week's new stars, push count, and issues closed in the right panel,
**so that** I can assess current momentum without needing to visit GitHub.

### S-008 — View on GitHub Button
**As a** user who wants to take action on a repository (star it, fork it, file an issue),
**I want** a prominent "View on GitHub" button in the right panel,
**so that** I can move to GitHub when I am ready — but only then.

### S-009 — Shareable URL
**As a** content creator,
**I want** the detail page to have a bookmarkable URL (`/repo/owner/name`),
**so that** I can share a direct link to a repository's analysis.

### S-010 — Global Rank Badge
**As a** developer,
**I want** to see the repository's global rank displayed prominently in the centre panel,
**so that** I can contextualise how it compares against all other tracked repositories.

---

## 4. Functional Requirements

### Navigation & Routing
| ID | Requirement |
|----|-------------|
| **REQ-001** | Every repository item in the Trending feed, Ranking tables, and Ranking detail lists must navigate to `/repo/:owner/:name` on click instead of opening GitHub in a new tab. |
| **REQ-002** | The route must accept any public GitHub repository in the form `/repo/{owner}/{repo-name}`, where both segments are validated as valid GitHub identifiers. |
| **REQ-003** | The page must be shareable — a user who arrives via a direct URL must see the fully populated detail page. |
| **REQ-004** | The browser back button must return the user to the previous ranked list or feed. |

### Left Sidebar — Nearby Ranks
| ID | Requirement |
|----|-------------|
| **REQ-005** | The left sidebar must display a "NEARBY RANKS" section listing repositories ranked approximately 10 positions above and 10 positions below the viewed repository within the same context (weekly trending, all-time, or global). |
| **REQ-006** | The currently viewed repository must be visually highlighted (e.g. bold text, coloured background) in the sidebar list. |
| **REQ-007** | Each sidebar item must display: rank number, repository name (truncated if necessary), and star count. |
| **REQ-008** | Clicking any sidebar item must navigate to that repository's detail page. |
| **REQ-009** | The sidebar rank context must match whichever list the user navigated from (weekly trending, all-time, top-repos, etc.). If context cannot be determined, default to all-time star ranking. |
| **REQ-010** | The sidebar must show a loading skeleton while rank data is being fetched. |

### Centre Content Area — Tabs
| ID | Requirement |
|----|-------------|
| **REQ-011** | The centre panel must contain a tab bar with at minimum these tabs: **Overview**, **Star History**. Additional tabs (Contributors, Badges) may be added in future iterations. |
| **REQ-012** | **Overview tab** must display: repository title (`owner / name` formatted), owner avatar, description, primary language tag, license tag, all-time star count, fork count, contributor count, and weekly star delta + weekly push count as a "WEEKLY" summary row. |
| **REQ-013** | **Overview tab** must include a **radar/spider chart** with five axes: Stars, Forks, New Stars (weekly), New Pushes (weekly), Contributors. All values must be normalised to a 0–100 scale relative to the visible comparison set before plotting. |
| **REQ-014** | The radar chart must display a reference polygon (e.g. dashed outer ring) and the repo's filled polygon in a contrasting colour. |
| **REQ-015** | **Overview tab** must display a prominent **Global Rank badge** (e.g. circular sticker-style element with `#NNN`) overlaid on or adjacent to the chart. |
| **REQ-016** | **Star History tab** must render the full cumulative star history line/area chart for the repository, identical in data and visual treatment to the existing chart in the Repository Release Explorer. |
| **REQ-017** | The centre panel must show a loading skeleton while repository data is being fetched. |
| **REQ-018** | If the repository cannot be found or is private, the centre panel must show an informative empty state with a link to search for another repo. |

### Right Info Panel
| ID | Requirement |
|----|-------------|
| **REQ-019** | The right panel must always be visible alongside the centre tabs (it does not change between tabs). |
| **REQ-020** | The right panel must display: owner avatar (large), repository full name, repository description. |
| **REQ-021** | The right panel must display a stats grid containing: Stars (with value), Global Rank (with rank number), Forks (with value), Contributors (with value). |
| **REQ-022** | The right panel must display metadata fields: Language, License, Created date. |
| **REQ-023** | The right panel must include a **"THIS WEEK"** summary section showing: new stars (with ± delta), push count, issues closed count. |
| **REQ-024** | The right panel must include a **"View on GitHub"** button that opens the repository URL in a new browser tab. |
| **REQ-025** | The right panel must show a loading skeleton while data is being fetched. |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| **CON-001** | Data displayed on the detail page must be fetched from the existing GitHub REST API integration — no new third-party data source may be added. |
| **CON-002** | The page must render a meaningful skeleton/loading state within 100 ms so the layout does not shift on data arrival. |
| **CON-003** | The radar chart normalisation must be computed client-side from the data returned for the nearby repos set — no separate normalisation API is required. |
| **CON-004** | The page layout must be fully responsive: on mobile (< 640 px), the sidebar collapses to a horizontal scrollable chip list or is hidden behind a toggle; the right panel moves below the centre content. |
| **GUD-001** | The `owner / name` title in the centre panel must use typographic weight differentiation: `owner` in a lighter weight, `/` as a separator, `name` in bold — matching the design reference. |
| **GUD-002** | The global rank badge must use a visually distinct treatment (e.g. contrasting colour, circular or sticker shape) to immediately draw attention. |
| **GUD-003** | Radar chart axes must be labelled directly on the chart, not in a separate legend. |

---

## 6. Security Requirements

| ID | Requirement |
|----|-------------|
| **SEC-001** | The `owner` and `repo` path parameters must be validated against the GitHub identifier pattern `[a-zA-Z0-9._-]+` before any API call. Invalid values must return a 404/not-found state. |
| **SEC-002** | Repository descriptions and names rendered on the page must be treated as plain text — no HTML interpretation or rendering of rich text from the API. |
| **SEC-003** | The "View on GitHub" link must use `rel="noopener noreferrer"` and `target="_blank"`. |

---

## 7. Acceptance Criteria

### AC-001 — Route and Navigation
**Given** any trending, top-ranking, or nearby-ranks repository item is displayed,
**When** the user clicks on it,
**Then** the browser navigates to `/repo/{owner}/{name}` within the same tab (no new tab opened).

### AC-002 — Direct URL Access
**Given** a user visits `/repo/facebook/react` directly,
**When** the page loads,
**Then** the repository detail page for `facebook/react` is displayed with all three panels populated.

### AC-003 — Left Sidebar Nearby Ranks
**Given** the detail page for a repository at global rank #375 is loaded,
**When** the left sidebar renders,
**Then** it shows a list of nearby repositories (e.g. ranks #365–#385), with rank #375 visually highlighted.

### AC-004 — Sidebar Item Click
**Given** the Nearby Ranks sidebar is visible,
**When** the user clicks a different repository in the sidebar,
**Then** the centre and right panels update to show that repository's data, and the clicked item becomes highlighted.

### AC-005 — Overview Tab Radar Chart
**Given** the detail page is loaded for a repository,
**When** the user views the Overview tab,
**Then** a radar chart is visible with five labelled axes (Stars, Forks, New Stars, New Pushes, Contributors), and the repository's normalised scores are plotted as a filled polygon.

### AC-006 — Global Rank Badge Visible
**Given** the detail page is loaded and the repository has a computable global rank,
**When** the user views the Overview tab,
**Then** a prominent rank badge (e.g. "#375") is visible in or adjacent to the chart area.

### AC-007 — Star History Tab
**Given** the detail page is loaded,
**When** the user clicks the "Star History" tab,
**Then** the cumulative star history chart for the repository is displayed.

### AC-008 — Right Panel Always Visible
**Given** the user switches between centre tabs (Overview → Star History),
**When** the tab changes,
**Then** the right info panel remains visible and its contents do not change.

### AC-009 — Right Panel This Week Stats
**Given** the detail page is loaded for a repository with weekly activity data,
**When** the right panel renders,
**Then** "THIS WEEK" section shows new star delta, push count, and issues closed count.

### AC-010 — View on GitHub Button
**Given** the right panel is visible,
**When** the user clicks "View on GitHub",
**Then** the repository's GitHub URL opens in a new browser tab with `rel="noopener noreferrer"`.

### AC-011 — Invalid Repository
**Given** a user navigates to `/repo/nonexistent-owner/nonexistent-repo`,
**When** the page loads and the API returns a not-found response,
**Then** an informative empty state is displayed with a message and a link to return to the Explore feed.

### AC-012 — Invalid Path Parameters
**Given** a user navigates to `/repo/bad!owner/bad<repo>`,
**When** the page processes the URL,
**Then** a 404 page is shown without any API call being made.

### AC-013 — Mobile Layout
**Given** the page is viewed on a viewport narrower than 640 px,
**When** the page renders,
**Then** the left sidebar is hidden by default (accessible via a toggle), and the right info panel appears below the centre content area.

### AC-014 — Loading State
**Given** repository data has not yet loaded,
**When** the page is initially rendering,
**Then** skeleton placeholders matching the three-panel structure are visible in all panels.

---

## 8. Data Requirements

The following data points must be available to render the complete page. Where not already available via existing API routes, new data-fetch capabilities are required.

| Data Field | Source | Status |
|------------|--------|--------|
| Repository full name, description, HTML URL | GitHub REST API (`/repos/{owner}/{repo}`) | New endpoint needed |
| Owner avatar URL | GitHub REST API (`/repos/{owner}/{repo}`) | New endpoint needed |
| Total stars, total forks | GitHub REST API (`/repos/{owner}/{repo}`) | New endpoint needed |
| Primary language, license | GitHub REST API (`/repos/{owner}/{repo}`) | New endpoint needed |
| Created date | GitHub REST API (`/repos/{owner}/{repo}`) | New endpoint needed |
| Contributor count | GitHub REST API (`/repos/{owner}/{repo}/contributors?per_page=1`, use Link header) | New endpoint needed |
| Star history (cumulative) | Existing `/api/repo-stars` route | Already exists |
| Weekly star delta | Existing trending data pipeline | Already exists for trending repos |
| Weekly push count | GitHub REST API (`/repos/{owner}/{repo}/commits`, count last 7 days) | New endpoint needed |
| Weekly issues closed | GitHub REST API (`/search/issues` for closed issues in last 7 days) | New endpoint needed |
| Nearby ranked repos | Existing trending/top-repos data, filtered for context window | Needs context-aware slice |
| Global rank | Computed from existing star-sorted repository list | Needs rank computation |

---

## 9. Edge Cases

| Scenario | Expected Behaviour |
|----------|--------------------|
| Repository has 0 contributors counted | Show "—" for contributor count; radar chart Contributor axis set to 0. |
| Repository created less than 7 days ago | Weekly delta fields show "—" or "New" instead of a number. |
| Repository has no releases | Releases section (if shown) displays "No releases yet." |
| Repository has no description | Description field in right panel shows empty/`—` gracefully. |
| Global rank is unavailable (repo not in tracked set) | Rank badge not shown; "Global rank not available" displayed instead. |
| User navigates directly to a repo URL without ranking context | Sidebar defaults to showing all-time star ranking context neighbours. |
| Very long repository name | Truncated with ellipsis in sidebar; full name visible in centre panel title. |
| Radar chart values all zero | Chart renders correctly (all axes at centre point) without visual artifacts. |

---

## 10. Out of Scope

- Editing or submitting data about a repository
- Commenting on or bookmarking repositories
- Repository comparison mode (viewing two repos side-by-side)
- "First N Stargazers" or "Badges" tabs (design exploration only — not in this iteration)
- Contributor profiles or list of individual contributors
- Commit history or issue list details
- Repository README rendering
- Private repository support
- Real-time live updates while the page is open (polling/websockets)
- Data export (PNG download of chart, CSV of star history)
- Social sharing meta-tag images (OG image generation — separate feature)
