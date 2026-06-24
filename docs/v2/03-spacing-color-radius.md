# Janus v2 — Spacing, Color, and Radius

Part 3 of the [Janus v2 design spec](./README.md). Covers the three knob systems that drive most of Janus's visual rhythm.

## 6. Spacing & padding primitives

Five root knobs cover the whole rhythm: `--v-spacing` (the scale lever) plus the four it derives — `--v-pad-block`, `--v-pad-inline`, `--v-gap-block`, `--v-gap-inline` (see §5.1).

Three padding modes, each implemented as `--o-*__pad-*` defaults set in the owning object's own rule (per §5.2). They re-resolve at each matched element using inherited `--v-pad-*` inputs.

| Padding mode | Block (top/bottom) | Inline (left/right) | Used by |
|---|---|---|---|
| **Block-mode** (default) | `var(--v-pad-block)` | `var(--v-pad-inline)` | `o-box` — boxes whose children are other components / rows |
| **Text-mode** (opt-in) | `var(--v-pad-block)` | alignment-dependent — see §6.1 | `o-text-box`, `o-input-box`, and text-bearing components (`c-tag`, `c-badge`, `c-alert` — see §10.1) |
| **Square** (opt-in) | `0` (aspect-driven) | `0` | `o-square` for icon / avatar / 1:1 content |

**Block padding is uniform, because of `text-box-trim`.** v1 subtracted the line-height overhang `(1lh − 1em)/2` from text-mode block padding so the optical space above and below the text matched the inline padding. v2 drops that fudge. Every text element renders with `text-box-trim: trim-both` (the `text-box` property — see §15), so its box edges sit at the cap height and alphabetic baseline. A plain `var(--v-pad-block)` then yields correct optical padding *regardless of font-size or line-height* — an `h1` and a `p` in the same box both look right, and no wrapper needs to know its content's type metrics. This is a deliberate bet on a not-yet-Firefox feature (§15); the degradation is slightly loose leading on the first/last line in Firefox, which we judge acceptable versus carrying per-element compensation math everywhere.

Layout gaps:

- **Stack gap** — `o-stack` exposes `--o-stack__gap`, defaulting to `var(--v-gap-block)`.
- **Inline gap** — `o-group` / `o-row` expose `--o-group__gap` / `--o-row__gap`, defaulting to `var(--v-gap-inline)`.

### 6.1 Inline alignment: the spacing budget

Inline padding has to reconcile a container's padding with the self-padding of what sits inside it: a control carries its own internal inline padding (`--v-control-inset`); plain text carries ~none. The organizing principle:

> **`--v-spacing` is a budget from the container edge to "the content line." What lands *on* that line — the control's *text*, or the control's *border* — is a per-subtree choice.**

Two modes, each a variant class applied to any scope:

| Mode | Class | What lands at `--v-spacing` from the edge | Best for |
|---|---|---|---|
| **Edge-align** (default) | `v-align-edge` | The control's **border-box** | Controls with strong, visible borders (default Janus inputs) |
| **Text-align** | `v-align-text` | The **text** — plain text and in-control text line up | Light / borderless controls; menus, list rows, toolbars |

