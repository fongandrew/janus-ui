# Changelog — utils/

## 2026-07-02

- ADDED: Initial port from v1 `src/lib/utility/` — memoization
  (`memoize/*`, `lru-cache`), `priority-queue`, array/object helpers
  (`sort-by`, `find-last-index`, `iterators`, `compact`), string helpers
  (`camel-to-kebab`, `normalize-text`, `parse`, `hash`), `Intl` text
  formatting (`text/*`, `datetime/same-date`), async/control flow
  (`deferred`, `debounce-async`, `throttle`, `error-code`), and
  `type-helpers`. DOM-dependent pieces were left behind for `dom/`
  (notably `elmT` was dropped from `text/t-tag`).
