# Janus v2 — Build Plan

This document specifies a clean-room rebuild of the Janus UI library. It is written so an agent with no prior context can build it from scratch in a fresh repository. There is no migration path from v1; learn from v1 but do not preserve its structure.

## 1. Goals

- **CSS-first.** The core library is a CSS package. Markup conventions are documented in plain HTML. JS is a strictly optional second layer.
- **Opinionated knobs over granular utilities.** Consumers compose 1–3 classes per element, not 20. The framework owns sizing, rhythm, and surfaces; consumers pick from a short list of variants.
- **Semantic variants, not abstract scales.** No `v-spacing-md/lg/xl` t-shirt sizing. A variant ships with Janus only if a `c-` / `o-` class consumes its meaning (tone, surface, content-mode). For everything else — control heights, density, container widths — consumers define their *own* semantic scopes (`.v-cta`, `.v-dense`) that set the relevant knobs. Janus ships the mechanism and the defaults; consumers name the contexts.
- **Small public surface, deep derivation.** A handful of documented CSS custom properties act as "knobs." Everything else is internal and derived via `calc()` / `color-mix()` / etc.
- **Modern browsers only.** Target features that are Baseline 2024–2025: CSS layers, `:has()`, `color-mix()`, `light-dark()`, `1lh`, container queries, `popover`, anchor positioning, `commandfor`. No polyfills for these.
- **Framework-agnostic core.** No coupling to Solid (or any framework). A separate package may later wrap the CSS in Solid components; that is not part of v2 core.

## 2. Non-goals

- Backwards compatibility with v1. The class names, prefixes, file layout, and component APIs are all up for redesign.
- A general-purpose typography or icon system. Consumers bring their own icons and font stack; Janus exposes the knobs to make them fit.
- Theme builders, plugin systems, or runtime style configuration beyond CSS custom properties.
- IE / legacy / no-JS form-validation polyfills.
- A combobox / typeahead component. (See §14.)
- Toast / notifications system. Not used in surveyed consumer apps; if needed later, `[popover]` + a queue pattern is straightforward to build outside Janus.

## 3. Package layout

Three core packages plus one optional build plugin. Each is independently installable.

```
@janus/css       Pure CSS. No JS. Default for static sites and frameworks
                 that want to bring their own templating.
@janus/dom       Vanilla-JS progressive-enhancement layer. Form validation,
                 modal focus management, listbox keyboard nav. Reads
                 prefixed data-* attributes (data-t-*, data-c-*) off DOM
                 nodes — no framework required. See §4 for the prefix scheme.
@janus/solid     Thin Solid wrappers around @janus/css + @janus/dom.
                 Optional convenience layer.
@janus/vite      Build plugin enabling the SSR-introspection bundling
                 pattern (§12.4). Walks the SSR build's module graph and
                 generates a precise client-side behavior bundle. Only
                 needed for apps with separate SSR + client builds.
```

Consumers like a marketing site pull only `@janus/css`. App-shell consumers add `@janus/dom`. Solid apps add `@janus/solid`. SSR apps that care about client JS weight add `@janus/vite`.

## 4. Cascade architecture

A single `@layer` declaration in the entry stylesheet establishes precedence:

```css
@layer reset, base, components, objects, variants, tools;
```

| Layer | Prefix | Purpose | Examples |
|---|---|---|---|
| `reset` | — | Normalize defaults | `*, *::before, *::after { box-sizing: border-box }` |
| `base` | — | Element-level typography, links, form defaults | `body { font-family: ... }`, `a { ... }` |
| `components` | `c-` | Named, opinionated widgets | `.c-button`, `.c-card`, `.c-modal` |
| `objects` | `o-` | Structural / layout primitives | `.o-stack`, `.o-box`, `.o-grid` |
| `variants` | `v-` | Knob setters (scoped re-themes) | `.v-spacing-sm`, `.v-colors-primary`, `.v-surface-glass` |
| `tools` | `t-` | Surgical overrides that always win | `.t-px-0`, `.t-flex-fill`, `.t-radius-none` |

**Discipline:**
- `c-` and `o-` classes **consume** custom properties; they never set raw px/rem values. They may set derivations of properties from other properties though.
- `v-` classes **set** custom properties only. They never declare display, layout, or other structural properties.
- `t-` is the only layer permitted to set arbitrary properties directly. It is intentionally narrow (see §11).
- **`data-*` attributes mirror the same prefix scheme.** Component-specific behaviors take `data-c-*` (e.g. `data-c-modal-close`); object-specific hooks take `data-o-*`; generic toolkit utilities and behavior wiring take `data-t-*` (e.g. `data-t-roving-focus`, `data-t-validate`); variant-style state attributes take `data-v-*` (e.g. `data-v-color-scheme="dark"`). The framework's own DOM-scanning (`mount()`) only looks at attributes carrying one of these four prefixes, so consumer-defined `data-foo` attributes never collide.

## 5. The variable system

Four tiers, by prefix:

| Prefix | Tier | Who sets | Who reads | Notes |
|---|---|---|---|---|
| `--v-*` | **Root knob** | Consumers / variants / `:root` | Anything | Documented, stable, global concerns (spacing, radius, color base, typography). |
| `--o-*` | **Object knob** | Owning object's `:root` defaults; outer objects redefine for descendants | The object itself | Each object exposes its own (e.g. `--o-box__radius`, `--o-dialog__offset`). Common — most objects expose at least one. |
| `--c-*` | **Component knob** | Component's own scope only | The component itself | Rare. Components prefer JSX props for customization; CSS knobs only when there's a clear cross-cutting concern (e.g. an internal animation duration). |
| `--_*` | **Internal** | Janus only | Janus only | Derived via `calc()` / `color-mix()`. Consumers do not touch. Underscore signals "private." |

**Namespacing convention for `--o-*` and `--c-*` knobs.** Object and component knobs are written as `--{prefix}{name}__{property}` — a double underscore separates the namespace from the property. So `--o-box__radius`, `--o-input-box__radius`, `--c-drawer__side`. This makes the boundary unambiguous (`o-input-box` is one namespace, not three) and lets you grep `--o-input-box__` to find every knob belonging to a single object. Root knobs (`--v-*`) don't use the boundary — they're global and not scoped to a thing.

**The override pattern.** An outer object/component sets a *different-named* knob on itself to redefine an inner object's appearance:

