# Janus v2 — `utils/`

Framework-agnostic JS/TS utilities: data structures (LRU cache, priority
queue), memoization, async/control flow (deferred, debounce, throttle),
string and `Intl`-based text formatting helpers, and type helpers.

## Consuming

Copy this directory into your repo and address it via a tsconfig path alias
(this repo uses `~/lib2/utils/*`). There is no build step and no runtime
dependency — `janus.json` declares `depends: []`, so this package can be
forked on its own.

## No DOM dependencies

Nothing in this package touches `window`, `document`, or DOM types. Its
`tsconfig.json` compiles with `"lib": ["ESNext"]` (no `dom`), so any DOM
reference is a type error:

```
npx tsc -p src/lib2/utils/tsconfig.json --noEmit
```

DOM-coupled helpers live in the `dom/` pseudo-package instead.
