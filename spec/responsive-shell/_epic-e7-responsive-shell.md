# Epic: Responsive Shell

**Epic ID**: E7
**Priority**: P0 — Critical
**Description**: The application's structural foundation — layout, navigation, dark mode, responsive design, and loading/error state patterns. Every feature renders inside this shell.

---

## Scope

### In Scope
- Persistent header with app name/logo and navigation
- Main content area
- Responsive layout adapting to mobile, tablet, and desktop
- System-preference-based dark mode
- Global loading and error state patterns
- Footer with data attribution and score methodology link

### Out of Scope
- Sidebar navigation (desktop uses inline navigation)
- User settings or preferences panel
- Internationalization / localization
- PWA capabilities (offline mode, install prompt)

---

## Features

| Feature | Priority | Description |
|---------|----------|-------------|
| F7.1 App Layout & Navigation | P0 | Header, content area, navigation structure |
| F7.2 Dark Mode | P1 | System-preference dark mode with proper theming |
| F7.3 Mobile Responsiveness | P0 | Full functionality on all device sizes |
| F7.4 Loading & Error States | P0 | Skeleton loaders, error messages, retry actions |

---

## Linkages

- **Depends on**: None (structural foundation)
- **Required by**: All other epics (E1-E6) — all features render within this shell
