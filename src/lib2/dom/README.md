# @janus/dom

The Janus v2 vanilla-JS progressive-enhancement layer. A toolkit of small,
composable behaviors that attach to DOM elements via a single canonical
attribute — `data-js` by default. Depends on `utils`.

## Usage

```html
<div role="tablist" data-js="t-roving-focus c-tabs__select">…</div>
```

```ts
import { mount } from '~/lib2/dom';
import '~/lib2/dom/all'; // Pattern A: register every handler
mount();
```

- `~/lib2/dom` — the public API (`mount`, `setup`, `ca`, `registerBehavior`, the
  form registries). Does **not** side-effect-import handlers.
- `~/lib2/dom/all` — Pattern A catch-all: imports every handler for its side
  effect. For SSR apps use the `vite-plugin-janus-bundle` purge (Pattern B).

## Pieces

- `compose-attrs.ts` — `ca` / `only` / `concat` / `override` (§12.2.1).
- `dispatch.ts` — one document-level capture listener per event type (§12.2.3).
- `mount.ts` — initial scan + MutationObserver + form-engine init.
- `form/` — validation + submit engine (§12.1).
- `handlers/` — one behavior per file; the filename is the behavior name.
- `components/` — thin behavior compositions (§12.3).
