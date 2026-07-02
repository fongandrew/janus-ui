# Janus v2 — `dom/`

The framework-agnostic JS behavior layer (design spec §12). Small, composable
behaviors attach to DOM elements via a single canonical attribute
(`data-js`, configurable via `setup()`). One document-level capture-phase
listener per event type dispatches to behaviors by reading one attribute per
ancestor — no per-element wiring, no runtime IDs.

## Usage

```html
<form data-js="t-validate t-submit" data-submit-handler="signup">…</form>
<div role="toolbar" data-js="t-roving-focus" aria-orientation="horizontal">…</div>
```

```ts
import '~/lib2/dom/all';       // Pattern A: every handler (static sites, demos)
import { mount } from '~/lib2/dom';
mount();                        // initial scan + MutationObserver
```

For SSR apps, `plugins/vite-plugin-janus-bundle.ts` (Pattern B) generates a
client entry importing only the handlers referenced in the SSR output.

- `compose-attrs.ts` — `ca` attribute merging with explicit conflict semantics
- `dispatch.ts` — `registerBehavior` + the document-level dispatcher
- `mount.ts` — initial DOM scan + MutationObserver
- `form/` — the validation + submit engine (§12.1)
- `handlers/` — behavior modules; the FILENAME IS THE BEHAVIOR NAME
- `components/` — thin producer compositions (tabs, modal, menu, …)

Depends on `utils/`. Never imports from `solid/`.
