# Feature: GitHub Data Fetching

**Feature ID**: F1.1
**Epic**: [E1 — Ranking Engine](./_epic-e1-ranking-engine.md)
**Priority**: P0 — Critical

---

## 1. Purpose & Scope

Retrieve real-time, language-level metrics from GitHub's public APIs to serve as the raw input for all ranking computations. This feature is the sole data acquisition path — all downstream features depend on it.

**Intended Audience**: Ranking Engine (internal consumer)

**Assumptions**:
- GitHub API language classification is the canonical source of truth
- A GitHub Personal Access Token (PAT) is available for authenticated requests (5,000 requests/hour)
- GitHub exposes sufficient data to derive repos, stars, forks, and activity per language

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **End User (indirect)** | Does not interact with data fetching directly, but all dashboard content depends on it |
| **System (Scheduler)** | The primary actor — triggers and executes fetch operations |

---

## 3. User Stories

- As the **ranking engine**, I want to fetch the total number of public repositories per programming language so that I can rank languages by repository count.
- As the **ranking engine**, I want to fetch the aggregate star count per language so that I can rank languages by community endorsement.
- As the **ranking engine**, I want to fetch the aggregate fork count per language so that I can rank languages by reuse and collaboration.
- As the **ranking engine**, I want to fetch recent commit and pull request counts per language so that I can rank languages by development activity.
- As the **ranking engine**, I want to cache fetched data so that I can serve rankings without hitting GitHub's rate limits on every request.
- As the **ranking engine**, I want to handle API failures gracefully so that the dashboard remains available even when GitHub is unreachable.

---

## 4. Requirements

- **REQ-001**: The system must fetch repository count per language from GitHub.
- **REQ-002**: The system must fetch aggregate star count per language.
- **REQ-003**: The system must fetch aggregate fork count per language.
- **REQ-004**: The system must fetch activity metrics (commits + merged PRs) per language.
- **REQ-005**: The system must cache fetched data with a configurable TTL.
- **REQ-006**: The system must serve cached data when the cache is valid, avoiding redundant API calls.
- **REQ-007**: The system must exclude languages with fewer than 100 public repositories (BR-003).
- **SEC-001**: GitHub API tokens must never be exposed to the client browser.
- **CON-001**: Must stay within GitHub API rate limits (5,000 authenticated requests/hour).
- **CON-002**: Data fetching must complete within 30 seconds; if exceeded, timeout and use cached data.
- **GUD-001**: Prefer GitHub GraphQL API for bulk queries to minimize request count.
- **GUD-002**: Parallelize independent API requests to reduce total fetch time.

---

## 5. Acceptance Criteria

- **AC-001**: Given the system has no cached data, when a user loads the dashboard, then the system fetches fresh data from GitHub APIs and returns metrics for all qualifying languages within 30 seconds.
- **AC-002**: Given cached data exists and is within TTL, when a user loads the dashboard, then the system serves cached data without making GitHub API calls.
- **AC-003**: Given cached data exists but has expired, when a user loads the dashboard, then the system fetches fresh data from GitHub and updates the cache.
- **AC-004**: Given the GitHub API returns a rate limit error (HTTP 403), when a fetch is attempted, then the system serves the most recent cached data and displays a "last updated" timestamp to the user.
- **AC-005**: Given the GitHub API is completely unreachable, when a fetch is attempted, then the system serves cached data if available, or displays an error state with a retry action.
- **AC-006**: Given multiple users trigger a dashboard load simultaneously during a cache miss, then only one fetch operation executes and all callers receive the same result.
- **AC-007**: The system returns data for at least 30 programming languages (given GitHub's current landscape).
- **AC-008**: Each language's data includes: name, repository count, star count, fork count, and activity score.

---

## 6. Test & Validation Criteria

### Test Perspectives
- **Happy path**: Fresh fetch with valid API responses for all metrics
- **Cache hit**: Verify no API calls when cache is valid
- **Cache miss**: Verify fetch triggers and cache updates on expiry
- **Rate limit**: Simulate 403 response and verify fallback to cached data
- **API timeout**: Simulate slow response (>30s) and verify timeout behavior
- **Partial failure**: One API call fails while others succeed — verify partial data handling
- **Concurrent requests**: Multiple simultaneous requests deduplicated to single fetch
- **Empty response**: GitHub returns no results for a query — verify graceful handling
- **Token security**: Verify API token is never included in client-visible responses or logs

### Edge Cases
- GitHub changes language classification (e.g., renames a language)
- A language crosses the 100-repo threshold during a fetch cycle
- API response format changes unexpectedly
- Network interruption mid-fetch

---

## 7. Out of Scope

- Fetching data for individual repositories (only aggregate language-level metrics)
- Real-time streaming / WebSocket connections to GitHub
- User-configurable fetch intervals
- Fetching from sources other than GitHub (Stack Overflow, npm, etc.)
- Storing historical snapshots for trend analysis
