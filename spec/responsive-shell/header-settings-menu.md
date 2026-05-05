# Feature: Header Settings Menu

**Feature ID**: F7.5
**Epic**: [E7 — Responsive Shell](./_epic-e7-responsive-shell.md)
**Priority**: P1 — High
**Status**: Draft
**Date**: 2026-05-05

---

## 1. Purpose & Scope

Extend the persistent header with a settings icon button on the right side. Clicking it reveals a dropdown menu with two options: personal GitHub Access Token management and a "How to use this site" guide. This allows power users to unlock live data (by providing a GitHub token) and helps all new users understand the product without needing to leave the page.

**Intended Audience**: All users, with emphasis on:
- Developers who want live data and need to bypass GitHub API rate limits
- New visitors who are unfamiliar with the site's features

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer (primary)** | Wants to add a GitHub token to get live, unthrottled data instead of cached or fallback data |
| **Engineering Manager** | Wants guidance on how to interpret rankings and navigate the dashboard |
| **New Visitor** | Needs a quick orientation to understand what the site does and how to use it |

---

## 3. User Stories

### S-001 — Settings Icon Entry Point
**As a** user,
**I want** to see a settings icon at the right end of the header,
**so that** I can access configuration options and help without disrupting my current view.

### S-002 — Settings Dropdown Menu
**As a** user,
**I want** a dropdown menu to appear when I click the settings icon,
**so that** I can choose between available settings actions without navigating away.

### S-003 — Access Token Storage
**As a** developer,
**I want** to enter my GitHub Personal Access Token (PAT) in a modal dialog,
**so that** the site can use my token to call the GitHub API and provide live, rate-limit-free data.

### S-004 — Token Persistence
**As a** developer,
**I want** my access token to be saved in my browser's local storage,
**so that** I don't have to re-enter it every time I visit the site.

### S-005 — Token Pre-fill
**As a** developer,
**I want** the token input to be pre-filled with my existing saved token (if one is stored),
**so that** I can review, update, or clear it without guessing what I previously entered.

### S-006 — Token Removal
**As a** developer,
**I want** to be able to clear my stored access token,
**so that** I can revoke the site's use of my credentials at any time.

### S-007 — How to Use Guide
**As a** new visitor,
**I want** to access a "How to use this site" guide from the header,
**so that** I can quickly learn what the site does, how rankings are calculated, and what features are available.

### S-008 — Keyboard & Accessibility
**As a** keyboard or screen reader user,
**I want** the settings dropdown and modals to be fully accessible,
**so that** I can use all functionality without a mouse.

---

## 4. Functional Requirements

| ID | Requirement |
|----|-------------|
| **REQ-001** | A settings icon button (gear/cog icon) must appear at the right end of the header on all viewports. |
| **REQ-002** | Clicking the settings icon must open a dropdown menu anchored below the icon. |
| **REQ-003** | The dropdown must contain exactly two items: "Add Access Token" and "How to use this site". |
| **REQ-004** | Clicking outside the dropdown or pressing Escape must close it. |
| **REQ-005** | Selecting "Add Access Token" must open a modal dialog with a text input for the GitHub PAT. |
| **REQ-006** | The modal must include: a title ("Add GitHub Access Token"), explanatory body text describing why a token is needed, a labelled password/text input, a "Save" button, and a close/dismiss control. |
| **REQ-007** | The explanatory text must reference the GitHub API rate limit and explain that no account data scopes are required. |
| **REQ-008** | On "Save", the token value must be written to `localStorage` under a defined key (e.g. `gh_access_token`). |
| **REQ-009** | On modal open, if a token already exists in `localStorage`, the input must be pre-filled with the masked or full token value. |
| **REQ-010** | The modal must provide a way to clear the stored token (e.g. a "Clear" or "Remove" secondary action). |
| **REQ-011** | Selecting "How to use this site" must navigate the user to a dedicated `/how-to-use` page or open an inline guide panel. |
| **REQ-012** | The "How to use" destination must cover: what the site does, how the composite score is calculated, how to navigate between views, and how to add a GitHub token. |
| **REQ-013** | The settings icon must have a visual indicator (e.g. a coloured dot or filled icon state) when a token is currently stored in `localStorage`. |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| **CON-001** | The token must never be transmitted to any server other than `api.github.com`. It is used exclusively client-side as a request header. |
| **CON-002** | The token field must be rendered as a `password`-type input to prevent casual shoulder-surfing, with an optional show/hide toggle. |
| **CON-003** | The settings dropdown must appear above other page content (high `z-index`) and must not cause layout shift. |
| **CON-004** | All interactions (open dropdown, open modal, save, close) must complete within 100 ms perceived response time (purely client-side operations). |
| **GUD-001** | Placeholder text in the token input must say "ghp_xxxxxxxxxxxxxxxxxxxx" to signal the expected format. |
| **GUD-002** | After saving, the modal must display a brief success confirmation ("Token saved") before closing. |
| **GUD-003** | Clearing the token must require a confirmation step or a dedicated "Remove token" button — not the same "Save" action — to prevent accidental deletion. |

