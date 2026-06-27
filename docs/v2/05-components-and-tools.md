# Janus v2 — Components and Tools

Part 5 of the [Janus v2 design spec](./README.md). Covers the `c-` component classes and the narrow `t-` tools layer.

## 10. Components

### 10.1 Pure CSS (zero JS)

| Class | Element | Notes |
|---|---|---|
| `c-button` | `<button class="o-input-box">`, `<a class="o-input-box">` | Hover state, outer shadow (`--v-shadow-outer`), tone via `v-colors-*`. Layers chrome on `o-input-box`; sizing/padding/radius come from the object. `c-button--icon` opts into square mode. Consumer-defined scopes (e.g. `.v-cta`) tweak height/radius for specific roles. |
| `c-card` | `<article>`, `<section>` (with `o-box`) | Surface chrome only (`--v-shadow-outer`, border, bg). Pair with `o-box` — it trims, so children can be components or prose (use `o-prose` for multi-element flow). Reads `--o-box__radius`. **Context-aware chrome** (all container-query-driven, so it tracks the card's *own* available width, not the viewport): cards inside `o-container` on wide viewports lose their shadow (they're in the reading flow); below a narrow threshold a card can **collapse to a full-bleed section** — `--c-card__radius`, inline border, and shadow drop to `0`/none and `margin-inline` breaks out by `var(--o-container__gutter)` (the sanctioned negative-margin case, §6.1). This is the *same* full-bleed mechanism a dialog's boxes use when the **dialog** is narrow — one `@container` rule keyed to the shared `frame` container (§9.3 `o-container`), so the surrounding prose realigns to flush by the same trigger (§6.1). The default keeps page and dialog identical; a frame that should differ overrides the threshold/opt-out via its own vars. Cards inside `:modal` / `:popover-open` always show their shadow (they're floating). For a **grouped/segmented** set of cells sharing one border (settings groups), compose `o-segmented` (§9.8) under the card surface. The `:has(:invalid, [aria-invalid]) [type="submit"]` rule visually disables the submit at `opacity: 0.5` but preserves `pointer-events` so the form engine can dispatch focus to invalid fields on click. |
| `c-alert` | `<div role="alert">` | Internally text-mode. Tone via `v-colors-*`. |
| `c-input` | `<input class="o-input-box">`, `<textarea class="o-input-box">` | Inner shadow (`--v-shadow-inner`), focus ring, invalid-state chrome. Sizing/padding/radius come from `o-input-box`. |
| `c-checkbox`, `c-radio` | `<input type=...>` | Custom-styled but uses native input. |
| `c-toggle` | `<input type="checkbox" role="switch">` | Pure CSS via `:checked`. Track height derived from `--v-input-height`. |
| `c-select-native` | `<select>` | Styled chrome around native select. Height = `--v-input-height`. Default for almost all dropdowns. |
| `c-tag` | `<span>` | Composes `o-caption` for interactive / removable text-mode label. |
| `c-badge` | `<span>` | Composes `o-caption` for text-mode count badges, square-mode for dot indicators. Static. |
| `c-avatar` | `<img>`, `<span>` | Square-mode. |
| `c-spinner` | `<span>` | Square-mode. CSS animation. |
| `c-skeleton` | `<div>` | CSS animation. |
| `c-disclosure` | `<details><summary>` | Native, styled. |
| `c-tooltip` | Anchored `[popover]` | Composes `o-caption`. Anchor positioning. No JS. Applies `v-colors-tooltip` (always inverted vs. color scheme). |

**Implicit text-mode.** Components that wrap text rely on the underlying text-mode object — `c-button`/`c-input` via `o-input-box`, `c-tag`/`c-badge`/`c-alert` via their own text-mode padding. The consumer never has to wrap them in anything. Heading and paragraph base styles in the `base` layer get correct optical block spacing from `text-box-trim` (§6), not per-element compensation. For prose that isn't already inside a text-bearing component (e.g., a callout card that *is* a paragraph), a plain `o-box` works — it trims — and `o-prose` adds boundary-owned rhythm + cross-card alignment when there are multiple flowing elements.

### 10.2 Browser-primitive components (native + small toolkit wiring)

These use a native HTML element (`<dialog>`, `[popover]`) for most of their behavior, with one or two toolkit utilities (see §12.2) layered on for keyboard nav or close protocols.