```css
.o-box {
  /* o-box's own radius */
  border-radius: var(--o-box__radius);
  /* Redefine the inner object's knob for descendants */
  --o-input-box__radius: max(0px, calc(var(--o-box__radius) - var(--v-spacing)));
}
```

This avoids the self-reference cycle that breaks recursive `var()` cascades (see §5.2). It also means context-aware styling falls out naturally: a top-level button reads its own root default; a button inside an `o-box` reads the redefined value.

### 5.1 Root knobs (`--v-*`)

The full set. Defaults shown.

Layout & rhythm:
- `--v-spacing` — base spacing unit (default `0.75rem`)
- `--v-radius` — frame / window radius (default `0.5rem`). The chain root — every `--o-*-radius` derives from this. Even when no visible frame exists (a page in a browser viewport), set it on `:root` so derived radii are computable.
- `--v-border-width` — base border width (default `1px`)
- `--v-input-height` — height of interactive controls (default `2.5rem`). Drives `o-input-box` and the controls layered on it. Deliberately *independent* of `--v-spacing`.

Typography:
- `--v-font-family`
- `--v-font-family-mono`
- `--v-font-size` — base font size (default `1rem`). (Renamed from v1's `--v-text-size`.)
- `--v-line-height` — base line height (default `1.5`)

Color:
- `--v-bg` — body / base background.
- `--v-fg` — body / base foreground. Default: `contrast-color(var(--v-bg))` — the CSS Color 6 function that returns whichever of black/white contrasts best with the bg. (Verify Baseline; fall back to `light-dark()` via `@supports` if needed.)
- `--v-link` — link color.
- `--v-accent` — accent / current-action color (focus ring, selected state, primary action tint).
- `--v-muted` — de-emphasized text color.
- `--v-link-weight-min`, `--v-accent-weight-min`, `--v-muted-weight-min` — minimum `font-weight` to apply to text using each color. Lets hue-distinguished text (e.g. a desaturated link) safely sit alongside WCAG-compliant text by bumping weight when the color alone is borderline. Default `inherit` (no bump); raise to `500` / `600` per color as needed for the chosen palette.

Shadows:
- `--v-shadow-outer`, `--v-shadow-inner` — both default to `0 0 transparent` (no shadow). Split so a `.t-shadow` helper or a component variant can replace one without disturbing the other.

**No color-palette knobs at root.** Tonal variations (primary / danger / success / etc.) live as `v-colors-*` variants that re-set `--v-bg` / `--v-fg` / `--v-accent` together for a tonal subtree — see §7.

### 5.2 Internal derivations and object-knob defaults

`:root` declares only what genuinely needs a global default — the flat-mode lever and stand-alone consumer defaults. **Padding, gap, and per-object radius derivations live inline in each object's own rule** (see §6, §9). This makes them re-resolve at each matched element using inherited inputs, so scoping `--v-spacing` or `--v-radius` in a sub-tree (`.dense { --v-spacing: 0.5rem }`, etc.) cascades through the derived values without any consumer intervention.

```css
:root {
  /* Stand-alone object-knob defaults. The "inside-a-box" / "inside-a-dialog"
     cases are handled by the parent object's own rule (see §8). */
  --o-input-box__radius:  var(--v-radius);
  --o-dialog__offset:     var(--v-spacing);
  --o-container__max:     none;

  /* Color internals */
  --_border-color:       color-mix(in oklch, var(--v-fg) 15%, transparent);
}
```

**Derivation timing.** Custom properties resolve their `var()` references at the element where the declaration sits — *not* where the variable is later consumed. So a `:root { --_pad-block: var(--v-spacing) }` declaration would freeze `--_pad-block` at root's `--v-spacing`, and scoping `--v-spacing` in a sub-tree would leave `--_pad-block` stuck. Janus avoids that by writing derivations inline in object rules, where they re-resolve at the matched element.

**`--o-*` defaults are still frozen.** The `:root` declarations above (`--o-input-box__radius`, `--o-dialog__offset`, `--o-container__max`) resolve once. If you scope `--v-radius` in a sub-tree and want stand-alone input-box / dialog defaults to recompute, also re-set the relevant `--o-*` knob in that scope. Inside `.o-box` / `.o-dialog` this is handled automatically by their own rule (§8).

**No deeper nesting.** A nested `o-box` inside an `o-box` inherits the parent's `--o-box__radius` unchanged — it does NOT shrink further. If a design genuinely needs two distinct rounded-box levels, introduce a new object (e.g. `o-panel`) with its own knob. Inventing a name is cheaper than smuggling recursion into CSS variables.

## 6. Spacing & padding primitives

One knob (`--v-spacing`). Three padding modes, two gap sizes — written **inline in each object's rule** (per §5.2) so they re-resolve at each matched element and follow any scoped `--v-spacing` / `--v-radius` override.

| Padding mode | Block (top/bottom) | Inline (left/right) | Used by |
|---|---|---|---|
| **Block-mode** (default) | `var(--v-spacing)` | `var(--v-spacing)` | `o-box` — boxes whose children are other components / rows |
| **Text-mode** (opt-in) | `calc(var(--v-spacing) - (1lh - 1em) / 2)` | `max(calc(var(--v-radius) / 2), var(--v-spacing))` | `o-text-box`, `o-input-box`, and text-bearing components that bring their own padding (`c-tag`, `c-badge`, `c-alert` — see §10.1) |
| **Square** (opt-in) | `0` (aspect-driven) | `0` | `o-square` for icon / avatar / 1:1 content |

The text-mode block formula subtracts the line-height overhang `(1lh - 1em)/2` so the visual padding above and below the text matches the inline padding. The text-mode inline formula uses curvature clearance (`R/2`) when `--v-radius` is large enough to threaten the text (pill mode), and falls back to `--v-spacing` as a comfort floor otherwise.

Layout gaps:

- **Stack gap** (vertical flow): `var(--v-spacing)` — applied by `o-stack`.
- **Inline gap** (horizontal flow): `calc(var(--v-spacing) * 0.5)` — applied by `o-group`, `o-row`.

**No t-shirt size variants ship with Janus.** Consumers who want a tighter spacing for a specific context — a toolbar, a dense table, a nav bar — define their own semantic class:

```css
/* Consumer CSS, not framework CSS */
.v-dense    { --v-spacing: 0.5rem; }
.v-nav      { --v-spacing: 0.5rem; --v-input-height: 2rem; }
.v-cta      { --v-input-height: 3rem; --v-radius: 9999px; }
```

The framework cascade handles the rest: all four padding values and both gaps recompute automatically inside the scoped subtree.

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
- `v-surface-gradient` — soft gradient bg; angle is controlled by `--v-gradient-angle` (default `to bottom right`)

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

`--v-bg` defaults via `light-dark(white, black)` (or whatever palette anchors are chosen); `--v-fg` defaults to `contrast-color(var(--v-bg))`. The active half of `light-dark()` is driven by the cascaded `color-scheme` property.

Janus uses `data-v-color-scheme` on the root (or any subtree root) to control the scheme:

| Value | Behavior |
|---|---|
| *(no attribute)* | Follow `prefers-color-scheme`. Equivalent to `color-scheme: light dark`. |
| `data-v-color-scheme="system"` | Same as no attribute — explicit "follow OS" opt-in. Useful for a tri-state theme picker (light / dark / system) where "system" is a distinct selection. |
| `data-v-color-scheme="light"` | Force light. `color-scheme: light` (also disables dark-mode UA chrome). |
| `data-v-color-scheme="dark"` | Force dark. `color-scheme: dark`. |

Naming note: the attribute is `data-v-color-scheme`, not `data-v-theme`, because "theme" may later carry an orthogonal meaning (brand theme, density theme, etc.) and we want the dark-mode hook to be unambiguous.

## 8. Border radius system

Each rounded object owns its own `--o-*-radius` knob. Defaults at `:root` derive from `--v-radius` and `--v-spacing` (see §5.2). Outer objects can **redefine** an inner object's knob to drive context-aware radii — a button at the root reads its default; the same button inside an `o-box` reads the redefined value.

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
  /* Reads inherited --o-input-box__radius — :root default OR ancestor override */
  border-radius: var(--o-input-box__radius);
}
.o-dialog {
  --o-dialog__radius:    max(0px, calc(var(--v-radius) - var(--v-spacing)));
  /* Direct children of dialogs (box/input-box) get the dialog-aware step */
  --o-box__radius:       max(0px, calc(var(--o-dialog__radius) - var(--v-spacing)));
  --o-input-box__radius: max(0px, calc(var(--o-dialog__radius) - var(--v-spacing)));
  border-radius: var(--o-dialog__radius);
}
```

`.o-box` / `.o-text-box` / `.o-dialog` each derive their *own* radius locally, so scoping `--v-radius` in an ancestor (`.theme-dense { --v-radius: 1rem }`) propagates correctly. `.o-input-box` deliberately does NOT derive locally — that lets parent objects' redefinitions reach it via inheritance.

**Why this pattern.** Each redefinition assigns a *different-named* custom property — `--o-input-box__radius` is set from `--o-box__radius`, not from itself. Standard CSS forbids a custom property from referencing itself (the declaration becomes invalid → falls back to inherited → no derivation happens). Object-namespaced knobs sidestep the cycle while still giving context-aware behavior. The `inherit(--name)` function from CSS Values 5 would unlock true recursion but is not yet Baseline.

**No deeper nesting.** A nested `o-box` inside an `o-box` shares the outer's `--o-box__radius` — it does NOT shrink further. If a design genuinely needs two distinct rounded-box levels, introduce a new object (`o-panel`, etc.) with its own knob. This is a deliberate choice — see §5.2.

**Curvature avoidance + comfort floor.** Objects that hold text (`o-text-box`, `o-input-box`) use `--_pad-inline-text: max(R/2, --v-spacing)` for inline padding, so text always clears the curve at pill widths and never sits below `--v-spacing` of breathing room.

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

`v-radius-flat` collapses the chain by overriding every `--o-*-radius` to `--v-radius`. The selector list covers the scope root AND each rounded object inside it (because `.o-box` / `.o-dialog` derive their knobs in their own rule, the variant has to outspecify those derivations):

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

Specificity: `.v-radius-flat .o-box` (0,2,0) wins against `.o-box`'s own rule (0,1,0). Setting all four knobs in every selector is intentional — extras are harmless (`.o-text-box` getting `--o-dialog__radius` does nothing), and it keeps the rule a single, easy-to-grep block. Per-element exceptions remain possible by setting `--o-*-radius` directly on the element.

## 9. Objects (zero JS, pure CSS)

### 9.1 Nesting model

Janus is designed around a **four-level nesting model**. The first level always exists; the others are present as content demands.

1. **Level 1 — Frame.** The outermost rounded surface in context. Not a class — it's a *role* filled by `<body>`, or by a component like `c-modal`, `c-drawer`, `c-card` when it's the top of its stacking context. Frames read `--v-radius` (often `0` for the page body, larger for window-style modals or desktop-archetype shells).
2. **Level 2 — Section / container.** Width-bounded organizational layer. The `o-container` class. **Transparent in radius terms** — never rounded. Can carry its own *surface* (a gradient band, a tinted background) by composing with `v-surface-*`. A single frame can hold multiple containers as sibling sections (marketing example: a full-bleed hero `o-container` next to a max-width `o-container.v-container-bounded`).
3. **Level 3 — Box / card.** Rounded grouping of related components or rows of content. The `o-box` family. Reads `--o-box__radius`.
4. **Level 4 — Control / text container.** Leaf controls (`o-input-box` — buttons, inputs) and standalone prose blocks (`o-text-box`). Reads its own `--o-*-radius` knob, which the enclosing box redefines.

The four levels describe the *mental model*; the radius story for each is in §8. Container level is transparent for radius. Each object owns its own knob (`--o-box__radius`, `--o-input-box__radius`, etc.) and outer objects redefine inner knobs to give context-aware behavior — a top-level button reads its root default; the same button inside an `o-box` reads the box-redefined value.

This is a *guideline*, not a hard limit. The model deliberately does **not** auto-derive radii through arbitrary nesting depth: a nested `o-box` inside an `o-box` shares the parent's `--o-box__radius`. UI that needs two distinct rounded-box levels should introduce a new object (e.g. `o-panel`) rather than relying on a recursive cascade (see §5.2 / §8). For uniform-radius layouts, use flat-radius mode (§8.2).

### 9.2 Box family (padded containers)

| Class | Mode | Knobs | Purpose |
|---|---|---|---|
| `o-box` | block-mode | `--o-box__radius` | Default container. Uniform block padding, nesting-math inline padding. Use when contents are other components or rows. |
| `o-text-box` | text-mode | `--o-text-box__radius` (defaults to `--o-box__radius`) | lh-compensated block padding, curvature-clearing inline padding. Use when contents are raw text / prose. |
| `o-input-box` | text-mode | `--o-input-box__radius` | Shared base for text-bearing leaf controls (`<button>`, `<input>`, `<textarea>`, native `<select>`). Height = `--v-input-height`. Text-mode padding. **Not** used for checkbox / radio / toggle — those have their own dimensions. |
| `o-square` | square-mode | reads `--v-radius` directly | `aspect-ratio: 1`, no padding floor, no curvature avoidance. Use for icon / avatar / 1:1 content. Can become a circle via `--v-radius: 50%`. |

### 9.3 Layout objects (transparent — no padding, no surface)

| Class | Knobs | Purpose |
|---|---|---|
| `o-stack` | — | Vertical flow with consistent gap. `display: flex; flex-direction: column; gap: var(--_gap-stack)`. |
| `o-group` | — | Horizontal flow with consistent gap. Wraps. Gap = `--_gap-inline`. |
| `o-row` | — | Like `o-group` but center-aligned, used for action rows. (Renamed from v1's `o-cluster`.) |
| `o-grid` | — | Container-query-driven responsive grid. Uses `auto-fill` with `minmax()`. No manual breakpoints. |
| `o-container` | `--o-container__max` (default `none`) | Section / width-bounded region. The level-2 role (§9.1). Holds the inline gutter for narrow viewports plus optional max-width. Composes with `v-surface-*` to carry a section background. Transparent in radius terms — never rounded. Multiple siblings inside one frame model "sections" of a page. |
| `o-split` | — | Two-up layout (sidebar + main) that collapses below threshold. `:has()` + container query, no media queries. |
| `o-centric` | — | Centers contents within an optional max-width. (Renamed from v1's `o-center` to signal "the centering container," not "the center itself.") |

Layout objects affect flow only — no padding, no surface, no radius of their own. `o-container` is the level-2 role in the mental model: it's where consumers reach for width-bounding and section-level surfaces (see §9.1).

### 9.4 Dialog object

| Class | Knobs | Purpose |
|---|---|---|
| `o-dialog` | `--o-dialog__radius`, `--o-dialog__offset` | Applied to `<dialog>` (or any element acting as one). **Chrome only** — radius, viewport-edge breathing room (`--o-dialog__offset` defaults to `--v-spacing`), surface treatment. Position-agnostic. The positioning models — centered with backdrop, edge-anchored with slide, anchor-positioned — live on `c-modal` / `c-drawer` / `c-popover` (§10), which compose `o-dialog`'s chrome with their own positioning + transition. |

Rejected from v1:
- `o-empty-state` — compose with `o-stack` + `o-centric`.
- `o-badge` — moved to the component family (`c-tag`, `c-badge` in §10.1).
- `o-frame` — level 1 is a *role*, not a class. See §9.1.

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
| `c-popover` | `[popover]` | `requestClose`; anchor positioning native (or `anchorShim` if browser lacks support). |
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

## 12. The JS layer (`@janus/dom`)

The JS layer is a toolkit of small, composable behaviors that attach to DOM elements. Components ship as thin compositions of these utilities. Consumers can use the same utilities directly to build custom controls (toolbars, command palettes, navigable lists) without leaving the Janus model.

Two parts:

- **Form engine** (§12.1) — substantial coherent system for validation and submission. Janus's biggest JS investment, because forms are the most JS-heavy real-world need (285+ call sites in surveyed v1 consumers).
- **Behavior utilities** (§12.2) — small composable bits: roving focus, request-close, typeahead, active descendant, etc.

### 12.1 Form engine

The engine is **one document-level dispatcher plus two registries**. No per-element listeners. No per-render ID generation. Validators register either once at module load (named) or by element identity (closure, via WeakMap).

**Activation.** A form opts in with a single boolean attribute:

```html
<form data-t-validate>
  ...
