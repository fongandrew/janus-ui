# Changelog — @janus/utils

All notable changes to the utils pseudo-package.

## Unreleased

- `ADDED` Initial v2 utilities, ported DOM-free from v1 (`src/lib/utility`):
  - Data structures: `lru-cache`, `priority-queue`, and `memoize/*`
    (`memoize-factory`, `memoize-last`, `memoize-lru`, `memoize-one`,
    `memoize-weak`).
  - Pure utilities: `sort-by`, `find-last-index`, `iterators`, `compact`,
    `map-values`, `next-index`, `random`, `step`, `hash`.
  - Strings: `camel-to-kebab`, `normalize-text`, `parse`.
  - Text formatting (`text/*`): `date-time`, `list`, `number`, `plural`,
    `relative-time`, `t-tag`.
  - Async / control flow: `error-code`, `deferred`, `debounce-async`,
    `throttle`, `sync-or-promise`, `circuit-breaker`, `batch`.
  - Types: `type-helpers`.
  - Supporting helpers pulled in as DOM-free dependencies: `logger`
    (needed by `circuit-breaker`) and `datetime/same-date` (needed by
    `text/date-time`).
- `CHANGED` `text/t-tag` drops the DOM-dependent `elmT(element)` helper (it read
  `element.ownerDocument`); a DOM-aware locale lookup belongs in the `dom`/`solid`
  packages. `t`, `getT`, `registerTFunction`, and `clearTFunctions` are unchanged.
- `CHANGED` `text/date-time` resolves its translation tag via the framework-agnostic
  `getT(locale)` (from `t-tag`) instead of the Solid `useT()` hook, keeping the
  module framework-free.
