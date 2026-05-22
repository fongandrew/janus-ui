# Janus v2 — Components and Tools

Part 5 of the [Janus v2 build plan](./README.md). Covers the `c-` component classes and the narrow `t-` tools layer.

## 10. Components

### 10.1 Pure CSS (zero JS)

| Class | Element | Notes |
|---|---|---|
| `c-button` | `<button class="o-input-box">`, `<a class="o-input-box">` | Hover state, outer shadow (`--v-shadow-outer`), tone via `v-colors-*`. Layers chrome on `o-input-box`; sizing/padding/radius come from the object. `c-button--icon` opts into square mode. Consumer-defined scopes (e.g. `.v-cta`) tweak height/radius for specific roles. |
| `c-card` | `<article>`, `<section>` (with `o-box` or `o-text-box`) | Surface chrome only (`--v-shadow-outer`, border, bg). Pair with `o-box` (children are components) or `o-text-box` (children are prose). Reads `--o-box__radius`. |
| `c-alert` | `<div role="alert">` | Internally text-mode. Tone via `v-colors-*`. |
| `c-input` | `<input class="o-input-box">`, `<textarea class="o-input-box">` | Inner shadow (`--v-shadow-inner`), focus ring, invalid-state chrome. Sizing/padding/radius come from `o-input-box`. |
| `c-checkbox`, `c-radio` | `<input type=...>` | Custom-styled but uses native input. |
| `c-toggle` | `<input type="checkbox" role="switch">` | Pure CSS via `:checked`. Track height derived from `--v-input-height`. |
| `c-select-native` | `<select>` | Styled chrome around native select. Height = `--v-input-height`. Default for almost all dropdowns. |
| `c-tag` | `<span>` | Internally text-mode. Interactive / removable label. |
| `c-badge` | `<span>` | Text-mode for count badges, square-mode for dot indicators. Static. |
| `c-avatar` | `<img>`, `<span>` | Square-mode. |
| `c-spinner` | `<span>` | Square-mode. CSS animation. |
| `c-skeleton` | `<div>` | CSS animation. |
| `c-disclosure` | `<details><summary>` | Native, styled. |
| `c-tooltip` | Anchored `[popover]` | Anchor positioning. No JS. |

**Implicit text-mode.** Components that wrap text rely on the underlying text-mode object — `c-button`/`c-input` via `o-input-box`, `c-tag`/`c-badge`/`c-alert` via their own text-mode padding. The consumer never has to wrap them in `o-text-box`. Heading and paragraph base styles in the `base` layer handle their own lh compensation similarly. A consumer reaches for `o-text-box` explicitly only when wrapping prose that isn't already inside a text-bearing component (e.g., a callout card that *is* a paragraph).

### 10.2 Browser-primitive components (native + small toolkit wiring)

These use a native HTML element (`<dialog>`, `[popover]`) for most of their behavior, with one or two toolkit utilities (see §12.2) layered on for keyboard nav or close protocols.

| Class | Element | Toolkit utilities |
|---|---|---|
| `c-tabs` | `<div role="tablist">` with `role="tab"` buttons | `rovingFocus` (horizontal) for arrow / Home / End navigation; small JS syncs `aria-selected` and panel visibility. |
| `c-modal` | `<dialog class="o-dialog">` | Layers modal-typical chrome on `o-dialog`: centered viewport positioning, backdrop tint, focus halo, header/body/footer slot conventions. `requestClose` for ESC / outside-click / `commandfor close` hooks. Focus trapping is native to `<dialog>`. |
| `c-drawer` | `<dialog class="o-dialog c-drawer c-drawer--left">` | Composes `o-dialog`'s chrome with edge-anchored positioning + slide transition. Side variants: `c-drawer--left`, `c-drawer--right`, `c-drawer--top`, `c-drawer--bottom` set the anchor edge and the slide direction. A `--c-drawer__side` custom property mirrors the modifier for cases where you need to switch sides via inline style or scoped variable (rare). Same `requestClose` protocol as `c-modal`. |
| `c-popover` | `[popover]` | `requestClose`; native CSS anchor positioning. |
| `c-menu` | `[popover]` with `role="menu"` | `rovingFocus` (vertical), `typeaheadFilter` for letter-jump. |

### 10.3 Composite components (substantial toolkit composition)

| Class | Element | Toolkit utilities |
|---|---|---|
| `c-styled-select` | Custom button + listbox in `[popover]` | `rovingFocus` (vertical), `activeDescendant`, `typeaheadFilter`, plus form-engine integration for value reporting. The *only* reason this exists is options that need rendered content (font previews, image swatches) — never use for plain text options. |

`c-styled-select` is the single composite component in v2. Everything else is either pure CSS or a near-trivial wiring of one or two utilities.

### 10.4 Layout patterns (compositions, not named layout objects)