</form>
```

Field-level constraints use native HTML5 attributes — `required`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `type=email/url/...`. The engine reads `element.validity` and uses `element.validationMessage` as the default error text. No Janus attribute mirrors these.

**Two registries.**

```ts
// 1. Named validators — registered once at module load. Lives for page lifetime.
import { registerValidator } from '@janus/dom/form';

registerValidator('match-password', (el: HTMLInputElement) => {
  const target = el.form?.elements.namedItem('password') as HTMLInputElement | null;
  return target && el.value !== target.value ? 'Passwords must match' : null;
});
```

```html
<input type="password" required data-t-validate="match-password">
```

`data-t-validate` is a space-separated list of names. Multiple validators per element compose by listing them.

```ts
// 2. Inline closures — stored in a WeakMap keyed by element identity.
//    No IDs. Element GC cleans up automatically; the returned cleanup() is
//    only needed if you want to remove a validator while the element is alive.
import { addValidator } from '@janus/dom/form';

const cleanup = addValidator(inputEl, (el) => {
  if (el.value.includes('bob')) return 'No Bobs allowed';
  return null;
});
```

**Dispatcher.** A single set of document-level capture-mode listeners (`submit`, `change`, `input`) is installed once at `mount()` time. On each event the dispatcher:

1. Finds the owning `<form data-t-validate>` (no-op if absent).
2. Walks form members.
3. For each element runs, in order: HTML5 native validity check → named validators from `data-t-validate` → inline validators from the WeakMap.
4. First non-null return wins. The engine writes the message into the element's error destination.

**Error destination.** Boolean marker on any element receiving error text:

```html
<input id="email" aria-describedby="email-err" required>
<span id="email-err" data-t-validate-error></span>
```

The engine walks the input's `aria-describedby`, finds the first element with `data-t-validate-error`, writes the message there and toggles `role="alert"`. The screen-reader wiring is the same DOM relationship the engine uses — no separate back-pointer attribute.

**Group validation.**

```html
<fieldset data-t-validate-group>
  <input name="start-date" type="date" required>
  <input name="end-date" type="date" required data-t-validate="after-start-date">
