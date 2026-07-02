# @janus/utils

Framework-agnostic JS/TS utilities. No DOM types. Standalone (`depends: []`).

These are pure, runtime-agnostic helpers: data structures, memoizers, pure
functions, string helpers, `Intl`-based text formatting, and async/control-flow
utilities. They do not touch `window`, `document`, or any DOM API and carry no
framework (Solid) coupling, so they are safe to use in the browser, on the
server, in workers, or in tests. DOM-dependent helpers live in the `dom/`
pseudo-package instead.

## Usage

Import from the package barrel:

```ts
import { LRUCache, debounceNextAsync, formatRelativeTime } from '~/lib2/utils';
```

Or import a specific module directly (better for tree-shaking):

```ts
import { memoizeLast } from '~/lib2/utils/memoize/memoize-last';
import { formatDate } from '~/lib2/utils/text/date-time';
```

## Contents

- **Data structures**: `lru-cache`, `priority-queue`, `memoize/*`.
- **Pure utilities**: `sort-by`, `find-last-index`, `iterators`, `compact`,
  `map-values`, `next-index`, `random`, `step`, `hash`.
- **Strings**: `camel-to-kebab`, `normalize-text`, `parse`.
- **Text formatting** (`text/*`): `Intl`-backed date-time, list, number,
  plural, relative-time, and a placeholder translation tag (`t-tag`).
- **Async / control flow**: `deferred`, `debounce-async`, `throttle`,
  `sync-or-promise`, `circuit-breaker`, `batch`, `error-code`.
- **Misc**: `datetime/same-date`, `logger`, `type-helpers`.