v1 shipped opinionated whole-page layouts (`o-top-nav-layout`, `o-sidebar-layout`). v2 deliberately doesn't. "I need a layout" isn't quite the right frame — "I need a top nav that auto-hides," "I need a sidebar that becomes a drawer on mobile" are. Each decomposes into a small recipe over existing primitives, and most need no JS now that scroll-state container queries and `commandfor` are usable.

**Top nav that auto-hides on scroll down** — pure CSS via `scroll-state` container queries:

```html
<div class="o-container" style="container-type: scroll-state">
  <header class="my-top-nav">...</header>
</div>
```

```css
.my-top-nav {
  position: sticky;
  top: 0;
  transition: transform 200ms;
}
@container scroll-state(scroll-direction: down) {
  .my-top-nav { transform: translateY(-100%); }
}
```

Degrades gracefully — on browsers without `scroll-state`, the nav stays sticky and visible. That's the right fallback.

**Sidebar that collapses to a drawer on narrow viewports** — two elements, container queries decide which is visible. The cleanest pattern is to render the nav content once (via the consumer's framework template / component / slot system) and project it into two host containers:

```html
<div class="o-split">
  <!-- Wide-viewport host: a normal landmark sidebar -->
  <aside class="my-side-nav-wide">
    <!-- nav content -->
  </aside>

  <main>
    <!-- The hamburger trigger; CSS hides it above the breakpoint -->
    <button commandfor="side-nav-drawer" command="show-modal" class="c-button my-drawer-trigger">☰</button>
    ...
  </main>

  <!-- Narrow-viewport host: a real <dialog>, opens as a modal drawer -->
  <dialog id="side-nav-drawer" class="o-dialog c-drawer c-drawer--left">
    <!-- same nav content (rendered via shared template/component) -->
  </dialog>
</div>
```

```css
@container (min-width: 50rem) {
  .my-side-nav-wide { display: block; }
  #side-nav-drawer, .my-drawer-trigger { display: none; }
}
@container (max-width: 50rem) {
  .my-side-nav-wide { display: none; }
}
```

This duplicates DOM nodes but not the consumer's *source* — frameworks resolve that with `<slot>` / `children` / component reuse. The two elements are conceptually different: one is a landmark sidebar, the other is a modal drawer with focus trap, ESC handling, and backdrop. Trying to be one element is fighting browser defaults.

**Single-element alternative** (`[popover]`). For nav-style drawers where you don't need true modal focus trapping, a single `<aside popover="manual">` works. Below the breakpoint, `commandfor` opens it. Above, a container query overrides the popover's default `display: none`:

```css
@container (min-width: 50rem) {
  .my-side-nav:not(:popover-open) {
    display: block;
    /* + reset popover-injected positioning, margins, top-layer rules */
  }
}
```

Caveat: popovers don't trap focus by default. Fine for navigation (Tab escapes are usually desirable); worse for modal forms inside a drawer.

**Why no `o-*-layout` class.** A whole-page layout component bakes in too many decisions: where the nav goes, mobile behavior, breakpoints, surface treatment. The primitives (`o-split`, `o-stack`, `o-container`, `c-drawer`) compose, and the consumer picks the breakpoint and surface to match their design. Janus ships the primitives; the layout recipes are documentation, not classes.

If a specific recipe proves common enough across consumers, the path is to ship it as a focused named component (e.g. `c-auto-hide-nav`) — not as a layout container. Focused naming preserves "I need a thing that does X" framing over "give me a structure."

## 11. The tools layer (intentionally narrow)

Cap on `t-` classes: every one must either zero out a knob-derived value or toggle a layout flag. No arbitrary scale utilities (`t-px-2`, `t-px-4`, etc. — disallowed; if you need that, you're fighting the framework).

Approved tools:

- Padding zero-out: `t-px-0`, `t-py-0`, `t-p-0`
- Padding shorthand: `t-px`, `t-py`, `t-p` (each applies `--v-spacing`)
- Flex: `t-flex`, `t-flex-fill`, `t-flex-auto`, `t-flex-none`, `t-flex-wrap`
- Display: `t-block`, `t-inline`, `t-inline-block`, `t-hidden`, `t-sr-only`
- Border toggle: `t-border`, `t-border-none`, `t-border-inner`
- Radius toggle: `t-radius-none`, `t-radius-full` (cascade handles inner/outer automatically — see §8)
- Shadow toggle: `t-shadow`, `t-shadow-inner`, `t-shadow-outer`, `t-shadow-none` (applies / removes `--v-shadow-outer` and `--v-shadow-inner` — the split knob design from §5.1 lets `t-shadow-inner` replace just the inner glow without disturbing an existing outer shadow, and vice versa)
- Alignment: `t-align-start`, `t-align-center`, `t-align-end`
- Overflow: `t-truncate` (single-line ellipsis)

Drop from v1: the broader text-overflow-with-tooltip machinery. If consumers need it they can compose `t-truncate` with `c-tooltip`.