</fieldset>
```

When a child of a `data-t-validate-group` changes, every other touched child re-validates. Touched-only is the always-on default.

**Touch tracking.** An element is "touched" after its first `change` event or after the form has submitted. Untouched fields don't show errors when *other* fields change (avoids premature red text). After a field shows its first error, the engine switches to `input`-event validation on that field for live feedback while the user fixes it.

**Server-fed errors.**

```ts
import { setErrors } from '@janus/dom/form';
setErrors(formEl, { email: 'Already taken', username: 'Reserved' });
```

Errors keyed by field `name`. Each persists until the user changes that field, at which point the engine clears it and resumes normal validation. Replaces v1's `EXTERNAL_ERROR_ATTR` machinery with one function call.

**Submit handlers — same registry + WeakMap pattern as validators.**

```ts
import { registerSubmitHandler, addSubmitHandler, type SubmitHandler } from '@janus/dom/form';

// 1. Named — registered once at module load, referenced from markup
registerSubmitHandler('signup', async (data, form) => {
  const res = await fetch('/api/signup', { method: 'POST', body: data });
  if (res.status === 409) return { ok: false, fieldErrors: { email: 'Already in use' } };
  if (!res.ok) return { ok: false, formError: 'Something went wrong' };
  return { ok: true };
});
```

```html
<form data-t-validate data-t-submit="signup">
  ...
