# Feature: Ranked Language Table

**Feature ID**: F2.1
**Epic**: [E2 — Leaderboard](./_epic-e2-leaderboard.md)
**Priority**: P0 — Critical

---

## 1. Purpose & Scope

Display a ranked table of programming languages as the primary dashboard view. This is the first thing users see — the core value proposition of the product. The table must show each language's rank position, name, composite score, and individual metrics (repos, stars, forks, activity).

**Intended Audience**: All user personas

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer** | Scans the table to find languages of interest, checks relative positions |
| **Engineering Manager** | Reviews top languages to validate technology choices |
| **Educator** | Identifies top-trending languages for curriculum planning |

---

## 3. User Stories

- As a **developer**, I want to see a clear, ranked list of programming languages with their scores so that I can quickly understand the current landscape.
- As a **developer**, I want to see individual metric values (repos, stars, forks, activity) alongside the composite score so that I can judge rankings with nuance.
- As a **developer**, I want the top-ranked languages to be visually distinct so that I can immediately identify leaders.
- As an **engineering manager**, I want to re-sort the table by different metrics so that I can explore rankings from multiple perspectives.
- As an **educator**, I want to see the "last updated" timestamp so that I know how fresh the data is.

---

## 4. Requirements

- **REQ-001**: The table must display: rank position, language name, composite score, repository count, star count, fork count, activity score.
- **REQ-002**: The table must be sorted by composite score (descending) by default.
- **REQ-003**: The table must display at least the top 20 languages on initial load.
- **REQ-004**: Each metric value must be human-readable (e.g., "1.2M" instead of "1,234,567" for large numbers).
- **REQ-005**: The "last updated" timestamp must be visible near the table header.
- **REQ-006**: The table must be responsive — adapting layout for mobile, tablet, and desktop viewports.
- **REQ-007**: Loading state must show skeleton placeholders matching the table structure.
- **REQ-008**: If no data is available, display an empty state with an explanation and retry action.
- **ACC-001**: The table must use semantic markup for screen readers.
- **ACC-002**: Column headers must be labeled for assistive technology.

---

## 5. Acceptance Criteria

- **AC-001**: Given ranking data is available, when the user loads the dashboard, then a table is displayed with all qualifying languages ranked by composite score (descending).
- **AC-002**: Given the table is displayed, when the user views a row, then they see: rank number, language name, composite score, repos, stars, forks, and activity.
- **AC-003**: Given large metric values, when displayed in the table, then they use abbreviated formats (e.g., "1.2M", "45.3K").
- **AC-004**: Given the system is fetching data, when the table area is rendered, then skeleton loading placeholders are displayed matching the table's column structure.
- **AC-005**: Given no data is available and the fetch has failed, when the table area is rendered, then an error message with a "Retry" button is displayed.
- **AC-006**: Given the table is displayed on a mobile device (viewport < 640px), when the user views it, then the layout adapts to remain usable (horizontal scroll or card layout).
- **AC-007**: Given a screen reader is active, when the table is rendered, then all column headers and cells are properly labeled and navigable.
- **AC-008**: The "last updated" timestamp is visible and formatted in the user's locale.

---

## 6. Test & Validation Criteria

### Test Perspectives
- **Table rendering**: Verify all columns render with correct data
- **Default sort**: Verify composite score descending on initial load
- **Number formatting**: Verify abbreviation at correct thresholds (1K, 1M, 1B)
- **Loading state**: Verify skeleton renders before data is available
- **Error state**: Verify error UI renders on fetch failure
- **Mobile responsiveness**: Verify layout at 320px, 640px, 768px, 1024px
- **Accessibility**: Verify table semantics with screen reader testing
- **Empty data**: Verify graceful handling when 0 languages qualify

### Edge Cases
- Only 1 language qualifies (single-row table)
- All languages have identical composite scores
- Metric values at extreme ranges (0 and billions)
- Very long language names (e.g., hypothetical edge case)

---

## 7. Out of Scope

- Inline row expansion for detail view (F3.1 handles detail)
- Row selection for comparison (F4.1 handles selection)
- Column visibility customization
- Data export from the table
