# Changelog — `utils`

All notable changes to the `utils` pseudo-package are documented here.

## [Unreleased]

### ADDED

- Initial framework-agnostic utility port from v1's `src/lib/utility/` (Phase 4).
  Pure data structures (`lru-cache`, `priority-queue`, `memoize/*`), control-flow
  helpers (`deferred`, `debounce-async`, `throttle`), string utilities
  (`camel-to-kebab`, `normalize-text`, `parse`, `hash`), array/iterator helpers
  (`sort-by`, `find-last-index`, `iterators`, `compact`, `next-index`,
  `map-values`), error codes, type helpers, date helpers (`datetime/same-date`),
  and locale-aware text formatting (`text/*`). No DOM types, no framework imports.