</form>
```

```ts
// 2. Closures — Solid <Form onSubmit={fn}> uses a ref to stash in WeakMap
const cleanup = addSubmitHandler(formEl, async (data, form) => { /* ... */ });
```

The result type:

```ts
type SubmitResult =
  | { ok: true; reset?: boolean }    // reset defaults to true
  | { ok: false; fieldErrors?: Record<string, string>; formError?: string };

type SubmitHandler = (data: FormData, form: HTMLFormElement) =>
  | SubmitResult
  | Promise<SubmitResult>;
```

The submit dispatcher (same document-level listener set) owns all the choreography: `preventDefault`, run validation, dispatch to handler if valid, call `setErrors` / `setFormError` on returned errors, reset on `{ ok: true }` unless `reset: false`. The consumer's handler is just business logic.

A form can use `data-t-submit` (or `addSubmitHandler`) without `data-t-validate` (no validation, just async submit choreography) or vice versa.

**Modal-form behaviors.** Three attrs, dispatched by the same document-level listeners. No ref, no per-form setup, no callback registration.

| Attribute | Effect |
|---|---|
| `data-t-reset-on-close` | When the ancestor `<dialog>` fires `close` (or `[popover]` fires `toggle` → `closed`), reset the form. A document-level capture-phase listener handles non-bubbling `close`. |
| `data-t-close-on-success` | On `{ ok: true }` from the submit handler, close the ancestor `<dialog>` / `[popover]` after reset. Dispatcher branch. |

**Speed bump for dirty close.** When a modal contains both a dirty form and a descendant `<dialog data-c-modal-speed-bump>`, the modal's `requestClose` handler (§12.2) intercepts the close, opens the speed bump, and only commits the outer close if the speed bump returns `'discard'`. Pure markup pattern — the consumer renders both dialogs and the engine discovers them via DOM:

```html
<dialog class="c-modal">
  <form data-t-validate data-t-reset-on-close data-t-close-on-success data-t-submit="signup">
    ...
  </form>
  <dialog class="c-modal" data-c-modal-speed-bump>
    <form method="dialog">
      <p>You have unsaved changes.</p>
      <button value="cancel">Keep editing</button>
      <button value="discard" class="c-button v-colors-danger">Discard</button>
    </form>
  </dialog>
</dialog>
```

Orchestration: outer modal's `requestClose` runs `isDirty(form)`; if dirty, calls `showModal()` on the speed bump and cancels the original close; listens once for the speed bump's `close` event; if `returnValue === 'discard'`, closes the outer modal.

**Public API summary:**

```ts
registerValidator(name: string, fn: Validator): void;                    // module-load
addValidator(el: Element, fn: Validator): () => void;                    // WeakMap
registerSubmitHandler(name: string, fn: SubmitHandler): void;            // module-load
addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void;  // WeakMap
setErrors(form: HTMLFormElement, errors: Record<string, string>): void;  // server-fed
setFormError(form: HTMLFormElement, msg: string): void;                  // form-wide
isDirty(form: HTMLFormElement): boolean;                                 // used by speed bump
```

The Solid wrapper sits on top. The DOM layer alone is sufficient for static HTML + progressive enhancement: a `<form data-t-validate>` with HTML5 attributes works without any JS-layer prop wrapping.

### 12.2 Behavior utilities

Each utility does one job, attaches to an element, returns a `cleanup()` function, and is idempotent. They can be used imperatively or via `data-t-*` attributes scanned by a single `mount()` call (§4 discipline).

**Graceful degradation principle.** Markup must remain functional with JS disabled. Behavior utilities *enhance* the no-JS baseline; they don't establish it. Specifically: never render no-JS-unreachable state into the initial HTML (e.g. don't ship `tabindex="-1"` on items that the JS arrow-key handler is supposed to reach). Mount-time JS demotes / rewires as needed.

| Utility | Imperative API | Purpose |
|---|---|---|
| `rovingFocus` | `rovingFocus(el, { axis, wrap?, homeEnd? })` | Single-tabindex group with arrow-key navigation. `axis: 'horizontal' \| 'vertical' \| 'both'`. Optional wrap-around and Home/End jump-to-edge. Powers tabs, menus, toolbars, listboxes. **Markup ships items at default tab order (no `tabindex="-1"` written by hand); `mount()` demotes non-active items at runtime. No-JS fallback: tab through items individually — degraded but functional.** |
| `focusTrap` | `focusTrap(el)` | Constrains Tab/Shift+Tab to descendants of `el`. Only needed for non-`<dialog>` overlays — native `<dialog>` traps focus for free. |
| `restoreFocus` | `restoreFocus(el)` | Records the active element before `el` opens; restores it on close. Pairs with popovers / menus. |
| `requestClose` | `requestClose(el, { onRequestClose? })` | Intercepts ESC, outside-click, and `commandfor close` invocations. Callback returns boolean to allow/cancel close (e.g. "discard unsaved changes?"). |
| `typeaheadFilter` | `typeaheadFilter(el, { match })` | Buffers keystrokes (~500ms window) and calls `match(buffer)` to find / focus matching items. |
| `activeDescendant` | `activeDescendant(el, { items, onActive })` | Manages `aria-activedescendant` based on arrow keys without moving DOM focus. Used by listbox / combobox patterns. |
| `anchorShim` | `anchorShim(el, { anchor })` | JS fallback for CSS anchor positioning. Only needed if §15 indicates the browser lacks native support. |

**Module shape.** Each utility ships in its own file (`@janus/dom/behaviors/roving-focus`, etc.) as a function-with-property — callable as the imperative API, with its `data-t-*` attribute name on `.attr`:

```ts
// @janus/dom/behaviors/roving-focus.ts
export function rovingFocus(el: HTMLElement, opts: RovingFocusOptions) { /* ... */ }
rovingFocus.attr = 'data-t-roving-focus';
```

The dual role is load-bearing for the SSR-introspection bundling pattern (§12.4): SSR-time code that renders a behavior's attribute imports the module and reads `.attr` to compose the data attribute — that read pins the module into the SSR bundle's import graph, where the build plugin can discover it. For framework-agnostic consumption a tiny helper does the spread:

```ts
// @janus/dom
export function dataAttr(b: { attr: string }, value: string | true = true) {
  return { [b.attr]: value === true ? '' : value };
}
```

```tsx
<div role="toolbar" {...dataAttr(rovingFocus, 'horizontal')}>
```

The Solid wrappers (§13) import behaviors directly inside their component bodies, so consumers using `<Tabs>` etc. get the import-graph pinning for free without ever touching `.attr`.

**Declarative mode.** A single `mount()` call scans the DOM for prefixed activation attributes (`data-t-*` for toolkit utilities, `data-c-*` for component-specific hooks) and wires up behaviors:

```html
<div role="toolbar" data-t-roving-focus="horizontal">
  <button class="c-button">Cut</button>
  <button class="c-button">Copy</button>
  <button class="c-button">Paste</button>
