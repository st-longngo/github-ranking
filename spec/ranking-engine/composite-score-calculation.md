# Feature: Composite Score Calculation

**Feature ID**: F1.2
**Epic**: [E1 — Ranking Engine](./_epic-e1-ranking-engine.md)
**Priority**: P0 — Critical

---

## 1. Purpose & Scope

Compute a single, weighted composite score for each programming language by combining normalized values across all metric dimensions (repositories, stars, forks, activity). This score serves as the default "headline" ranking visible on the leaderboard.

**Intended Audience**: Ranking Engine → Leaderboard UI

**Assumptions**:
- Raw metric data has been fetched and is available (F1.1 dependency)
- Metrics vary widely in magnitude (e.g., stars in millions vs. forks in thousands) — normalization is required
- Default weights are fixed at launch; user-configurable weights are out of scope

---

## 2. User Personas

| Persona | Relevance |
|---------|-----------|
| **Developer** | Sees the composite score as the primary ranking metric; needs to understand what it means |
| **Engineering Manager** | Uses the composite score to quickly identify top languages without analyzing each metric individually |

---

## 3. User Stories

- As a **developer**, I want to see a single composite score for each language so that I can quickly understand its overall GitHub presence without analyzing four separate metrics.
- As a **developer**, I want to understand how the composite score is calculated so that I can judge whether the ranking methodology aligns with my own priorities.
- As an **engineering manager**, I want the composite score to reflect both popularity (stars, repos) and momentum (activity, forks) so that the ranking is balanced and not skewed by a single metric.

---

## 4. Requirements

- **REQ-001**: The system must normalize each metric (repos, stars, forks, activity) to a 0-100 scale before applying weights (BR-001).
- **REQ-002**: The system must apply the default weights: Repositories 25%, Stars 30%, Forks 20%, Activity 25% (BR-002).
- **REQ-003**: The composite score must be a number between 0 and 100.
- **REQ-004**: The weight distribution must be visible to users on the dashboard.
- **REQ-005**: Given identical input data, the composite score must produce identical results on every computation (determinism).
- **REQ-006**: Rankings must be generated in descending order of composite score, with ties broken by star count.
- **CON-001**: Languages excluded by the minimum threshold (BR-003) must not receive a composite score.
- **GUD-001**: Normalization should use min-max scaling relative to the current dataset (not a fixed reference).

---

## 5. Acceptance Criteria

- **AC-001**: Given metric data for 50 languages, when the composite score is computed, then each language receives a score between 0 and 100 (inclusive).
- **AC-002**: Given the same input data is processed twice, when scores are compared, then they are identical (determinism).
- **AC-003**: Given a language has the highest value in all four metrics, when scored, then its composite score is 100.
- **AC-004**: Given a language has the lowest value in all four metrics (among qualifying languages), when scored, then its composite score is 0.
- **AC-005**: Given two languages have identical composite scores, when ranked, then they are ordered by star count (descending).
- **AC-006**: The dashboard displays the weight distribution (e.g., "Stars: 30%, Repos: 25%, Activity: 25%, Forks: 20%") in an accessible location.
- **AC-007**: Given a language is excluded by the minimum repo threshold (BR-003), when scores are computed, then it does not appear in the ranked list.

---

## 6. Test & Validation Criteria

### Test Perspectives
- **Normalization accuracy**: Verify 0-100 scaling with known min/max values
- **Weight application**: Verify weighted sum matches expected formula output
- **Determinism**: Run scoring twice on identical data; assert identical output
- **Tie-breaking**: Create two languages with identical composite scores, different star counts; verify ordering
- **Edge: single language**: Only one language qualifies — verify it receives score 100
- **Edge: all languages equal**: All metrics identical — verify all receive the same score
- **Excluded languages**: Verify below-threshold languages are absent from results

### Edge Cases
- A language has 0 for one metric but high values for others
- Only 2 languages qualify (minimal dataset)
- Metric values are extremely skewed (one language dominates all others)

---

## 7. Out of Scope

- User-configurable weights
- Multiple scoring algorithms or presets
- Confidence intervals or statistical significance indicators
- Weighting based on language age or maturity
