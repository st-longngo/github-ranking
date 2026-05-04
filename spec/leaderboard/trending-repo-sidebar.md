# Feature: Trending Repository Sidebar

**Feature ID**: F2.5
**Epic**: [E2 — Leaderboard](./_epic-e2-leaderboard.md)
**Priority**: P0 — Critical

---

## 1. Purpose & Scope

The left sidebar of the redesigned leaderboard page displays a ranked list of GitHub repositories with three filter modes: **Weekly** (highest star growth in the past 7 days), **All-time** (highest cumulative star count), and **Random** (curated random selection for discovery). Selecting a repo from the sidebar loads it into the central Repository Explorer panel.

**Intended Audience**: All user personas — developers, engineering managers, tech educators, and content creators

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer** | Discovers trending repos to use or contribute to |
| **Engineering Manager** | Monitors fast-rising repos relevant to the team's stack |
| **Tech Educator** | Finds newly popular tools to incorporate into curriculum |
| **Content Creator** | Identifies breakout repos for articles and social posts |

---

## 3. User Stories

- As a **developer**, I want to see which GitHub repos gained the most stars this week so that I can discover what the community is excited about right now.
- As a **developer**, I want to switch between weekly, all-time, and random views so that I can explore repos from different perspectives.
- As an **engineering manager**, I want to see the all-time star ranking so that I can identify the most established open-source projects.
- As a **content creator**, I want a "Random" mode so that I can discover niche or unexpected repos I would not have searched for.
- As any **user**, I want to click a repo in the sidebar to instantly load its details in the central panel so that I can explore it further without navigating away.

---

## 4. Requirements

- **REQ-001**: The sidebar must display a **tab bar** at the top with three selectable modes: `Weekly`, `All-time`, `Random`. Only one mode is active at a time.
- **REQ-002 (Weekly)**: In Weekly mode, the sidebar must show repos sorted by **descending weekly star delta** (stars gained in the past 7 days). Delta must be fetched or computed from the GitHub Search/Trending data.
- **REQ-003 (All-time)**: In All-time mode, the sidebar must show repos sorted by **descending total star count**.
- **REQ-004 (Random)**: In Random mode, the sidebar must show a randomly selected set of public GitHub repos. The set must refresh each session (not persist across page loads).
- **REQ-005**: Each list item must display:
  - Rank number (1-based, relative to the current mode's sorted list)
  - Repository owner avatar (circular thumbnail ≤ 24 px)
  - Full repository name in `owner/repo` format
  - Total star count (abbreviated: "1.2M", "45.3K")
  - Weekly star delta with sign prefix: `+6k`, `-12k` (green for positive, red for negative)
- **REQ-006**: The sidebar must display a **maximum of 20 repositories** per mode on initial view.
- **REQ-007**: The currently selected (active) repo must be visually highlighted in the sidebar list.
- **REQ-008**: The top 3 ranked repos (position 1–3) must have a distinct visual indicator (e.g., medal badge or coloured rank number).
- **REQ-009**: The sidebar must support a **loading state** — skeleton placeholders matching the list item structure must appear while data is being fetched.
- **REQ-010**: If the data fetch fails, the sidebar must show an error message with a Retry action.
- **REQ-011**: The sidebar must be **responsive** — on mobile viewports (< 640 px) it collapses into a drawer/bottom-sheet triggered by a toggle button.

---

## 5. Acceptance Criteria

- **AC-001**: Given the leaderboard page loads, when no mode has been previously selected, then the `Weekly` tab is active by default and the weekly-trending repo list is displayed.
- **AC-002**: Given the sidebar is displayed in Weekly mode, when a user views the list, then repos are sorted by weekly star delta (highest first) and each item shows rank, avatar, name, total stars, and delta.
- **AC-003**: Given the sidebar is displayed in All-time mode, when a user views the list, then repos are sorted by total star count (highest first).
- **AC-004**: Given the sidebar is in Random mode, when the page is loaded or the tab is selected, then a new random set of repos appears (different from the previous session's random set).
- **AC-005**: Given the sidebar is visible, when a user clicks on a repo list item, then that repo becomes highlighted in the sidebar and its details load in the central Repository Explorer panel.
- **AC-006**: Given the data fetch is in progress, when the sidebar area renders, then skeleton placeholders matching the list structure are displayed.
- **AC-007**: Given the data fetch fails, when the sidebar renders, then an error message and a "Retry" button are shown.
- **AC-008**: Given a desktop viewport (≥ 1024 px), when the page loads, then the sidebar is permanently visible alongside the central panel.
- **AC-009**: Given a mobile viewport (< 640 px), when the page loads, then the sidebar is hidden by default and accessible via a toggle button.
- **AC-010**: Given the list is rendered, when positions 1, 2, or 3 are displayed, then they show a visually distinct rank indicator (e.g., gold/silver/bronze badge).

---

## 6. Layout & UI Behaviour

```
┌──────────────────────────┐
│  [Weekly] [All-time] [Random]  │  ← Tab bar
├──────────────────────────┤
│  1 🥇 [avatar] owner/repo   │
│       ★ 45.3K   +6k ▲      │
├──────────────────────────┤
│  2 🥈 [avatar] owner/repo   │
│       ★ 38.1K  +3.5k ▲     │
├──────────────────────────┤
│  ...                     │
└──────────────────────────┘
```

- **Width**: Fixed ~280 px on desktop; full-width drawer on mobile
- **Height**: Scrollable within the page height; the tab bar is sticky
- **Star delta colour**: Green (`#22c55e`) for positive, Red (`#ef4444`) for zero or negative
- **Active repo row**: Highlighted background distinct from hover state

---

## 7. Test & Validation Criteria

### Test Perspectives
- **Tab switching**: Verify switching between Weekly / All-time / Random updates the list without full page reload
- **Sort order — Weekly**: Verify first item has the highest weekly delta in the dataset
- **Sort order — All-time**: Verify first item has the highest total star count in the dataset
- **Random mode**: Verify the list differs between two page loads / tab re-selections
- **Item content**: Verify each row displays rank, avatar, name, star count, delta
- **Top-3 indicators**: Verify items at rank 1, 2, 3 have a distinct visual indicator
- **Active selection**: Verify clicking a row highlights it and the centre panel updates
- **Loading skeleton**: Verify skeletons appear before data resolves
- **Error state**: Verify error UI and Retry button render on fetch failure
- **Responsive — desktop**: Verify sidebar is always visible at ≥ 1024 px
- **Responsive — mobile**: Verify sidebar is hidden at < 640 px and opens via toggle

### Edge Cases
- Fewer than 3 repos returned (top-3 indicator only on available items)
- All repos have identical weekly delta (0 growth week)
- Very long repo names (should truncate with ellipsis, not break layout)
- Network offline when switching tabs

---

## 8. Out of Scope

- Infinite scroll beyond 20 items on initial load
- In-sidebar repo search or filtering by language
- Starred-by-user personalisation
- Push notifications for trending spikes
- Sharing or bookmarking a specific sidebar view
