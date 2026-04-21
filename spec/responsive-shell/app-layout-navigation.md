# Feature: App Layout & Navigation

**Feature ID**: F7.1
**Epic**: [E7 — Responsive Shell](./_epic-e7-responsive-shell.md)
**Priority**: P0 — Critical

---

## 1. Purpose & Scope

Establish the persistent application structure: header with navigation, main content area, and footer. This is the frame into which all features render.

**Intended Audience**: All users

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **All users** | Every user interacts with the navigation to switch between views |

---

## 3. User Stories

- As a **user**, I want a clear navigation structure so that I can easily switch between the leaderboard, comparison tool, and visualizations.
- As a **user**, I want to see the app name and know what the dashboard is about from the header.
- As a **user**, I want to know where I currently am in the app so that I don't feel lost.
- As a **user**, I want to see attribution for the data source so that I can trust the information.

---

## 4. Requirements

- **REQ-001**: The layout must include a persistent header with app name/logo and primary navigation links.
- **REQ-002**: Navigation must include links to: Leaderboard (home), Comparison, Visualizations.
- **REQ-003**: The active navigation item must be visually indicated.
- **REQ-004**: The footer must include: data source attribution ("Powered by GitHub API"), link to scoring methodology, and last-updated timestamp.
- **REQ-005**: On mobile, navigation must collapse into a hamburger menu or bottom tab bar.
- **REQ-006**: Navigation must not obscure content — use a fixed or sticky header that does not take excessive vertical space.
- **ACC-001**: Navigation must be keyboard-accessible (Tab, Enter, Escape for mobile menu).
- **ACC-002**: Use semantic HTML landmarks (`nav`, `main`, `header`, `footer`).

---

## 5. Acceptance Criteria

- **AC-001**: Given any page, when rendered, then the header with app name and navigation is visible.
- **AC-002**: Given the user is on the Leaderboard page, when they view the navigation, then the "Leaderboard" link is visually marked as active.
- **AC-003**: Given a desktop viewport (≥1024px), when the navigation renders, then all links are visible inline in the header.
- **AC-004**: Given a mobile viewport (<640px), when the navigation renders, then links are behind a hamburger menu or bottom tab bar.
- **AC-005**: Given the footer is visible, when the user views it, then "Powered by GitHub API" text and a scoring methodology link are displayed.
- **AC-006**: Given a keyboard user, when they Tab through the page, then all navigation links are focusable and activatable with Enter.

---

## 6. Test & Validation Criteria

- **Layout rendering**: Header, main, footer all present on every page
- **Navigation active state**: Verify active link matches current route
- **Mobile menu**: Open/close behavior on < 640px
- **Keyboard nav**: Tab order, Enter activation, Escape to close mobile menu
- **Semantic HTML**: Verify landmark elements via accessibility audit

---

## 7. Out of Scope

- Search in the header (F5.1 handles search)
- User avatar or settings in the header (no auth)
- Breadcrumb navigation
