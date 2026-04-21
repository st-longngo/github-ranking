# Feature: Language Comparison Tool

**Feature ID**: F4.1, F4.2, F4.3
**Epic**: E4 — Comparison Tool
**Priority**: P2 — Medium

---

## 1. Purpose & Scope

Allow users to select 2-4 programming languages and compare them side-by-side across all metric dimensions, including a radar chart visualization. This is a power-user feature for developers and managers evaluating technology choices.

---

## 2. User Stories

- As a **developer**, I want to select two or more languages for comparison so that I can see their metrics side by side.
- As a **developer**, I want a radar chart showing compared languages so that I can visually grasp their relative "shapes" across metrics.
- As an **engineering manager**, I want to compare my team's primary language against alternatives so that I can justify technology decisions with data.

---

## 3. Requirements

- **REQ-001**: Users must be able to select 2-4 languages for comparison.
- **REQ-002**: The comparison view must display all metric dimensions in a table or card layout.
- **REQ-003**: A radar/spider chart must visualize all compared languages on the same axes.
- **REQ-004**: Each language must have a distinct color in the chart.
- **REQ-005**: Users must be able to add/remove languages from the comparison.
- **REQ-006**: The comparison selection must persist during navigation (session state).
- **CON-001**: Maximum 4 languages to keep the chart readable.

---

## 4. Acceptance Criteria

- **AC-001**: Given the user has selected Python and JavaScript, when they view the comparison, then both languages' metrics are displayed side by side.
- **AC-002**: Given 3 languages are selected, when the radar chart renders, then each language is a distinct colored polygon on the chart.
- **AC-003**: Given 4 languages are already selected, when the user tries to add a 5th, then the system prevents addition with a clear message.
- **AC-004**: Given the user removes a language from comparison, when only 1 remains, then the comparison view shows a prompt to add at least one more.

---

## 5. Out of Scope

- Shareable comparison URLs
- Comparison history or saved comparisons
- More than 4 languages in a single comparison
