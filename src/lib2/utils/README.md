# `utils` — Janus v2 framework-agnostic utilities

Pure JS/TS helpers with no DOM types and no framework imports. Anything that
touches `window`/`document`/an element belongs in [`dom/`](../dom/README.md)
instead.

```ts
import { memoizeLast } from '~/lib2/utils/memoize/memoize-last';
```

## Layout

```
memoize/      memoizeFactory and its memoize-last / -lru / -one / -weak variants.
text/         Locale-aware formatting: date-time, list, number, plural,
              relative-time, plus the t-tag placeholder translation tag.
datetime/     Pure date comparisons (sameDate, isToday, isThisYear).
lru-cache.ts, priority-queue.ts   Data structures.
sort-by.ts, find-last-index.ts, iterators.ts, compact.ts   Array helpers.
camel-to-kebab.ts, normalize-text.ts, parse.ts   String/parsing helpers.
hash.ts, error-code.ts   djb2-based hashing and short error codes.
deferred.ts, debounce-async.ts, throttle.ts   Async / control-flow helpers.
type-helpers.ts   Type-only helpers.
```

## Notes

- `text/t-tag.ts` ships only the locale-agnostic registry (`getT`,
  `registerTFunction`, `clearTFunctions`). v1's `elmT(element)` reads
  `element.ownerDocument` and belongs in `dom/` once something there needs it.
- `text/date-time.ts`'s weekday formatter calls `getT(locale ?? DEFAULT_LOCALE)`
  directly rather than the Solid `useT()` hook — `solid/` can still build a
  locale-context wrapper around `getT`, but `utils/` itself stays
  framework-free.

See [the design spec](../../../docs/v2/README.md) for the rationale.
