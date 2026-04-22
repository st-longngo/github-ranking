# Feature: Top Ranking Tabs Screen

**Feature ID**: F3.1
**Epic**: [E3 — Top Ranking](./_epic-e3-top-ranking.md)
**Priority**: P1 — High

---

## 1. Purpose & Scope

Deliver a dedicated `/top-ranking` screen that presents programming language rankings from three single-metric perspectives — **Stars**, **Forks**, and **Trending** — through a tab-based interface. The screen requires no extra data fetching on access; it reuses the same cached data already computed by the Ranking Engine (E1), making it safe to visit at any rate without risk of exhausting the GitHub API quota.

**Intended Audience**: All user personas (developers, engineering managers, educators).

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer** | Quickly identifies which languages dominate by raw stars or forks before making technology choices |
| **Engineering Manager** | Monitors activity-based trends (Trending tab) to surface rising languages |
| **Educator** | Finds the most favorited (starred) languages to guide curriculum decisions |

---

## 3. User Stories

- As a **developer**, I want to see languages ranked purely by GitHub stars so that I can identify the most widely appreciated projects by the community.
- As a **developer**, I want to see languages ranked purely by fork count so that I can gauge which languages encourage the most derivative or collaborative work.
- As an **engineering manager**, I want to see a "Trending" tab ranked by recent activity (last 30 days) so that I can identify which languages are gaining momentum right now.
- As any user, I want to switch between Stars, Forks, and Trending views instantly without a full page reload so that comparing perspectives is frictionless.
- As any user, I want to access the Top Ranking screen from the main navigation so that it is always one click away.
- As any user, I want the page to load instantly even on first visit so that I never experience delay due to API rate limits.

---

## 4. Requirements

### Navigation
- **REQ-001**: The primary navigation header must include a "Top Ranking" link positioned immediately after "Leaderboard".
- **REQ-002**: The "Top Ranking" link must display an active/highlighted state when the user is on the `/top-ranking` route.

### Tab Interface
- **REQ-003**: The screen must present three tabs: **Stars**, **Forks**, and **Trending**.
- **REQ-004**: "Stars" must be the default active tab on initial page load.
- **REQ-005**: Switching tabs must be instant (client-side state change) — no network request or page navigation is triggered by tab switching.
- **REQ-006**: The active tab must be visually distinct from inactive tabs.

### Data & Sorting
- **REQ-007**: The **Stars** tab must rank languages by `starCount` descending.
- **REQ-008**: The **Forks** tab must rank languages by `forkCount` descending.
- **REQ-009**: The **Trending** tab must rank languages by `activityCount` (commits + PRs in the last 30 days) descending.
- **REQ-010**: All data displayed must originate from the same cached `getRankings()` response used by the Leaderboard — no additional GitHub API calls must be made when accessing this page.
- **REQ-011**: Rankings must include all languages that pass the minimum repository threshold (same filter as Leaderboard).

### Table / List Display
- **REQ-012**: Each entry in the ranked list must display: position number, language name, the primary metric value (highlighted), and at least one secondary metric for context.
  - Stars tab: position, name, star count (primary), fork count (secondary).
  - Forks tab: position, name, fork count (primary), star count (secondary).
  - Trending tab: position, name, activity count (primary, labeled "Activity 30d"), star count (secondary).
- **REQ-013**: Metric values must be formatted in human-readable abbreviated form (e.g., "1.2M", "45.3K").
- **REQ-014**: The top 3 positions must be visually distinguished (e.g., medal icons or highlighted styling matching the Leaderboard's `RankBadge` component).
- **REQ-015**: A "last updated" timestamp must be visible on the page.

### Performance
- **REQ-016**: The page must reuse cached ranking data from the in-process memory cache (TTL ≥ 30 minutes); it must **never** trigger a new GitHub API request if data was recently fetched by any other page.
- **REQ-017**: All three tab data sets must be pre-computed server-side before the page is sent to the client, eliminating any client-side data fetching on tab switch.

### Loading & Error States
- **REQ-018**: A skeleton loading state must be displayed while the server renders the page (triggered by `loading.tsx` in the App Router).
- **REQ-019**: If ranking data is unavailable (API error + no cache), the page must display a fallback error state with a meaningful message.

### Accessibility & Responsiveness
- **REQ-020**: Tab controls must be keyboard navigable and labeled with appropriate ARIA roles.
- **REQ-021**: The layout must be responsive: single-column on mobile, multi-column table on tablet and desktop.
- **REQ-022**: Language names must be linked to their respective `/language/[slug]` detail pages.

---

## 5. Acceptance Criteria

- **AC-001**: Given the user is on any page, when they click "Top Ranking" in the header, then they navigate to `/top-ranking` and the Stars tab is active by default.
- **AC-002**: Given the user is on `/top-ranking`, when the Stars tab is active, then languages are ranked by star count descending, with star count displayed as the primary metric.
- **AC-003**: Given the user is on `/top-ranking`, when the Forks tab is active, then languages are ranked by fork count descending, with fork count displayed as the primary metric.
- **AC-004**: Given the user is on `/top-ranking`, when the Trending tab is active, then languages are ranked by activity count (30d) descending, with activity count displayed as the primary metric.
- **AC-005**: Given any tab is active, when the user clicks a different tab, then the table re-renders instantly with new sorted data and no loading spinner appears.
- **AC-006**: Given ranking data was already cached by the Leaderboard page request, when the user navigates to `/top-ranking`, then no new GitHub API call is made.
- **AC-007**: Given the GitHub API rate limit has been hit and fallback data is in use, when the user lands on `/top-ranking`, then the page renders with fallback data and displays the amber stale-data banner (same pattern as Leaderboard).
- **AC-008**: Given the page is loading, when the route is first navigated to, then skeleton placeholders that match the table structure are shown.
- **AC-009**: Given any viewport width (≥ 320px), when the user views any tab, then the content is usable without horizontal overflow on the viewport.
- **AC-010**: Given a keyboard user, when they interact with the tab controls, then they can switch tabs using keyboard navigation (Tab + Enter/Space).
- **AC-011**: Given a screen reader user, when the tabs are rendered, then each tab has an appropriate `aria-selected` state and the tab panel has an `aria-labelledby` reference.
- **AC-012**: Given the user clicks a language name in the ranked list, then they are navigated to `/language/[slug]` for that language.
- **AC-013**: Given the page is rendered, when the user reads the timestamp area, then they can see "last updated X minutes ago" or equivalent freshness indicator.

---

## 6. Test & Validation Criteria

| Test Perspective | Critical Cases |
|-----------------|---------------|
| **Sorting correctness** | Stars tab must return language with the highest `starCount` at position 1; same for Forks and Trending |
| **Cache reuse** | Navigating to `/top-ranking` after `/` must not produce a second GitHub API call (observable via network tab or server logs) |
| **Tab switch performance** | Tab switches must complete in < 50ms (no async work — purely client-side state) |
| **Fallback data** | With `GITHUB_TOKEN` unset, the page renders with fallback data and a stale banner |
| **Accessibility** | axe-core (or equivalent) reports zero critical violations on the tab panel |
| **Responsive** | Layout passes visual review at 320px, 768px, and 1280px widths |
| **Navigation highlight** | Active state on "Top Ranking" nav link is correct when on `/top-ranking` and absent on all other routes |

---

## 7. Out of Scope

- Filtering rankings by time period (7d, 90d, 1y) — future feature.
- Paginating beyond all qualifying languages.
- Animated transitions between tab panels.
- URL-encoded active tab state (tab state is ephemeral client-side on initial load).
- Saving or sharing a specific tab view via URL.
