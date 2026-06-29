# `dom` — Janus v2 framework-agnostic behavior layer

A toolkit of small, composable behaviors that attach to DOM elements via a single
canonical attribute — `data-js` by default (§12). Components ship as thin
compositions of these behaviors. No framework imports; depends only on `utils`.

```html
<script type="module">
  import '~/lib2/dom/all';       // Pattern A: register every behavior
  import { mount } from '~/lib2/dom';
  mount();                       // scan + MutationObserver
</script>
```

## Core primitives

- **`compose-attrs.ts`** — `ca(...sources)` merges attribute objects with explicit
  conflict semantics; `only` / `concat` / `override` wrappers pin per-attribute
  behavior. `apply(el, attrs)` writes a merged object onto a raw node.
- **`dispatch.ts`** — `registerBehavior(name, manifest)` + one document-level
  capture-phase listener per declared event type.
- **`mount.ts`** — initial DOM scan + `MutationObserver`; fires `mount` hooks.
- **`config.ts`** — `setup({ attr })` overrides the opt-in attribute before `mount()`.

## Form engine (`form/`)

One document-level dispatcher plus two registries. `registerValidator` (named) /
`addValidator` (closure → WeakMap); `registerSubmitHandler` / `addSubmitHandler`;
`setErrors` / `setFormError` / `isDirty`. Forms opt in with `data-js="t-validate
t-submit"`. aria-disabled fields are excluded from FormData and validation.

## Handlers (`handlers/`)

Filename-as-manifest behavior modules. Toolkit (`t-*`): roving-focus, request-close
(`onRequestClose` / `forceClose`), restore-focus, focus-trap, typeahead-filter,
active-descendant, open-tab, kb-nav, empty, scroll-shadow, plus the form behaviors.
Component-internal (`c-*`): `c-tabs__select`, `c-modal__close`, `c-modal__speed-bump`.

## Components (`components/`)

Vanilla-JS producer helpers that compose handlers into the standard recipes
(`tabs`, `modal`, `drawer`, `popover`, `menu`, `styled-select`).

## Bundling

`~/lib2/dom` (the public entry) exports the API and side-effect-imports **no**
handlers. Pull handlers in via `~/lib2/dom/all` (Pattern A) or the SSR-driven
bundle plugin (Pattern B, Phase 7). Behavior names always appear as literal
strings so the text-scan bundler can map them to handler files.