| Class | Element | Toolkit utilities |
|---|---|---|
| `c-tabs` | `<div role="tablist">` with `role="tab"` buttons | `rovingFocus` (horizontal) for arrow / Home / End navigation; small JS syncs `aria-selected` and panel visibility. Selected-tab indicator uses `color-mix` against `--v-accent` (same `color-mix` recipe as dynamic borders) — self-themes when inside a `v-colors-*` subtree. Indicator is `inset box-shadow`, not border, so neighboring tabs don't shift. |
| `c-modal` | `<dialog class="o-dialog">` | Layers modal-typical chrome on `o-dialog`: centered viewport positioning, backdrop tint (`backdrop-filter: blur(4px)`), focus halo, header/body/footer slot conventions. `requestClose` for ESC / outside-click / `commandfor close` hooks. Focus trapping is native to `<dialog>`. Scrollable content areas show `--v-shadow-inner-top` / `--v-shadow-inner-bottom` at scroll edges (driven by `data-scroll-top` / `data-scroll-bottom` sentinels from `t-scroll-shadow.ts`). |
| `c-drawer` | `<dialog class="o-dialog c-drawer c-drawer--left">` | Composes `o-dialog`'s chrome with edge-anchored positioning + slide transition. Side variants: `c-drawer--left`, `c-drawer--right`, `c-drawer--top`, `c-drawer--bottom` set the anchor edge and the slide direction. A `--c-drawer__side` custom property mirrors the modifier for cases where you need to switch sides via inline style or scoped variable (rare). It's `--c-*`, not `--o-*`, because the side is the *component's* own concern — there is no `o-drawer` object (drawer is `c-drawer` composing `o-dialog`); see the component-knob rule in §5. Same `requestClose` protocol as `c-modal`. |
| `c-popover` | `[popover]` | `requestClose`; native CSS anchor positioning. |
| `c-menu` | `[popover]` with `role="menu"` | Composes `o-menu` / `o-menu-item` for structure. `rovingFocus` (vertical), `typeaheadFilter` for letter-jump. Applies `v-colors-popover` (matches card chrome). Menu item highlight is conditional on keyboard/mouse mode: hover highlights in mouse mode, active-descendant highlights in keyboard mode — controlled by `body[data-v-kb-nav]` flag from `t-kb-nav.ts`. |

**Modal scroll structure (the scroll-away header).** `c-modal` realizes the §9.4 arrangement: the card is the transparent scroll container, and **the header scrolls away with the content** — it is not sticky. Only the close affordance stays pinned: a small sticky **X** in its own element (`position: sticky; top: 0` with a negative block-end margin that cancels its height, so the header still begins flush at the top), occupying the rounded top-right corner. The reader gets the title on entry and reclaims its vertical space once scrolling — important in a height-constrained dialog. A small decorative leading mark in the opposite corner is *not* a button — an inline ~`0.7em` glyph that nudges the title clear of the corner curve; the X is the real tap target, which is why the header reserves inline space only on its side.

**Header treatment — plain (default) or glass (opt-in variant).** Plain is a card-tone surface flush with the body (their seam is invisible). Glass is a tinted two-tone surface (`v-colors-highlight` + glass blur). The header↔body seam is exactly **one** pad-unit for plain and **two** for glass (two-tone wants the breathing room): the header carries *no* bottom padding by default — so the seam is the body's top padding alone — and glass restores its own bottom padding so the two stack to two. The extra space is never a margin gap (a transparent gap would reveal the backdrop between the surfaces) nor doubled onto the body.

**Footer stickiness — opt-in, three modes.** `none` (footer scrolls in flow — the default); `submit` (only the primary `[type="submit"]` pins bottom-right via a sticky float mirror — its in-footer slot goes `visibility: hidden`, secondary actions scroll away); `bar` (the whole footer pins as a glass action bar that breaks out to the dialog edges with a top border + scroll-edge shadow, rounding its own bottom corners). Per-button stickiness was considered and rejected — it reads badly with anything beyond the submit. The pinned submit composes with the `:has(:invalid) [type=submit]` disabled-but-clickable treatment (§10.1).

### 10.3 Composite components (substantial toolkit composition)

