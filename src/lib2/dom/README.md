# `dom` — Janus v2 framework-agnostic JS behaviors

A toolkit of small, composable behaviors that attach to DOM elements via a
single canonical attribute — `data-js` by default. Components ship as thin
compositions of these behaviors (`components/`); consumers can use the same
toolkit directly to build custom controls without leaving the Janus model.

```ts
import { mount } from '~/lib2/dom';
import '~/lib2/dom/all'; // Pattern A: pulls in every handler module

mount();
```

## Layout

```
config.ts            setup() / JS_ATTR -- the configurable data-js attribute name.
compose-attrs.ts      ca / only / concat / override / CombineAttrs -- attribute merging.
dispatch.ts           registerBehavior + the document-level capture-phase dispatcher.
mount.ts               mount() -- initial DOM scan + MutationObserver wiring.
multi-view.ts          parentWindow/parentDocument/elmDoc/elmWin/evtDoc/evtWin.
document-setup.ts      registerDocumentSetup/registerDocument -- per-document listener
                        installation (so a child/popup window gets the same wiring).
index.ts               Public API. Does NOT side-effect-import any handlers.
all.ts                 Pattern A entry: side-effect-imports every handler module.

form/                 The form engine (§12.1) -- its own document-level
                       change/input/submit listeners, not the general dispatcher.
  validate.ts            registerValidator/addValidator, touched-state machine,
                          group validation, error-destination writes, isDirty.
  submit.ts               registerSubmitHandler/addSubmitHandler, disabled-state
                          FormData filtering, submit choreography, setErrors/setFormError.

handlers/              One behavior per file; filename is the behavior name
                       (the convention the SSR purge step keys off of, §12.4).
components/             Thin producer-only compositions of the handlers above,
                       matching §12.3's table (c-tabs, c-modal, c-drawer,
                       c-popover, c-menu, c-styled-select).
```

## The `data-js` model

A behavior is a module under `handlers/`. It registers a manifest (which DOM
events it handles, plus an optional `mount` hook) and exports producer
functions returning `ca`-friendly prop objects:

```html
<div role="toolbar" data-js="t-roving-focus" aria-orientation="horizontal">
  <button class="c-button">Cut</button>
  <button class="c-button">Copy</button>
</div>
```

```tsx
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { ca } from '~/lib2/dom/compose-attrs';

<div {...ca(rovingFocus({ axis: 'horizontal' }), { role: 'toolbar' })}>...</div>;
```

Exactly one document-level capture-phase listener is installed per event type
some registered behavior declares — not one per element. The dispatcher walks
from the event target upward, reading one `data-js` attribute per ancestor.

Two behaviors don't fit that ancestor-walk shape and keep their own
document-level listeners instead: the form engine (`form/validate.ts`,
`form/submit.ts` — the lifecycle is form → members → validators, not
per-event-per-ancestor) and `t-reset-on-close` (the token sits on a
*descendant* form of the closing `<dialog>`, not an ancestor of the `close`
event's target).

See [the design spec](../../../docs/v2/06-dom-layer.md) for the full rationale.
