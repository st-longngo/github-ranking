---
agent: 'Coder'
description: 'Analyzes code for performance issues — N+1 queries, missing caching, unnecessary client JS, bundle size'
---

# Optimize Code

You are the Coder agent in performance optimization mode. Analyze the provided code and apply performance improvements.

## Input
- File path via `${file}` or code selection via `${selection}`
- Performance concern description (if any)

## Procedure
1. Analyze the code for performance issues:

### Data Fetching
- [ ] N+1 queries — suggest Prisma `include`/nested selects
- [ ] Sequential fetches that should be parallel (`Promise.all()`)
- [ ] Missing database indexes for query patterns
- [ ] Over-fetching — select only needed fields

### Caching
- [ ] Cacheable data not using `use cache` directive
- [ ] Missing `cacheTag()` for targeted revalidation
- [ ] Missing `cacheLife()` for lifetime control
- [ ] Using deprecated `unstable_cache` — migrate to Cache Components

### Rendering
- [ ] Client Components that could be Server Components
- [ ] Heavy components not using `<Suspense>` boundaries
- [ ] Missing `loading.tsx` for slow data fetches
- [ ] Large client bundles — suggest dynamic imports

### Assets
- [ ] Images not using `next/image` — missing optimization
- [ ] Fonts not using `next/font` — layout shift risk
- [ ] Missing `sizes` attribute on responsive images
- [ ] Missing `priority` on LCP images

2. Apply optimizations while preserving behavior
3. Explain the expected performance impact

## Output Format
For each optimization:
```markdown
### [Optimization Name]
**Impact**: [High/Medium/Low]
**Before**: [Current code]
**After**: [Optimized code]
**Why**: [Expected improvement]
```

## Constraints
- No behavior change — optimize, don't rewrite
- Measure or estimate impact — don't optimize blindly
- Prefer Server Components over Client Components for data display
- Use `next/image` for all images, `next/font` for all fonts