---

## 6. Security Requirements

| ID | Requirement |
|----|-------------|
| **SEC-001** | The token must only be read from `localStorage` client-side; it must never be included in server-side requests or API route handlers. |
| **SEC-002** | The token input must not be auto-completed by the browser (use `autocomplete="off"` or `autocomplete="new-password"`). |
| **SEC-003** | No analytics, logging, or error-tracking system must capture the raw token value. |
| **SEC-004** | The site must not embed the token in any URL, query parameter, or hash fragment. |
| **SEC-005** | The explanatory text must clearly state "no personal data scopes are needed" to guide users toward creating a minimal-permission token. |

---

## 7. Acceptance Criteria

### AC-001 — Settings Icon Visible
**Given** any page of the site,
**When** the header renders,
**Then** a settings icon button is visible at the right end of the header on all viewports.

### AC-002 — Dropdown Opens on Click
**Given** the user views any page,
**When** they click the settings icon,
**Then** a dropdown menu appears below the icon containing "Add Access Token" and "How to use this site".

### AC-003 — Dropdown Closes on Outside Click
**Given** the settings dropdown is open,
**When** the user clicks anywhere outside the dropdown,
**Then** the dropdown closes without any action being taken.

### AC-004 — Dropdown Closes on Escape
**Given** the settings dropdown is open,
**When** the user presses the Escape key,
**Then** the dropdown closes and focus returns to the settings icon.

### AC-005 — Access Token Modal Opens
**Given** the settings dropdown is open,
**When** the user clicks "Add Access Token",
**Then** a modal dialog opens with a title, explanatory text, a token input field, a "Save" button, and a dismiss control.

### AC-006 — Save Token to localStorage
**Given** the Access Token modal is open and the user has entered a non-empty string,
**When** the user clicks "Save",
**Then** the value is written to `localStorage["gh_access_token"]`, a success message is shown briefly, and the modal closes.

### AC-007 — Pre-fill Existing Token
**Given** a token exists in `localStorage["gh_access_token"]`,
**When** the user opens the Access Token modal,
**Then** the input is pre-filled with the stored token value.

### AC-008 — Clear Token
**Given** a token exists in `localStorage["gh_access_token"]`,
**When** the user clicks the "Remove token" action in the modal,
**Then** the token is deleted from `localStorage`, the input is cleared, and feedback confirms removal.

### AC-009 — Token Indicator on Icon
**Given** a token is stored in `localStorage["gh_access_token"]`,
**When** the header renders,
**Then** the settings icon shows a visual indicator (e.g. a green dot) to signal an active token.

### AC-010 — How to Use Navigation
**Given** the settings dropdown is open,
**When** the user clicks "How to use this site",
**Then** they are navigated to the `/how-to-use` page (or a guide panel opens), and the dropdown closes.

### AC-011 — How to Use Content
**Given** the user is on the How to Use page/panel,
**When** they view it,
**Then** it explains: the site purpose, the composite score formula, how to navigate Explore and Top Ranking views, and how to add a GitHub token.

### AC-012 — Keyboard Accessibility
**Given** a keyboard-only user,
**When** they Tab to the settings icon and press Enter,
**Then** the dropdown opens; arrow keys navigate the options; Enter activates the focused option; Escape closes the dropdown.

### AC-013 — Screen Reader Accessibility
**Given** a screen reader user,
**When** the dropdown opens,
**Then** the menu role and item labels are announced correctly and focus is managed appropriately.

---

## 8. Edge Cases

| Scenario | Expected Behaviour |
|----------|--------------------|
| User saves an empty token string | "Save" button is disabled or shows inline validation: "Token cannot be empty". |
| Token in `localStorage` is malformed or trimmed whitespace only | Treated as absent; input is empty; no indicator dot shown. |
| User pastes a token with leading/trailing spaces | The value is trimmed before saving. |
| `localStorage` is not available (private browsing, quota exceeded) | A descriptive inline error is shown: "Unable to save — your browser may be blocking local storage." No crash. |
| User resizes from desktop to mobile while dropdown is open | Dropdown closes gracefully; no visual overflow. |
| Multiple rapid clicks on settings icon | Dropdown toggles correctly; no duplicate renders or z-index stacking. |

---

## 9. Out of Scope

- Server-side token storage or user accounts
- OAuth flow or GitHub App authorization
- Token validation against the GitHub API at save time (no live check)
- Token expiry detection or refresh
- Multiple token management (only one token at a time)
- Theming or language preference settings in this menu (separate feature)
- Notification or alert preferences
- Any "Settings" page that persists beyond `localStorage`