| Class | Element | Toolkit utilities |
|---|---|---|
| `c-styled-select` | Custom button + listbox in `[popover]` | Composes `o-menu` / `o-menu-item` for the dropdown structure. `rovingFocus` (vertical), `activeDescendant`, `typeaheadFilter`, plus form-engine integration for value reporting. The *only* reason this exists is options that need rendered content (font previews, image swatches) — never use for plain text options. |

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
- Radius toggle: `t-radius-none`, `t-radius-full` (per-element override of the object's `--o-*__radius` knob — see §8)
- Shadow toggle: `t-shadow`, `t-shadow-inner`, `t-shadow-outer`, `t-shadow-none` (applies / removes `--v-shadow-outer` and `--v-shadow-inner` — the split knob design from §5.1 lets `t-shadow-inner` replace just the inner glow without disturbing an existing outer shadow, and vice versa)
- Flex alignment — cross-axis (`align-items`): `t-items-start`, `t-items-center`, `t-items-end`; main-axis (`justify-content`): `t-justify-start`, `t-justify-center`, `t-justify-end`, `t-justify-between`
- Text alignment (`text-align`): `t-text-start`, `t-text-center`, `t-text-end`
- Grid span: `t-col-span-full` (a grid item spans all columns — `grid-column: 1 / -1`). A layout *flag*, not a numeric scale, so it stays within the §11 cap; there is no `t-col-span-2/3/…` (write explicit `grid-column` in consumer CSS for those).
- Overflow: `t-truncate` (single-line ellipsis)

Drop from v1: the broader text-overflow-with-tooltip machinery. If consumers need it they can compose `t-truncate` with `c-tooltip`.

### 11.1 Truncation: `t-truncate` (the overflow recipe)

v1 made truncation a global **opt-out**: `base.css` applied a `t-overflow-x` mixin to nearly every text element (`a, span, b, em, h1–h6, p, strong, …`), and that mixin set `overflow: hidden` on the element **and recursively on every descendant** (`* { overflow: hidden }`). It also needed `spanify` — a JS pass wrapping bare text nodes in `<span>` so there was a stylable element to clip and so the focus ring (on the outer element) stayed clear of the clip. It worked, but it inverted the common case (most text should wrap) and the both-axes `hidden` caused constant *inadvertent vertical clipping*.

v2 flips it to an **opt-in** single utility built on `overflow-x: clip`:

```css
@layer tools {
  .t-truncate {
    min-width: 0;            /* shrink inside flex/grid parents (replaces the spanify + child-clip hack) */
    white-space: nowrap;     /* one line — so there's no vertical content to clip */
    overflow-x: clip;        /* clips horizontally; ellipsis renders */
    overflow-y: visible;     /* no vertical clipping, no scroll container */
    text-overflow: ellipsis;
  }
}
```

Why each line, and why this beats v1 (all three claims validated empirically in `spacing-workbench.html`):

- **`overflow-x: clip`, not `hidden`.** Per CSS spec, when one axis is `hidden`/`clip` and the other is `visible`, `hidden` forces the visible axis to compute to **`auto`** — spawning a scroll container (a focusable scroll box + stray scrollbar). That coupling is the entire reason v1 clamped *both* axes to `hidden` (and thus clipped vertically). `clip` is the exception: it does **not** force the other axis to `auto` and does **not** create a scroll container, so `overflow-y: visible` survives. Confirmed: under `overflow-x: hidden` the browser reports `overflow-y: auto` (scroll container); under `clip` it stays `visible` (none). `text-overflow: ellipsis` still renders under `clip`.
- **`min-width: 0` replaces `spanify` + the recursive `*` clip.** The reason ellipsis "didn't propagate to children" in flex contexts was the flexbox rule that a flex item won't shrink below its content size without `min-width: 0`. Set it on the one truncating child and the descendant-clip recursion is unnecessary. Components own their markup and put `t-truncate` on the single text element they want clamped — no blanket node-wrapping.
- **Focus ring: truncate on an *inner* element, keep the focusable element overflow-free.** An `outline` on the truncating element itself is never clipped by that element's own overflow — clipping only bites a ring on a **descendant** (or a `box-shadow`). So the durable rule is to put `t-truncate` on an inner span and let the focusable wrapper stay `overflow: visible`; its ring is then never clipped regardless of strategy. (This is the same separation `spanify` bought, made explicit and scoped.)

**Multi-line clamp is a separate tool, not a flag on this one.** When a design needs N-line truncation, use a distinct `t-line-clamp` (`display: -webkit-box; -webkit-line-clamp: var(--t-line-clamp, 2); -webkit-box-orient: vertical; overflow: clip;`) rather than conflating it with single-line `t-truncate` — they have different layout models and shouldn't share a class.

**Header / toolbar shrink pattern.** The common application: a bar with a flexible label and fixed actions. Let the label side shrink and ellipsize while the actions stay fixed — no wrapping to a second row:

```css
.o-bar > .label-group { flex: 1 1 auto; min-width: 0; }   /* yields space */
.o-bar > .label-group .brand { /* compose t-truncate */ }
.o-bar > .actions { flex: none; }                         /* never shrink, never wrap */
```
