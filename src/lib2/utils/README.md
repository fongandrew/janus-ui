# `utils` — Janus v2 framework-agnostic utilities

Pure JS/TS helpers with **no DOM types and no framework imports**. Anything that
touches `window` / `document` lives in `dom/`; anything Solid-specific lives in
`solid/`.

```ts
import { memoizeLast } from '~/lib2/utils/memoize/memoize-last';
import { formatDate } from '~/lib2/utils/text/date-time';
```

## Layout

```
memoize/         Memoization factories (one, last, lru, weak).
datetime/        Pure date predicates (same-date, this-year, today).
text/            Locale-aware formatting (date-time, number, list, plural,
                 relative-time) + the `t` translation-tag placeholder.
lru-cache.ts     Bounded LRU map.
priority-queue.ts  Async-drainable priority queue.
deferred.ts      Promise + resolve/reject handle.
debounce-async.ts, throttle.ts  Async-aware rate limiters.
sort-by.ts, find-last-index.ts, iterators.ts, compact.ts, next-index.ts,
map-values.ts    Array / collection helpers.
camel-to-kebab.ts, normalize-text.ts, parse.ts, hash.ts  String helpers.
error-code.ts    Stable hash-based error codes.
type-helpers.ts  Type-only utilities.
```

## Boundaries

`utils` depends on nothing (`janus.json` `depends: []`). The locale used by
`text/*` formatters is passed explicitly as a `locale` argument — the Solid
`LocaleContext` binding lives in `solid/`, not here, so these stay
framework-agnostic.