Both are achieved with **positive padding only** — never negative margins (see policy). With `inset = var(--v-control-inset)` (a control's internal inline padding):

- **Edge-align:** the container pads `--v-pad-inline`; controls sit flush, so their border-box lands on the line. Plain text gets a small inline inset of `var(--v-radius-min)` so it lines up with where the control's *flat* edge begins instead of colliding with the rounded corner — this is the "text padding = min radius" idea.
- **Text-align:** the container pads `calc(var(--v-pad-inline) − var(--v-control-inset))`; controls sit flush, so their *text* lands on the line; plain-text boxes pad `var(--v-control-inset)`, so plain text lands on the same line. With light borders, the control's border-box sitting a little closer to the edge is invisible — you just see aligned text.

Because each child carries its own compensation as positive padding, **mixed content in one container resolves correctly without the container knowing its contents**, and there's no upward data flow — `--v-control-inset` is a pure function of shared knobs.

*(Implementation edge case, not a spec rule: at pill radii `--v-control-inset` can exceed `--v-pad-inline`, so the text-align container padding clamps at 0 and alignment can't fully hold. Normal radii never reach this.)*

**Negative-margin policy.** Positive, box-carried padding is the *only* alignment mechanism. Negative margins are reserved for exactly one job — the **full-bleed breakout**, where an element escapes its container's inline gutter (`margin-inline: calc(-1 * var(--o-container__gutter))`, §9.3). That case has no positive-padding equivalent. Everywhere else the rule is "wrap it in a box and let the box pad," which keeps every element inside its own bounds — safe under `overflow: clip` rounded corners, and easy to reason about.

### 6.2 Block spacing comes from flow, not box padding

A box's block padding handles only its **perimeter** — first/last child to the box's top/bottom edge (uniform, per the `text-box-trim` note above). It does **not** carry the rhythm *between* siblings, because the right gap between, say, an `h1` and a `p` depends on each element's own type metrics, which a generic wrapper can't know.

Interior vertical rhythm comes from **flow**:

- `o-stack` for explicit, even gaps between children (`--o-stack__gap`).
- base-layer `margin-block` on `h1`–`h6`, `p`, etc., tuned per element, for prose inside an `o-text-box`.

This matches how developers actually write markup — they wrap a *group* in one box and drop several elements inside, not wrap every heading and paragraph individually. So the contract is **"wrap a group, flow the children":** the box owns the perimeter; the elements (or the stack) own the gaps. `o-text-box` is therefore a *perimeter + inline-alignment* primitive that leans on flow for its vertical story.

### 6.3 The spacing bundle includes border-width (but not radius)

Janus's internal `v-spacing` mixin (§5.3 — an authoring tool, not a consumer API) bundles `--v-border-width` alongside the four pad/gap derivatives, because denser layouts want thinner borders, not just smaller padding. A consumer setting the bundle by hand sets `--v-border-width` in the same block:

```css
@define-mixin v-spacing $size, $border-width: 1px {
  --v-spacing:      $size;
  --v-pad-block:    $size;
  --v-pad-inline:   $size;
  --v-gap-block:    $size;
  --v-gap-inline:   calc($size * 0.5);
  --v-border-width: $border-width;
}
```

**The mixin does not touch radius.** Radius is no longer coupled to spacing — it's preset-driven and independently assignable (§8). So changing `--v-spacing` changes padding/gap/border but leaves corner radii alone, which is the correct behavior: a denser layout shouldn't silently re-round its corners. To change radii, apply a radius preset (§8.2) or set the `--o-*__radius` knobs directly. (Note that the *concentric* preset derives its radii partly from `--v-pad-inline`, so under that preset a spacing change does shift radii — but only because the consumer opted into that relationship, not because the mixin forces it.)

### 6.4 Hi-DPI density bump

A 2.5rem control on a desktop reads fine; on a phone, fingers want at least 2.75rem. The foundation layer ships a resolution-based density branch. Because type is fluid (§5.4), the bump nudges the **anchors** (`--v-font-size-min` / `-max`), not a frozen size — the resolved `--v-font-size` clamp and every step recompute from them automatically:

```css
:root {
  --v-input-height:  2.5rem;
  --v-font-size-min: 1rem;
  --v-font-size-max: 1.125rem;
}
@media (resolution >= 200dpi) {
  :root {
    --v-input-height:  2.75rem;
    --v-font-size-min: 1.0625rem;
    --v-font-size-max: 1.1875rem;
    --v-spacing:       1rem;
  }
}
```

This is not a breakpoint — it's a pixel-density gate. A phone with a 200dpi screen gets larger targets and text regardless of viewport width. It composes with the fluid scale: the viewport-driven `clamp()` still interpolates; the gate just raises the floor and ceiling it interpolates between.

**No t-shirt size variants ship with Janus.** Consumers who want a tighter spacing for a specific context — a toolbar, a dense table, a nav bar — define their own semantic class via the supported customization paths (§5.3): variable overrides, a `v-` variant, or plain CSS — *not* a Janus mixin. Because `--v-pad-*` and `--v-gap-*` are frozen at root, set the bundle together:

```css
/* Consumer CSS — set the knob bundle directly. */
.v-dense { --v-spacing: 0.5rem; --v-pad-block: 0.5rem; --v-pad-inline: 0.5rem;
           --v-gap-block: 0.5rem; --v-gap-inline: 0.25rem; }
.v-nav   { --v-spacing: 0.5rem; --v-pad-block: 0.5rem; --v-pad-inline: 0.5rem;
           --v-gap-block: 0.5rem; --v-gap-inline: 0.25rem; --v-input-height: 2rem; }
.v-cta   { --v-input-height: 3rem; --v-radius: 9999px; }
```

Inside the scoped subtree, every `--o-*__pad-*` / `--o-*__gap` default re-resolves against the new bundle. (A consumer who forks the CSS package *may* reuse Janus's internal `v-spacing` mixin to shorten these, but it isn't required and isn't part of the documented surface.)

**Rule of thumb for consumers:** raw text never goes directly inside an `o-box`. Wrap it in `o-text-box`, or place it inside a text-bearing component. This keeps inline alignment (§6.1) and curvature clearance well-defined, and is what makes the positive-padding-only model work without negative margins.

### 6.5 Fluid spacing (opt-in, same mechanism as type)

Spacing is **static by default** — `--v-spacing` is a fixed length and the pad/gap bundle derives from it (§5.1). Type, by contrast, is fluid out of the box (§5.4). The asymmetry is deliberate: fluid type pays off everywhere (readable on phones, expressive on desktops with no breakpoints), while fluid spacing interacts with the frozen-at-root bundle and the hi-DPI gate, so we keep it opt-in rather than impose it.

When a consumer *does* want roomier gutters on wide screens, the same Utopia-style `clamp()` mechanism applies — make `--v-spacing` itself a fluid value, then set the bundle from it:

```css
/* Consumer CSS — fluid spacing between the §5.1 viewport anchors.
   slope/intercept computed exactly as in §5.4. */
:root {
  --v-spacing:    clamp(0.75rem, calc(0.6818rem + 0.34vw), 1rem);
  --v-pad-block:  var(--v-spacing);
  --v-pad-inline: var(--v-spacing);
  --v-gap-block:  var(--v-spacing);
  --v-gap-inline: calc(var(--v-spacing) * 0.5);
}
```

Because the four derivatives read `var(--v-spacing)` here, they track the fluid value. (This is one of the rare cases where the freezing rule helps you: deriving the bundle *from* a fluid `--v-spacing` in the same `:root` block makes the whole bundle fluid in lockstep.) The hi-DPI gate (§6.4) still composes — it can override the anchors of the clamp at high resolution. Janus's internal `v-fluid $min, $max` mixin (§5.3) is what generates these clamps in-house; consumers paste the computed `clamp()` or write their own.

### 6.6 Density scopes (the compactness convention)

Density — the **compactness** axis from §5.5 — is the one sizing concern Janus does *not* hand you as a single global knob, and deliberately so. There is no `--v-density` multiplier. Compactness is a property of a **role/context** (a toolbar is dense because it's a toolbar, not because of any global setting), so the convention is a **density scope**: a consumer-defined class that re-bundles the compactness knobs for a subtree. This is the same shape as the spacing examples in §6.4, promoted to a named pattern.

A density scope sets some or all of three knob groups:

1. **Rhythm** — the `--v-spacing` bundle (`--v-pad-*`, `--v-gap-*`, `--v-border-width`). Always set these together (the freezing rule, §5.2).
2. **Control height** — `--v-input-height`. **Left independent of `--v-spacing` by default** (§5.1) — "tighten the padding around a control but keep the control itself comfortably clickable" is a real and common want. A density scope *opts into* moving it.
3. **Legibility** — the type anchors, if this scope should also read smaller (a dense toolbar usually wants ~13px labels).

```css
/* Consumer CSS. Three escalating levels of "dense". */

/* Padding/gaps tighten; controls stay full-size and clickable. */
.v-dense {
  --v-spacing: 0.5rem; --v-pad-block: 0.5rem; --v-pad-inline: 0.5rem;
  --v-gap-block: 0.5rem; --v-gap-inline: 0.25rem;
}

/* Toolbar role: everything compact together — rhythm + control height + type. */
.v-toolbar {
  --v-spacing: 0.375rem; --v-pad-block: 0.375rem; --v-pad-inline: 0.375rem;
  --v-gap-block: 0.375rem; --v-gap-inline: 0.1875rem;
  --v-input-height: 2rem;
  --v-font-size-min: 0.8125rem; --v-font-size-max: 0.8125rem;  /* fixed, small */
}

/* Touch role: the inverse — roomier rhythm AND bigger targets together. */
.v-touch {
  --v-spacing: 1rem; --v-pad-block: 1rem; --v-pad-inline: 1rem;
  --v-gap-block: 1rem; --v-gap-inline: 0.5rem;
  --v-input-height: 2.75rem;
}
```

**The scope's driver is your choice (§5.5).** The class above is *role*-driven (you put `v-toolbar` on the toolbar). The exact same knob block can be driven by a different signal without changing the model:

```css
/* Container-driven: a panel that densifies when it itself gets narrow.
   Note @container, not @media — keyed to the panel, not the viewport. */
@container (max-width: 28rem) {
  .app-panel { --v-spacing: 0.5rem; --v-pad-block: 0.5rem; /* …bundle… */ }
}

/* Device-class-driven: coarse pointers get the touch bundle everywhere. */
@media (pointer: coarse) {
  :root { --v-input-height: 2.75rem; /* …roomier bundle… */ }
}
```

If a project finds itself wanting one lever instead of a bundle, the honest move is *not* a global `--v-density` scalar (it fights the "semantic, not abstract scalar" ethos and `--v-spacing` is already the rhythm scalar) — it's to define `--v-input-height: calc(var(--v-spacing) * N)` in that project's `:root` so control height tracks spacing automatically. That's a one-line opt-in to coupling, kept out of the framework default.

### 6.7 Sizing recipes by deployment type

Putting §5.5 (axes × signals) and §6.6 (density scopes) together, three deployment archetypes fall out. Each is a *choice of signal per axis*, not a different mechanism.

**Marketing / content site — fluid everything, viewport-driven.** Legibility and expressiveness both ride the viewport; type is the star.

```css
:root {
  --v-font-size-min: 1rem;     --v-font-size-max: 1.25rem;   /* wide gap   */
  --v-font-ratio-min: 1.2;     --v-font-ratio-max: 1.333;    /* expressive */
}
/* Optionally fluid spacing too (§6.5). Hero h1 goes ~2rem → ~4.5rem as one clamp. */
```

Per-section variety (airy hero, dense footer) is a **scope** that re-declares the anchors for that subtree — the ramp recomputes because the tokens are cascading vars.

**Desktop app (resizable window) — fixed type, role/container density.** Viewport ≈ window here, so viewport-fluid type is *wrong*: dragging the window must not resize the toolbar. Turn fluidity off and drive compactness by context.

```css
:root {
  /* Collapse the anchors → fixed scale, no vw dependence. */
  --v-font-size-min: 0.9375rem; --v-font-size-max: 0.9375rem;
  --v-font-ratio-min: 1.2;      --v-font-ratio-max: 1.2;
}
/* Density comes from roles (.v-toolbar, §6.6) and from @container queries on
   panels that should densify when cramped — never from raw vw. */
```

**Web app — device-class bundles, mixed signals.** Viewport/resolution is meaningful, but as a *discrete* "phone vs. desktop" signal, not continuous scaling. On a phone, legibility ↑, touch targets ↑, and spacing ↑ move **together**. The hi-DPI gate (§6.4) is the built-in version of this; `pointer: coarse` generalizes it.

```css
@media (pointer: coarse), (resolution >= 200dpi) {
  :root {
    --v-font-size-min: 1.0625rem; --v-font-size-max: 1.1875rem;  /* legible   */
    --v-input-height: 2.75rem;                                    /* touch     */
    --v-spacing: 1rem; --v-pad-block: 1rem; --v-pad-inline: 1rem; /* roomy     */
    --v-gap-block: 1rem; --v-gap-inline: 0.5rem;
  }
}
/* Mild viewport fluidity for body copy is fine on top of this; chrome density
   stays on the device-class signal so it doesn't drift with window width. */
```

The through-line: **pick the signal per axis.** Fluid is the right default for legibility on content surfaces; fixed-plus-context is the right default for app chrome; device-class bundles handle "this is a phone." All three are the same knobs wired to different signals.

## 7. Color & surface system

Five root color knobs (`--v-bg`, `--v-fg`, `--v-link`, `--v-accent`, `--v-muted`) carry the whole base palette. Tonal variations (primary / danger / etc.) live as **variants** that re-set these knobs together for a tonal subtree. No flat list of palette knobs at root.

### 7.0 Default palette values

The defaults matter — they set the visual tone for every consumer who doesn't override. v1's defaults produce a warm, intentional look (not generic black-on-white). v2 should match or improve on this warmth. Reference values from v1 (`git show main:src/lib/styles/variables/color-schemes.css`):

**Light mode defaults:**

| Knob | v1 reference value | Notes |
|---|---|---|
| `--v-bg` | `hsl(30deg 12% 98.5%)` | Warm off-white with a hint of cream. NOT pure `#fff`. |
| `--v-fg` | (derived from `--v-bg` via OKLCH lightness) | Resolves to near-black `hsl(216deg 16% 8%)` |
| `--v-link` | `hsl(195deg 100% 20%)` | Saturated dark teal — distinctive, not generic blue |
| `--v-accent` | Same as link or a close variant | Focus rings, selected states, primary actions |
| `--v-muted` | Reduced-saturation gray | De-emphasized text, secondary labels |

**Dark mode defaults:**

| Knob | v1 reference value | Notes |
|---|---|---|
| `--v-bg` | `hsl(216deg 16% 8%)` | Deep blue-gray. NOT pure `#000`. |
| `--v-fg` | (derived) | Resolves to warm off-white |
| `--v-link` | `hsl(195deg 100% 50%)` or lighter variant | Same hue as light, adjusted for dark bg contrast |

**Body background treatment.** Beyond the flat `--v-bg`, the `base.css` body rule should include subtle radial gradient overlays for visual depth (v1 pattern):

```css
/* v1 reference — two overlapping gradients at low opacity */
body {
  background:
    radial-gradient(ellipse at 70% 20%, hsl(20deg 80% 70% / 15%), transparent 50%),
    radial-gradient(ellipse at 30% 80%, hsl(195deg 80% 50% / 7%), transparent 50%),
    var(--v-bg);
}
```

This creates a barely-perceptible warm/cool depth that prevents the page from looking flat. The exact gradient values can change, but the pattern of two low-opacity radial gradients should be preserved.

**Tonal variant palette.** Each `v-colors-*` variant re-sets the five root knobs. v1 reference values:

| Variant | v1 bg (light mode) | Notes |
|---|---|---|
| `v-colors-primary` | `hsl(195deg 100% 20%)` (the link color as bg) | White or near-white fg |
| `v-colors-danger` | `hsl(0deg 89% 31%)` | Red family |
| `v-colors-success` | `hsl(158deg 77% 15%)` | Teal-green family |
| `v-colors-warn` | `hsl(50deg 77% 86%)` | Warm yellow, dark fg |
| `v-colors-info` | `hsl(195deg 80% 90%)` | Light cyan, dark fg |
| `v-colors-secondary` | `hsl(30deg 8% 93%)` | Near-gray, slightly warm — neutral tinted surface for secondary UI regions |

**Shadows.** Two semantic root knobs — no t-shirt scale. v1 shipped `--v-shadow-sm/md/lg`; v2 collapses these into role-based tokens:

```css
/* The two public knobs. Default values use multi-layer shadows for realistic depth. */
--v-shadow-outer: 0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%);
--v-shadow-inner: inset 0 1px 2px 0 rgb(0 0 0 / 10%);
```

Components that need a stronger or weaker shadow write a literal value or scope a redefinition — `o-dialog` can redefine `--v-shadow-outer` for its subtree so cards inside a modal get a stronger lift. No `--v-shadow-sm/md/lg` public tokens. Reference `git show main:src/lib/styles/variables/composition.css` for v1's multi-layer values.

**Dynamic border derivation:**

```css
/* v1 pattern — borders that look correct on any background */
--v-border-color: color-mix(in hsl, black 17.5%, var(--v-bg));  /* light mode */
--v-border-color: color-mix(in hsl, white 50%, var(--v-bg));     /* dark mode */
```

**Transition defaults.** One base duration knob, not a scale. Components derive faster/slower paces via `calc()`:

```css
--v-duration: 240ms;                                  /* the standard pace */
--v-ease: cubic-bezier(0.4, 0, 0.2, 1);              /* Material-style ease */
/* Components use: calc(var(--v-duration) * 0.5) for fast hover/active feedback,
   calc(var(--v-duration) * 2) for extended transitions.
   prefers-reduced-motion zeros --v-duration and everything follows. */
```

**Tone** (`v-colors-*`) — re-sets the color knobs for a subtree. Composable; applies to whichever element carries the class.

- `v-colors-primary`, `v-colors-danger`, `v-colors-success`, `v-colors-warn`, `v-colors-info`, `v-colors-secondary`

**Surface-role** (`v-colors-*`) — UI-context variants that control *which* surface a component renders on. These are orthogonal to tonal variants: a tooltip is always inverted regardless of whether it sits inside `v-colors-danger` or the default palette.

| Variant | Purpose | Key behavior |
|---|---|---|
| `v-colors-tooltip` | Floating annotation | Always inverted vs. color scheme. `--v-bg: light-dark(#141821, #fafafa)` |
| `v-colors-popover` | UI replacement (menus, dropdowns) | Matches card/surrounding chrome. `--v-bg: var(--v-card-bg, var(--v-bg))` |
| `v-colors-code` | Inline code | Tinted paper. `--v-bg: color-mix(in hsl, var(--v-muted) 8%, var(--v-bg))` |
| `v-colors-pre` | Code blocks | Always dark, even in light mode. `--v-bg: #141821; --v-fg: #fdf3e1` |
| `v-colors-callout` | Callout/highlighted region | Tinted bg + **auto weight-bump**: `--v-font-weight-normal: 500`, `--v-font-weight-label: 600`, `--v-font-weight-strong: 800`. Entire weight stack shifts up ~100. |
| `v-colors-highlight` | Active descendant / selected item | `--v-bg: var(--v-accent)` or `--v-link`. Used by menus and keyboard nav. |

`v-colors-warn` and `v-colors-info` should also apply the callout weight bump, since they are tinted-surface variants where body-weight text loses contrast against the background.

**Surface** (`v-surface-*`) — background treatment, shadow, border, optional `backdrop-filter`. Composes with `v-colors-*` for tint.

- `v-surface-card` — solid bg, subtle shadow + border
- `v-surface-elevated` — stronger shadow, no border
- `v-surface-sunken` — slight tint inward, no shadow
- `v-surface-glass` — translucent bg + `backdrop-filter: blur()`
- `v-surface-gradient` — soft gradient bg. Exposes `--v-surface-gradient__angle` (default `to bottom right`) — variant-scoped knob, not a global root knob.

This is the gap most worth closing from v1. v1 consumers reach for inline `background: linear-gradient(...)` because there is no recipe. Provide recipes.

### 7.1 Contrast-floor weight fallback

`--v-link` / `--v-accent` / `--v-muted` each pair with a `*-weight-min` knob (§5.1). Base styles for text rendered in those colors apply the floor as `font-weight`:

```css
a       { color: var(--v-link);   font-weight: var(--v-link-weight-min,   inherit); }
.v-muted{ color: var(--v-muted);  font-weight: var(--v-muted-weight-min,  inherit); }
.v-accent-text { color: var(--v-accent); font-weight: var(--v-accent-weight-min, inherit); }
```

This lets a designer ship a slightly desaturated link or a softer muted color without breaking WCAG contrast — the weight bump carries the visual emphasis the hue alone can't. Default is `inherit` (no bump); palettes that need it raise the floor.

### 7.2 Color scheme (light/dark)

`--v-bg` defaults via `light-dark(white, black)` (or whatever palette anchors are chosen); `--v-fg` defaults to a binary black-or-white derived from the bg's OKLCH lightness — see §5.1 for the formula. The active half of `light-dark()` is driven by the cascaded `color-scheme` property.

Janus uses `data-v-color-scheme` on the root (or any subtree root) to control the scheme:

| Value | Behavior |
|---|---|
| *(no attribute)* | Follow `prefers-color-scheme`. Equivalent to `color-scheme: light dark`. |
| `data-v-color-scheme="system"` | Same as no attribute — explicit "follow OS" opt-in. Useful for a tri-state theme picker (light / dark / system) where "system" is a distinct selection. |
| `data-v-color-scheme="light"` | Force light. `color-scheme: light` (also disables dark-mode UA chrome). |
| `data-v-color-scheme="dark"` | Force dark. `color-scheme: dark`. |

Naming note: the attribute is `data-v-color-scheme`, not `data-v-theme`, because "theme" may later carry an orthogonal meaning (brand theme, density theme, etc.) and we want the dark-mode hook to be unambiguous.

## 8. Border radius system

Radius is **preset-driven**, not derived through a programmatic concentric cascade. v1 (and an earlier v2 draft) anchored at the outermost radius `--v-radius` and *subtracted* `--v-spacing` at each level inward — which clamps to sharp `0` corners in tight layouts and hard-couples radius to spacing. v2 inverts and decouples: anchor at an innermost **floor** that's never sharp, and let named presets assign each layer's radius.

### 8.1 The layers and their knobs

Each rounded object owns an independently-assignable radius knob. There is **no subtraction chain** between them — a preset (§8.2) or the consumer sets them, and each object reads its own knob with a `var()` fallback.

| Knob | Owned by | Role |
|---|---|---|
| `--v-radius-min` | (root) | The innermost floor. Controls never round below this, so corners are never sharp. Default `0.25rem`. |
| `--o-input-box__radius` | `o-input-box` | Leaf controls (button, input, textarea, select). Falls back to `--v-radius-min`. |
| `--o-box__radius` | `o-box` | Boxes / cards. Falls back to `--v-radius-min`. |
| `--o-text-box__radius` | `o-text-box` | Defaults to `--o-box__radius`. |
| `--o-dialog__radius` | `o-dialog` | Dialog / modal / drawer frame. Falls back to `--v-radius`. |
| `--v-radius` | (root) | The **window/dialog frame** radius and the generic frame value (`o-square`, page-body framing). |

```css
.o-box       { border-radius: var(--o-box__radius, var(--v-radius-min)); }
.o-input-box { border-radius: var(--o-input-box__radius, var(--v-radius-min)); }
.o-dialog    { border-radius: var(--o-dialog__radius, var(--v-radius)); }
```

No knob references itself, so the self-reference cycle that forced the old `inherit()`-workaround discussion simply doesn't arise — presets (in the `variants` layer, which outranks `objects`, §4) assign the knobs and win cleanly.

**Frame is two sub-roles for radius:** the **page frame** (the body in a browser viewport — usually `0`, since the browser/OS rounds the window) and the **dialog frame** (`--o-dialog__radius` — rounded). Presets set them independently, which is why a web preset can keep rounded modals while the page itself is square.

### 8.2 Presets

To avoid knob overload, ship a small family of **radius presets** as variant classes (neutral names). Each assigns the whole set from `--v-radius-min` and the spacing knobs; a consumer applies one class to a scope (usually `:root`).

| Preset | Idea | Control | Box | Dialog frame | Page frame |
|---|---|---|---|---|---|
| `v-radius-concentric` | True concentric: each layer's radius = the inner radius + the padding between them, so nested corners stay optically parallel | `--v-radius-min` | `min + box-pad` | `box + frame-pad` | = dialog |
| `v-radius-uniform` | Two flat values | `0.25rem` | `0.25rem` | `0.5rem` | `0.5rem` |
| `v-radius-web-concentric` | Concentric, but the **page frame is `0`** (the browser/webview rounds the window); dialogs keep their radius | concentric | concentric | concentric | `0` |
| `v-radius-web-uniform` | Uniform, page frame `0` | `0.25rem` | `0.25rem` | `0.5rem` | `0` |

The **concentric** preset is the one that *relates* radius to padding — additively, inside-out, anchored at the floor, so it never produces a sharp corner:

```css
.v-radius-concentric {
  --o-input-box__radius: var(--v-radius-min);
  --o-box__radius:       calc(var(--v-radius-min) + var(--v-pad-inline));
  --o-dialog__radius:    calc(var(--o-box__radius)  + var(--v-pad-inline));
  --v-radius:            var(--o-dialog__radius);
}
```

The relationship lives *inside the preset*, not as a global cascade — `v-radius-uniform` ignores it entirely. This is the "same effect, assigned properly" goal: opt-in concentricity, not an automatic step-down. A consumer raises the floor (`--v-radius-min`) or swaps the preset to change the look; per-element control comes from setting an `--o-*__radius` knob directly.

**Why presets win cleanly.** Preset classes live in the `variants` layer; objects live in `objects`. Per §4 `variants` outranks `objects`, so a preset's `--o-*__radius` assignment beats the object's `var()` fallback regardless of specificity — for both descendant matches (`.v-radius-concentric .o-box`) and the same-element case (`<div class="o-box v-radius-concentric">`).

**`v-radius-flat`** is the degenerate preset — every layer equals `--v-radius`. Kept as a one-liner for "make every corner the same":

```css
:root.v-radius-flat { --v-radius: 8px; }   /* every box / dialog / control = 8px */
```

### 8.3 Curvature, square content, nesting, escape hatches

- **Curvature clearance.** Text-bearing objects keep text off the corner by flooring their inline padding at the control radius — see §6.1's edge-align note and `--v-radius-min`.
- **Square / icon content.** `o-square`, `c-avatar`, `c-spinner`, `c-badge` (dot mode) read `--v-radius` directly and can go fully circular (`--v-radius: 50%`).
- **No deeper nesting.** A nested `o-box` shares its parent's `--o-box__radius` — it does NOT step further. Two genuinely distinct rounded-box levels → a new object (`o-panel`) with its own knob, or a preset that distinguishes them (see §5.2).
- **Escape hatches** in the tools layer: `t-radius-none`, `t-radius-full`.

### 8.4 Two example tunings

```css
/* Window-style: roomy concentric corners */
:root.v-radius-concentric { --v-radius-min: 0.5rem; --v-spacing: 0.75rem; }
/* → control 8px, box 20px, dialog 32px, page = dialog */

/* Web app: square page, modest rounded cards & controls, rounded modals */
:root.v-radius-web-uniform { /* control 4px, box 4px, dialog 8px, page 0 */ }
```

Both start from the floor and never produce a sharp inner corner — the failure mode of the old subtractive cascade.