</div>
```

```ts
import { mount } from '@janus/dom'
mount() // scans document and wires
```

### 12.3 How components compose utilities

Janus's own components are thin wrappers over the toolkit:

```
c-tabs          = rovingFocus(horizontal) + aria-selected sync
c-modal         = native <dialog> + requestClose
c-drawer        = native <dialog> + o-dialog chrome + edge-anchored CSS + requestClose
c-popover       = [popover] + (anchorShim?) + requestClose
c-menu          = [popover] + rovingFocus(vertical) + typeaheadFilter
c-styled-select = [popover] + rovingFocus + activeDescendant + typeaheadFilter + form engine
```

A consumer building a custom toolbar, command palette, or any list-with-keyboard-nav reaches for the same utilities directly. There is no "private" JS in Janus components that consumers can't replicate.

## 13. Solid layer (@janus/solid)

The Solid wrapper is the thinnest possible mapping from props to DOM plus the JS layer's `data-t-*` activation attributes. Two design rules:

1. **No prop-mod context.** Wrapper-to-leaf wiring uses a render-prop + hook pattern. No upward-merging context, no `(prev) => newValue` prop transforms. Layering across wrappers happens by explicit `attrs(prev, ...)` merges at the consumer's call site.
2. **No component-side behavior wiring.** Behaviors are activated by `data-t-*` attributes (§12). The Solid component renders the attr; `@janus/dom`'s `mount()` registers handlers. Components never call `createValidator` or push callbacks into a registry.

### 13.1 Two shared helpers

```ts
/** Enforced: `disabled` -> `aria-disabled`. Native `disabled` is never emitted
 *  by a Janus component — keeps controls focusable + announced. @janus/dom's
 *  form engine must filter aria-disabled inputs from submission. */
export function ariaize(p: { disabled?: boolean; required?: boolean; invalid?: boolean }): {
  'aria-disabled'?: true; 'aria-required'?: true; 'aria-invalid'?: true;
};

/** Space-join ARIA token attrs (aria-describedby, aria-labelledby). Skips falsy. */
export function attrs(...parts: (string | false | null | undefined)[]): string | undefined;
```

`ariaize` is **opinionated and non-negotiable at the framework boundary**. `<Input disabled />` renders `<input aria-disabled="true">` — never the native HTML `disabled` attribute. A consumer who genuinely needs native `disabled` drops to a raw `<input>`. Rationale: a Janus-styled disabled control should behave the same way every time; aria-disabled keeps tab order intact and gives screen-reader users a clearer signal than vanishing focus. The SSR / no-JS edge case (a form submitted before `mount()` runs) is accepted — Solid implies JS at runtime, and the static-HTML path is `@janus/css` + raw HTML where the consumer writes their own attributes.

### 13.2 Labelling: `useLabelledInput` hook + thin layout components

`useLabelledInput()` is the workhorse. It takes label-related options and returns flat prop objects the consumer spreads:

```ts
const { labelProps, descriptionProps, errorProps, inputProps, ids } =
  useLabelledInput({ id, description, required, errorMessage });
```

IDs are deterministic — `${inputId}-label`, `-desc`, `-err` — for debuggability and stable hydration. `inputProps` carries `id`, `aria-labelledby`, `aria-describedby` (joining description / error IDs only when each is actually rendered), `aria-required`, `aria-invalid`.

`LabelledInput` / `LabelledInline` / `LabelledInputGroup` are thin opinionated arrangements over the hook. Their `children` prop is a **render-prop** receiving `inputProps`:

```tsx
<LabelledInput label="Email" description="Used for login">
  {(p) => <Input {...p} type="email" name="email" />}
</LabelledInput>
```

When the consumer needs to merge their own ARIA contribution with the wrapper's, the merge is explicit at the call site — no hidden context magic:

```tsx
<LabelledInput label="Email">
  {(p) => (
    <Input {...p} aria-describedby={attrs(p['aria-describedby'], 'global-tip-id')} />
  )}
