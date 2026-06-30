# Changelog — `utils`

## Unreleased

### Added

- Initial v2 utils layer (PLAN Phase 4): ported the DOM-free subset of v1's
  `src/lib/utility/` — memoization, data structures (`LRUCache`,
  `PriorityQueue`), array/string helpers, hashing, async control flow
  (`Deferred`, `debounceNextAsync`/`debouncePrevAsync`, `throttle`), and the
  locale-aware `text/` formatters (date-time, list, number, plural,
  relative-time, t-tag).
- `text/t-tag.ts` drops v1's DOM-dependent `elmT` helper; `text/date-time.ts`
  drops the Solid `useT()` hook in favor of calling `getT()` directly, keeping
  the package framework-agnostic.
