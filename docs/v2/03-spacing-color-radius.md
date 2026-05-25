# Janus v2 — Spacing, Color, and Radius

Part 3 of the [Janus v2 design spec](./README.md). Covers the three knob systems that drive most of Janus's visual rhythm.

## 6. Spacing & padding primitives

Five root knobs cover the whole rhythm: `--v-spacing` (the scale lever) plus the four it derives — `--v-pad-block`, `--v-pad-inline`, `--v-gap-block`, `--v-gap-inline` (see §5.1).

Three padding modes, each implemented as `--o-*__pad-*` defaults set in the owning object's own rule (per §5.2). They re-resolve at each matched element using inherited `--v-pad-*` / `--v-radius` inputs.

| Padding mode | Block (top/bottom) | Inline (left/right) | Used by |
|---|---|---|---|
| **Block-mode** (default) | `var(--v-pad-block)` | `var(--v-pad-inline)` | `o-box` — boxes whose children are other components / rows |
| **Text-mode** (opt-in) | `calc(var(--v-pad-block) - (1lh - 1em) / 2)` | `max(calc(var(--v-radius) / 2), var(--v-pad-inline))` | `o-text-box`, `o-input-box`, and text-bearing components that bring their own padding (`c-tag`, `c-badge`, `c-alert` — see §10.1) |
| **Square** (opt-in) | `0` (aspect-driven) | `0` | `o-square` for icon / avatar / 1:1 content |

The text-mode block formula subtracts the line-height overhang `(1lh - 1em)/2` so the visual padding above and below the text matches the inline padding. The text-mode inline formula uses curvature clearance (`R/2`) when `--v-radius` is large enough to threaten the text (pill mode), and falls back to `--v-pad-inline` as a comfort floor otherwise.

Layout gaps:

- **Stack gap** — `o-stack` exposes `--o-stack__gap`, defaulting to `var(--v-gap-block)`.
- **Inline gap** — `o-group` / `o-row` expose `--o-group__gap` / `--o-row__gap`, defaulting to `var(--v-gap-inline)`.

**No t-shirt size variants ship with Janus.** Consumers who want a tighter spacing for a specific context — a toolbar, a dense table, a nav bar — define their own semantic class. Because `--v-pad-*` and `--v-gap-*` are frozen at root, the `v-spacing` mixin (§5.3) is the one-liner that re-bundles all five knobs:

```css
/* Consumer CSS, not framework CSS */
.v-dense    { @mixin v-spacing 0.5rem; }
.v-nav      { @mixin v-spacing 0.5rem; --v-input-height: 2rem; }
.v-cta      { --v-input-height: 3rem; --v-radius: 9999px; }
```

Inside the scoped subtree, every `--o-*__pad-*` / `--o-*__gap` default re-resolves against the new bundle. Consumers who'd rather avoid the mixin set the five knobs by hand — same effect.

**Rule of thumb for consumers:** raw text never goes directly inside an `o-box`. Wrap it in `o-text-box`, or place it inside a text-bearing component. This keeps the radius cascade and curvature avoidance well-defined.

## 7. Color & surface system

Five root color knobs (`--v-bg`, `--v-fg`, `--v-link`, `--v-accent`, `--v-muted`) carry the whole base palette. Tonal variations (primary / danger / etc.) live as **variants** that re-set these knobs together for a tonal subtree. No flat list of palette knobs at root.

**Tone** (`v-colors-*`) — re-sets the color knobs for a subtree. Composable; applies to whichever element carries the class.

- `v-colors-primary`, `v-colors-danger`, `v-colors-success`, `v-colors-warn`, `v-colors-info`, `v-colors-muted`

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

Each rounded object owns its own `--o-*__radius` knob. Each object's own rule sets a default derived from `--v-radius` (and sometimes `--v-spacing`) — per §5.2, defaults live on the object, not at `:root`. Outer objects can **redefine** an inner object's knob to drive context-aware radii — a button at the root reads `o-input-box`'s default; the same button inside an `o-box` reads the box-redefined value.

| Knob | Owned by | Reads as `border-radius` |
|---|---|---|
| `--v-radius` | (root) | Frames: `c-card`, `c-modal` chrome, `c-drawer` chrome, `o-square` shape, page-body framing |
| `--o-box__radius` | `o-box` | The box itself |
| `--o-text-box__radius` | `o-text-box` | Defaults to `--o-box__radius` |
| `--o-input-box__radius` | `o-input-box` | The control itself (button, input, textarea) |
| `--o-dialog__radius` | `o-dialog` | The dialog frame |

**The override pattern.** Each object derives its own radius locally (so the derivation re-resolves at each matched element and tracks scoped knob changes — see §5.2). Outer rounded objects additionally re-set their inner objects' knobs for descendants:

```css
.o-box {
  /* Derive locally — picks up inherited --v-radius / --v-spacing */
  --o-box__radius:       max(0px, calc(var(--v-radius) - var(--v-spacing)));
  /* Redefine for descendants: buttons & inputs inside get one step smaller */
  --o-input-box__radius: max(0px, calc(var(--o-box__radius) - var(--v-spacing)));
  border-radius: var(--o-box__radius);
}
.o-text-box {
  --o-text-box__radius:  max(0px, calc(var(--v-radius) - var(--v-spacing)));
  border-radius: var(--o-text-box__radius);
}
.o-input-box {
  /* Reads inherited --o-input-box__radius if an ancestor object set one,
     else falls back to --v-radius. The var() fallback chain avoids
     pinning a default that would block ancestor overrides. */
  border-radius: var(--o-input-box__radius, var(--v-radius));
}
.o-dialog {
  --o-dialog__radius:    max(0px, calc(var(--v-radius) - var(--v-spacing)));
  /* Direct children of dialogs (box/input-box) get the dialog-aware step */
  --o-box__radius:       max(0px, calc(var(--o-dialog__radius) - var(--v-spacing)));
  --o-input-box__radius: max(0px, calc(var(--o-dialog__radius) - var(--v-spacing)));
  border-radius: var(--o-dialog__radius);
}
```

`.o-box` / `.o-text-box` / `.o-dialog` each derive their *own* radius locally, so scoping `--v-radius` in an ancestor (`.theme-dense { --v-radius: 1rem }`) propagates correctly. `.o-input-box` deliberately does NOT set its own knob — it reads the inherited value with a `var()` fallback to `--v-radius`. That fallback chain replaces the v1-style `:root { --o-input-box__radius: var(--v-radius) }` default that §5.2 ruled out, while still letting parent objects' redefinitions reach it via inheritance.

**Why this pattern.** Each redefinition assigns a *different-named* custom property — `--o-input-box__radius` is set from `--o-box__radius`, not from itself. Standard CSS forbids a custom property from referencing itself (the declaration becomes invalid → falls back to inherited → no derivation happens). Object-namespaced knobs sidestep the cycle while still giving context-aware behavior. The `inherit(--name)` function from CSS Values 5 would unlock true recursion but is not yet Baseline.

**No deeper nesting.** A nested `o-box` inside an `o-box` shares the outer's `--o-box__radius` — it does NOT shrink further. If a design genuinely needs two distinct rounded-box levels, introduce a new object (`o-panel`, etc.) with its own knob. This is a deliberate choice — see §5.2.

**Curvature avoidance + comfort floor.** Objects that hold text (`o-text-box`, `o-input-box`) compute their inline pad knob as `max(calc(var(--v-radius) / 2), var(--v-pad-inline))` — text always clears the curve at pill widths and never sits below `--v-pad-inline` of breathing room. The formula lives on the object (see §6's text-mode row).

**Square / icon content.** `o-square`, `c-avatar`, `c-spinner`, `c-badge` (dot mode) read `--v-radius` directly. They don't chain through `--o-*-radius` because they're typically the leaf themselves and may need to go all the way to a circle (`--v-radius: 50%`).

**Escape hatches** in the tools layer: `t-radius-none`, `t-radius-full`.

### 8.1 Two design archetypes

Tune `--v-radius` and `--v-spacing` together. The object-knob defaults flow from those two.

**Desktop archetype (R > spacing).** Large outer radius, modest spacing — macOS-style window chrome with concentric inner containers.

```css
:root {
  --v-radius:  1.5rem;   /* 24px — window-style */
  --v-spacing: 0.5rem;   /* 8px */
  /* derived: --o-box__radius = 16px, --o-dialog__radius = 16px;
     --o-input-box__radius inside an o-box = 8px */
}
```

**Web archetype (R ≤ spacing).** Sharp/rectangular outer chrome (page body has no radius), one meaningful rounded level (the card), controls inside either go to zero or get an explicit override.

```css
:root {
  --v-radius:  0.5rem;   /* 8px — card-style */
  --v-spacing: 0.75rem;  /* 12px */
  /* derived: --o-box__radius clamps to 0; controls inside box clamp to 0 */
}
```

For subtle rounding throughout the chain in the web archetype, raise the floor in the derivation — e.g. consumer overrides `--o-input-box__radius` directly:

```css
:root { --o-input-box__radius: 4px; }
.o-box { --o-input-box__radius: 4px; }
```

### 8.2 Flat radius mode

`v-radius-flat` collapses the chain by overriding every `--o-*__radius` to `--v-radius`. The selector list covers the scope root AND each rounded-object class inside it:

```css
.v-radius-flat,
.v-radius-flat .o-box,
.v-radius-flat .o-text-box,
.v-radius-flat .o-dialog {
  --o-box__radius:        var(--v-radius);
  --o-text-box__radius:   var(--v-radius);
  --o-input-box__radius:  var(--v-radius);
  --o-dialog__radius:     var(--v-radius);
}
```

Consumers set the single value at the same scope:

```css
/* Every card, box, dialog, and button uses 8px corners */
:root.v-radius-flat { --v-radius: 8px; }
```

**Why this works: layer order, not specificity.** `.v-radius-flat` lives in the `variants` layer; `.o-box` / `.o-text-box` / `.o-dialog` live in `objects`. Per §4, `variants` outranks `objects` in the cascade — so the variant's `--o-*__radius` declarations win against the objects' own derivations regardless of selector specificity. That holds both for descendant matches (`.v-radius-flat .o-box`) and for the same-element case (`<div class="o-box v-radius-flat">`, where the bare `.v-radius-flat` selector and `.o-box`'s rule have equal specificity but different layers).

Setting all four knobs in every selector is intentional — extras are harmless (`.o-text-box` getting `--o-dialog__radius` does nothing), and it keeps the rule a single, easy-to-grep block. Per-element exceptions remain possible by setting `--o-*__radius` directly on the element.