</LabelledInput>
```

**Deep ARIA contribution across multiple wrapper layers is not supported.** A `<FormSection>` does *not* push aria-describedby into descendant inputs — section-level descriptions belong on the section element (`<section aria-describedby=...>`). If per-input contribution is genuinely needed, the consumer nests render-props by hand.

### 13.3 What this replaces from v1

| v1 mechanism | v2 equivalent |
|---|---|
| `PropModContext` (general prop-transform context) | (deleted) |
| `FormElementPropsContext` + `FormElementPropsProvider` + `useFormElementProps` | (deleted) |
| `mergeFormElementProps` (per-input merge pipeline) | `ariaize()` at the component boundary |
| `createAuto` / `createAutoId` (lazy ID-from-context) | Wrapper owns its IDs; `useLabelledInput` generates them once |
| `onValidate` / `createValidator` / per-render callback registration | `<Input validators="name1 name2" />` (named registry) or `<Input onValidate={fn} />` (closure → WeakMap). One document-level dispatcher; see §12.1 |
| Multiple `Labelled*` components × per-input-type context wiring | One `useLabelledInput` hook + three thin layout components |

### 13.4 Validation props on `<Input>` (and friends)

`<Input>` exposes exactly two validation-related props beyond the native HTML5 attributes (`required`, `pattern`, `minlength`, etc.):

```tsx
interface InputProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** Space-separated names of validators registered via registerValidator(). */
  validators?: string;
  /** Inline closure validator. Stored in @janus/dom's WeakMap via ref. */
  onValidate?: Validator<HTMLInputElement>;
  // ...native attrs, invalid, onValueInput, etc.
}
```

- `validators` renders directly as `data-t-validate="..."`. The dispatcher looks each name up in the registry (§12.1).
- `onValidate` is attached via a `ref` that calls `addValidator(el, fn)` and returns the cleanup to `onCleanup()`. No event listener is attached to the element — the document-level dispatcher reads from the WeakMap.

**Deliberately not props**: `validationMessage`, `validateMatch`, `validateMinFrom`, `validateMaxFrom`. Custom error messages are returned by the validator function — named or inline. Cross-field comparisons (password match, date ranges, "X must be greater than Y") are written as named validators at module load by the consumer, then referenced via `validators="..."`. The single declarative knob to learn is "register a validator, reference it by name."

If pain emerges around parameterized built-ins, the path is to add them as pre-registered named validators that read parameters from a sibling `data-*` attribute — keeping the engine's dispatcher unchanged.

### 13.5 Form wrappers

The Solid form components mirror the `@janus/dom/form` contract — each is ~5–20 LOC of attribute rendering plus a single conditional ref for the closure case.

```tsx
export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSubmit?: SubmitHandler;
  /** Name of a submit handler registered via registerSubmitHandler(). */
  submitHandler?: string;
}

export function Form(props: FormProps) {
  const [v, rest] = splitProps(props, ['onSubmit', 'submitHandler']);
  const id = props.id ?? createUniqueId();
  return (
    <FormContext.Provider value={{ id }}>
      <form
        {...rest}
        id={id}
        data-t-validate
        data-t-submit={v.submitHandler}
        noValidate
        ref={(el) => { if (v.onSubmit) onCleanup(addSubmitHandler(el, v.onSubmit)); }}
      />
    </FormContext.Provider>
  );
}
```

The ref attaches *only* when a closure is passed. Consumers using `submitHandler="name"` go through the pure attribute path with zero refs.

`FormContext` carries the form's `id` only — the single allowed Solid context per §13.1. It lets `<SubmitButton>` (and similar) render outside the `<form>` (modal footers, portals) while still targeting it via the `form={id}` attribute.

Other form components are pure attribute renderers:

```tsx
// Cross-field validation grouping
export function FormGroup(props: ComponentProps<'div'>) {
  return <div {...props} data-t-validate-group />;
}

// Form-wide error display. setFormError() finds it by data-t-form-error
export function FormError(props: ComponentProps<'div'>) {
  return (
    <div {...props}
      data-t-validate-error data-t-form-error
      role="alert" aria-atomic="true"
      class={cx('c-alert v-colors-danger', props.class)} />
  );
}

// Submit button — reads form id from context for portal/footer placement
export function SubmitButton(props: ButtonProps) {
  const ctx = useContext(FormContext);
  return <Button {...props} type="submit" form={ctx?.id ?? props.form} />;
}
```

### 13.6 Modal form

The three modal-form behaviors from §12.1 (`data-t-reset-on-close`, `data-t-close-on-success`, plus the speed-bump pattern via `data-c-modal-speed-bump`) compose into a single Solid wrapper. Defaults are opinionated — all on, individually opt-outable.

```tsx
export interface ModalFormProps extends FormProps {
  closeOnSuccess?: boolean;     // default true
  resetOnClose?: boolean;       // default true
}

export function ModalForm(props: ModalFormProps) {
  const [v, rest] = splitProps(props, ['closeOnSuccess', 'resetOnClose']);
  return (
    <Form
      {...rest}
      data-t-close-on-success={v.closeOnSuccess !== false ? '' : undefined}
      data-t-reset-on-close={v.resetOnClose !== false ? '' : undefined}
    />
  );
}
```

`<ModalSpeedBump>` is a thin wrapper around a nested `<dialog>` carrying the `data-c-modal-speed-bump` marker. The parent modal's `requestClose` dispatcher auto-discovers it via DOM — no `speedBumpId` prop, no ref:

```tsx
export interface ModalSpeedBumpProps {
  message?: JSX.Element;
  keepLabel?: JSX.Element;
  discardLabel?: JSX.Element;
}

export function ModalSpeedBump(props: ModalSpeedBumpProps) {
  return (
    <dialog class="c-modal c-modal-speed-bump" data-c-modal-speed-bump>
      <form method="dialog" class="o-stack">
        <p>{props.message ?? 'You have unsaved changes.'}</p>
        <div class="o-row">
          <button value="cancel" class="c-button">
            {props.keepLabel ?? 'Keep editing'}
          </button>
          <button value="discard" class="c-button v-colors-danger">
            {props.discardLabel ?? 'Discard'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
```

Consumer composition:

```tsx
<Modal id="signup-modal">
  <ModalForm onSubmit={handleSignup}>
    {/* fields */}
    <SubmitButton>Sign up</SubmitButton>
  </ModalForm>
  <ModalSpeedBump />
</Modal>
```

The wiring between the form, the modal, and the speed bump is **entirely DOM-driven** — the engine queries for the right ancestors / descendants at the moment they're needed. No `speedBumpId`, no callback registration, no ref dance.

What v1 drops:

| v1 | v2 |
|---|---|
| `modalFormCloseOnSuccess` (callbackAttrs registration) | `data-t-close-on-success` attribute |
| `modalFormResetOnClose` (custom afterHide callback machinery) | `data-t-reset-on-close` + capture-phase `close` listener |
| `modalFormMaybeShowSpeedBump` + explicit `speedBumpId` wiring | `data-c-modal-speed-bump` marker + DOM-discovered orchestration |
| `ModalFormContent` wrapper that splits modal vs. form props | `<Modal>` + `<ModalForm>` composed directly |

### 13.7 Porting target

The render-prop + hook shape ports mechanically:

- **React**: `createUniqueId` → `useId`; identical render-prop signature.
- **Vue 3**: render-prop becomes a scoped slot.
- **Svelte 5**: render-prop becomes a snippet prop.
- **No framework**: consumers write IDs in HTML and use `@janus/css` + `@janus/dom` directly.

No Solid-specific reactive primitive (signals, `splitProps`, etc.) leaks into the public API of `@janus/solid` beyond the prop accessors themselves. A future `@janus/react` would be near-1:1.

## 14. Explicitly dropped from v1

| Dropped | Why |
|---|---|
| `<SelectTypeahead>` / combobox | Zero call sites across all three surveyed consumers. |
| Standalone `<ListBox>` as a user-facing component | Only used inside `<Select>`. Folded into `c-styled-select`. |
| floating-ui dependency | Replaced by native anchor positioning. |
| Custom focus-trap library | `<dialog>` provides this natively. |
| Text-overflow tooltip machinery | Replaced by `t-truncate` + manual `c-tooltip` when needed. |
| Empty-state object class | Compose with stack + center. |
| Sass-style `@define-mixin` system | All composition through CSS layers + custom properties; no preprocessor mixins. |
| v1's behavior callback registry (`data-callback-*` plumbing) | Validators / submit handlers still use a registry (§12.1), but referenced by stable name from `data-t-validate` / `data-t-submit` — no per-render generated IDs. Closures go in a WeakMap. |
| `o-top-nav-layout`, `o-sidebar-layout` (whole-page layouts) | Reframed as compositions of primitives (§10.4). The realistic needs — auto-hiding top nav, sidebar-to-drawer — decompose into recipes over `o-split`, `o-container`, `c-drawer` + CSS scroll-state / container queries. |

## 15. Browser feature gates

The build assumes the following are available without fallback. Verify against the project's target Baseline before starting.

- CSS `@layer`
- CSS custom properties + `calc()`
- `color-mix()`, `light-dark()`
- `1lh` unit
- `:has()`
- Container queries (`@container`, `cqw` units)
- `<dialog>` + `showModal()`
- `popover` attribute + Popover API
- `commandfor` / `command` attributes (verify: still relatively new)
- CSS anchor positioning (`anchor-name`, `position-anchor`, `position-try`)

If `commandfor` or anchor positioning are not yet Baseline at build time, fall back to thin JS shims in `@janus/dom` (open/close handlers, JS-driven anchor math). Do NOT polyfill — shim only where the framework cannot function.

## 16. Naming & file conventions

```
packages/
  css/
    src/
      index.css                 # @layer declaration + imports
      reset.css
      base.css
      tokens/
        spacing.css             # --v-spacing knob + derivations
        color.css               # --v-color-* palette
        typography.css
        radius.css
        shadow.css
      objects/
        box.css                 # .o-box
        text-box.css            # .o-text-box
        input-box.css           # .o-input-box  (shared base for button/input/textarea)
        dialog.css              # .o-dialog
        square.css              # .o-square
        stack.css               # .o-stack
        row.css                 # .o-row
        group.css
        grid.css
        container.css           # .o-container with --o-container__max
        split.css
        centric.css             # .o-centric
        ...
      components/
        button.css              # .c-button
        card.css
        modal.css
        ...
      variants/
        colors.css              # .v-colors-* (tones consumed by c- components)
        surface.css             # .v-surface-* (chrome treatments)
        radius.css              # .v-radius-flat (cascade-step override — see §8.2)
        text.css                # .v-text-display / .v-text-meta (role-based, sparingly)
        # No .v-spacing-*, .v-input-size-*, or other t-shirt-scaled variants.
        # Consumers define those in their own CSS as semantic scopes.
      tools/
        padding.css
        flex.css
        ...
  dom/
    src/
      form/                     # form engine — §12.1
        index.ts
        validate.ts
        submit.ts
      behaviors/                # composable utilities — §12.2
        roving-focus.ts
        focus-trap.ts
        restore-focus.ts
        request-close.ts
        typeahead-filter.ts
        active-descendant.ts
        anchor-shim.ts          # only if needed per §14
      components/               # thin compositions — §12.3
        tabs.ts
        modal.ts
        drawer.ts
        popover.ts
        menu.ts
        styled-select.ts
      mount.ts                  # declarative-mode scanner
      index.ts
  solid/
    src/
      aria.ts                   # ariaize + attrs — the only cross-cutting helpers
      use-labelled-input.ts     # hook: returns {labelProps, descriptionProps,
                                #                errorProps, inputProps, ids}
      labelled-input.tsx        # LabelledInput / LabelledInline / LabelledInputGroup
      input.tsx
      button.tsx
      card.tsx
      ...
      # No prop-mod-context, no form-element-props, no auto-prop. Validators
      # live in @janus/dom's registry (§12.1); Solid components just render
      # data-t-validate attrs or ref-attach closures. See §13.
```

One CSS file per object, component, variant. No barrel `.css` files that import many siblings — the entry `index.css` is the single import point.

## 17. Reference patterns to study from v1

The implementing agent should NOT read v1 source as a template, but the following patterns are worth understanding before designing v2:

- The `0.5lh - 0.5em` line-height calibration (in v1's `o-text-box`) — preserved as the text-mode block padding formula in v2's `o-text-box` / `o-input-box` rules (see §6). Block-mode containers use plain `var(--v-spacing)`.
- The contextual variable layer (v1's `@layer variables` declared last) — preserve as the `variants` layer in v2.
- Modal's request-to-close protocol — keep the shape, drop the data-attribute registry.
- The form validation engine — same shape, leaner DOM-only API.

## 18. Success criteria

v2 is considered complete when:

- A static HTML page using only `@janus/css` renders a complete UI (buttons, cards, forms, modals via `commandfor`, dropdowns via native select) with no JS at all.
- Adding `@janus/dom` enhances forms with validation and modals with focus management — and nothing else changes visually.
- A typical element carries 1–3 classes. The 95th percentile is ≤ 5.
- The `--v-*` knob surface is ≤ 20 documented variables.
- No `t-` class sets an arbitrary numeric scale (no `t-px-2`, `t-mb-4`, etc.).
- The custom listbox / styled-select component has ≤ 1 consumer use case in mind (font picker) and is documented as such.
