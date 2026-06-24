# Janus v2 — Cascade and Variables

Part 2 of the [Janus v2 design spec](./README.md). Covers the CSS layer architecture and the custom-property variable system.

## 4. Cascade architecture

A single `@layer` declaration in the entry stylesheet establishes precedence:

```css
@layer reset, base, objects, components, variants, tools;
```

| Layer | Prefix | Purpose | Examples |
|---|---|---|---|
| `reset` | — | Normalize defaults | `*, *::before, *::after { box-sizing: border-box }` |
| `base` | — | Element-level typography, links, form defaults | `body { font-family: ... }`, `a { ... }` |
| `objects` | `o-` | Structural / layout primitives | `.o-stack`, `.o-box`, `.o-grid` |
| `components` | `c-` | Named, opinionated widgets that compose objects | `.c-button`, `.c-card`, `.c-modal` |
| `variants` | `v-` | Knob setters (scoped re-themes) | `.v-spacing-sm`, `.v-colors-primary`, `.v-surface-glass` |
| `tools` | `t-` | Surgical overrides that always win | `.t-px-0`, `.t-flex-fill`, `.t-radius-none` |

**Discipline:**
- `c-` and `o-` classes **consume** custom properties; they never set raw px/rem values. They may set derivations of properties from other properties though.
- `v-` classes **set** custom properties only. They never declare display, layout, or other structural properties.
- `t-` is the only layer permitted to set arbitrary properties directly. It is intentionally narrow (see §11).
- **Behavior names inside `data-js` mirror the same prefix scheme.** The DOM layer's single canonical attribute is `data-js="..."` (§12.2.2); each space-separated token names a behavior whose `t-`/`c-`/`p-` prefix matches the CSS class scheme. So `data-js="t-roving-focus"` for a toolkit behavior, `data-js="c-modal__close"` for a component-internal one. State-style attributes for CSS-only hooks (no JS wiring) keep the `data-v-*` form (e.g. `data-v-color-scheme="dark"`). The framework's own DOM-scanning (`mount()`) only reads the canonical `data-js`, so consumer-defined `data-foo` attributes never collide with framework dispatch.

### 4.1 Objects vs. components

Objects (`o-`) own **structure**: spacing, sizing, padding, layout, radius. They never carry visual chrome — no shadows, no hover states, no color. Some are padded containers (`o-box`, `o-input-box`); others are transparent layout primitives (`o-stack`, `o-grid`). All are pure CSS with zero JS.

Components (`c-`) own **chrome**: shadows, borders, background treatments, hover/focus states, color application. They layer these on top of objects rather than reimplementing structure. A `c-button` composes `o-input-box` for its sizing and padding, then adds hover state and outer shadow. A `c-modal` composes `o-dialog` for its radius and offset, then adds centered positioning and backdrop.

The relationship is compositional — a component *uses* an object, it doesn't replace it. A component sits **above** its objects in the cascade: objects supply the structural baseline, and the component layers chrome plus the occasional minor structural override on top. This is why the cascade declares `objects` before `components`: when both layers target the same element, component declarations win, so a component can nudge a value the object set (e.g. a `c-toggle` adjusting the track proportions it inherited from `o-input-box`) without resorting to specificity hacks or `!important`. Components should override sparingly — the point of composing an object is to inherit its structure, not to rebuild it — but when a tweak is genuinely component-specific, the cascade lets the component have the final say over the objects it builds on. (Both still yield to `variants` and `tools`, which outrank them in turn — so a radius preset or a `t-` override beats a component's value, §8.2.)

## 5. The variable system

Two tiers, plus a convention for private intermediates:

| Prefix | Tier | Who sets | Who reads | Notes |
|---|---|---|---|---|
| `--v-*` | **Root knob** | Consumers / variants / `:root` | Anything | Documented, stable, global concerns (spacing, radius, color base, typography). |
| `--o-*` | **Scoped knob** | Owning rule's `:root` defaults; outer rules redefine for descendants; consumers via inline style, scoped class, or JS | The owning rule itself | The canonical form for any externally-settable CSS knob. Used by objects, components, and variants alike — the question the cascade cares about is "is this overridable from outside?", and the answer for any exposed knob is yes. Examples: `--o-box__radius`, `--o-dialog__offset`, `--o-drawer__side`. |

**`--_*` is a private-intermediate convention**, not a formal tier. When a stylesheet needs a working variable that nothing else should read — a derived `calc()` / `color-mix()` result, an internal animation duration, a temporary holding value — prefix it with `--_`. The underscore signals "do not consume from outside this stylesheet." Janus uses it internally; consumers can use it the same way in their own CSS and never read Janus's `--_*` values.

Components don't have their own variable prefix. A component that needs to expose a CSS knob does so as `--o-{name}__{property}` — same form as objects, because what the cascade cares about is "is this externally settable?", not which class type owns the rule. Components still prefer JSX props for customization; CSS knobs are reserved for cross-cutting concerns (animation timings, exposing an inner object's knob through the component's class).

**Namespacing convention for `--o-*` knobs.** Scoped knobs are written as `--o-{name}__{property}` — a double underscore separates the namespace from the property. So `--o-box__radius`, `--o-input-box__radius`, `--o-drawer__side`. This makes the boundary unambiguous (`o-input-box` is one namespace, not three) and lets you grep `--o-input-box__` to find every knob belonging to a single thing. Root knobs (`--v-*`) don't use the boundary — they're global and not scoped to a thing.

**The override pattern.** A rule (often a variant scope) sets a *different-named* knob to redefine an inner object's appearance for its subtree. The canonical case is a radius preset (§8.2) assigning every layer's radius knob at once:

```css
.v-radius-concentric {
  --o-input-box__radius: var(--v-radius-min);
  --o-box__radius:       calc(var(--v-radius-min) + var(--v-pad-inline));
}
```

Each object reads its own knob (`.o-box { border-radius: var(--o-box__radius, var(--v-radius-min)) }`), and the preset — in the `variants` layer, which outranks `objects` — assigns it. Because no knob references *itself*, the self-reference cycle that breaks recursive `var()` cascades never arises (see §5.2). Context-aware styling still falls out: a button at the root reads the floor; the same button under a preset scope reads the preset's value.

### 5.1 Root knobs (`--v-*`)

Root knobs split into two tiers:

- **Primary knobs** have static defaults (a literal value). These are the knobs a consumer sets to define a design — font size, spacing, radius, colors. Changing a primary knob is always safe; it never depends on another knob.
- **Secondary knobs** default as derivations of primary knobs (via `var()` or `calc()`). They exist so consumers can override a specific relationship without touching the primary, but they don't *need* to be set — the defaults just work. Changing the primary automatically recomputes all its secondaries at root.

#### Primary knobs

Layout & rhythm:
- `--v-spacing` — base spacing unit (default `0.75rem`).
- `--v-radius` — window / dialog frame radius (default `0.5rem`). Used by `o-dialog`, `o-square`, and page-body framing. No longer a "chain root": per-layer radii are assigned by presets (§8.2), not derived from this by subtraction.
- `--v-radius-min` — the innermost radius floor (default `0.25rem`). Controls never round below this, so corners are never sharp. Radius presets build outward from this floor (§8).
- `--v-border-width` — base border width (default `1px`).
- `--v-input-height` — height of interactive controls (default `2.5rem`). Drives `o-input-box` and the controls layered on it. Deliberately *independent* of `--v-spacing`.

Typography (a **fluid, Utopia-style scale** — §5.4):
- `--v-font-family`
- `--v-font-family-mono`
- `--v-font-size-min` — base body size at (and below) the minimum viewport (default `1rem`).
- `--v-font-size-max` — base body size at (and above) the maximum viewport (default `1.125rem`).
- `--v-font-ratio-min` — modular-scale ratio applied at the minimum viewport (default `1.2`, a minor third). Steps above/below body multiply/divide by this.
- `--v-font-ratio-max` — modular-scale ratio applied at the maximum viewport (default `1.25`, a major third). Larger screens get a more dramatic scale.
- `--v-line-height` — base line height (default `1.5`).

Fluid-scaling viewport anchors (primary; shared by the fluid type scale and any opt-in fluid spacing, §6.5):
- `--v-viewport-min` — lower anchor; below it everything holds at its `*-min` value (default `20rem` ≈ 320px).
- `--v-viewport-max` — upper anchor; above it everything holds at its `*-max` value (default `80rem` ≈ 1280px).

The resolved base size, `--v-font-size`, is a **secondary** knob — a `clamp()` interpolating `--v-font-size-min` → `--v-font-size-max` across the viewport range (see §5.4 for the formula). Consumers set the *anchors and ratios* above; `--v-font-size` and the per-role tokens fall out. (Renamed from v1's static `--v-text-size`.)

Color:
- `--v-bg` — body / base background (default `light-dark(white, black)`).
- `--v-link` — link color.
- `--v-accent` — accent / current-action color (focus ring, selected state, primary action tint).
- `--v-muted` — de-emphasized text color.

Shadows:
- `--v-shadow-outer`, `--v-shadow-inner` — both default to `0 0 transparent` (no shadow). Split so a `.t-shadow` helper or a component variant can replace one without disturbing the other.

#### Secondary knobs

Layout & rhythm (derive from `--v-spacing`):
- `--v-pad-block` — default block padding for box objects (default `var(--v-spacing)`).
- `--v-pad-inline` — default inline padding for box objects (default `var(--v-spacing)`).
- `--v-gap-block` — default block gap (used by `o-stack`; default `var(--v-spacing)`).
- `--v-gap-inline` — default inline gap (used by `o-group`, `o-row`; default `calc(var(--v-spacing) * 0.5)`).
- `--v-control-inset` — a control's internal inline padding (text-to-border; default `var(--v-pad-inline)`, curvature-clamped on the object). Consumed by the inline-alignment modes (§6.1): edge-align uses it as the control's own padding; text-align subtracts it from the container's padding and adds it to plain-text boxes so all text lines up.

The four `--v-pad-*` / `--v-gap-*` knobs are *frozen at root* once declared — changing `--v-spacing` in a sub-tree does NOT recompute them. To re-derive them at a scope, set all five together (Janus's internal `v-spacing` mixin does this in-house, §5.3; consumers set the bundle by hand or in their own variant class).

Font sizes (each a **fluid step** on the scale — §5.4). Every token is its own `clamp()` interpolating between the viewport anchors; the per-role defaults below name the *step* the role occupies. Headings live above body, caption/code below:
- `--v-font-size` — resolved base body size, **step 0**: `clamp(--v-font-size-min, slope·vw + intercept, --v-font-size-max)`. The value the page inherits and every `1em` resolves against. Derived, not hand-set — consumers move the `*-min` / `*-max` anchors instead.
- `--v-font-size-h1` — page title (default = step **+3**).
- `--v-font-size-h2` — section heading (default = step **+2**).
- `--v-font-size-h3` — card / sub-section heading (default = step **+1**).
- `--v-font-size-h4` — default = step **0** (`var(--v-font-size)`).
- `--v-font-size-h5` — default = step **0**.
- `--v-font-size-h6` — default = step **0**.
- `--v-font-size-caption` — small text for captions, badges, tooltips (default = step **−1**). Consumed by `o-caption`.
- `--v-font-size-code` — monospace text size (default = step **−1**). Consumed by `o-code`. (Caption and code share step −1 by default; either is independently overridable — bump `--v-font-size-code` to step 0 if your mono face runs small.)

The step exponent feeds the fluid mechanism in §5.4, which expands to a `clamp(min, slope·vw + intercept, max)` per token — so an `h1` is "step +3 of the scale," fluid between the viewport anchors, *not* a fixed `1.5×` of body. The dual ratios mean the gap between levels widens on large screens (ratio approaches `--v-font-ratio-max`) and tightens on small ones (`--v-font-ratio-min`), which is the Utopia property: a calmer scale on phones, a more expressive one on desktops.

**Readability floor.** Each token's `clamp()` *minimum* (its value at `--v-viewport-min`) is floored so small steps stay legible on small screens, via a private intermediate:

```css
--_font-size-floor: min(13px, calc(var(--v-font-size-min) - 1px));
```

Text below ~13px is hard to read, so a step's min side never falls below this. When `--v-font-size-min` itself is ≤13px, the floor drops to 1px below base — otherwise caption and code would collapse onto body at the small end and lose their semantic distinction. The floor clamps only the *bottom* of the fluid range; the max side still scales up freely.

Line heights (derive from `--v-spacing`):
- `--v-line-height-h1` through `--v-line-height-h6`, `--v-line-height-caption`, `--v-line-height-code` — all default to `calc(1em + 0.5 * var(--v-spacing))`.

The line-height formula adds a fixed leading amount (half the base spacing) rather than multiplying. As font-size grows, the fixed portion becomes a smaller fraction of the total, so effective ratio drops automatically — tighter leading for headings, looser for small text. Tying the offset to `--v-spacing` means denser layouts (`v-spacing: 0.5rem`) also tighten leading, and roomier layouts loosen it.

**This composes cleanly with the fluid type scale.** Because the offset is added to `1em` — the element's *own resolved* font size — the leading tracks each fluid `clamp()` automatically at every viewport. Nothing recomputes when the type scales; an `h1` that grows from step +3-at-320px to step +3-at-1280px keeps correct leading the whole way, since `1em` is whatever the clamp currently resolves to.

The table below shows resolved values **at the minimum viewport anchor** (320px: 16px base, `--v-font-ratio-min` 1.2) and default spacing (`0.75rem` → offset `0.375rem`). Toward `--v-viewport-max` every font size grows and the steps spread further apart (ratio rises toward `--v-font-ratio-max`), but the *leading ratios* shown here only tighten slightly as the fixed offset shrinks proportionally:

| Role | Step | Font size @320px | Line height @320px | Effective ratio |
|------|------|------------------|--------------------|-----------------|
| caption / code | −1 | ~0.833rem | ~1.21rem | 1.45 |
| body | 0 | 1rem | — (`--v-line-height: 1.5`, unitless) | 1.50 |
| h3 | +1 | 1.2rem | 1.575rem | 1.31 |
| h2 | +2 | 1.44rem | 1.815rem | 1.26 |
| h1 | +3 | 1.728rem | 2.103rem | 1.22 |

Body text uses the primary `--v-line-height` (unitless `1.5`, inherits and recomputes naturally). The secondary line-height knobs are for elements that set their own font-size and need to re-declare line-height — headings in the base layer, `o-caption`, `o-code`, `o-menu-item`.

**A modular scale under the hood, semantic names on the surface.** v1 shipped `--v-font-size-sm` / `-lg` / `-xl` / `-2xl`; v2 keeps the *mechanism* of a modular scale — now a **fluid** one (§5.4, Utopia-style) — but never exposes step indices as the public API. The internal steps (−2 … +3) exist only as the math that derives the tokens; the documented surface is semantic. Heading sizes are named by level, not by relative magnitude — a consumer who wants to restyle `h2` overrides `--v-font-size-h2` (or shifts the whole ramp by changing the two ratios) without wondering whether some `xl` step also affects something else. The two non-heading tokens (`caption`, `code`) name the *kind of content*, not a position on a scale. Objects that need their own text sizing (menus, list items) define it internally via `--o-*` knobs, not by reaching for a global step. This is the "mechanism + defaults; consumers name the contexts" principle (§1) applied to type: Janus owns the scale math, consumers tune anchors/ratios and name roles.

Color (derive from `--v-bg`):
- `--v-fg` — body / base foreground. Default derives binary black-or-white contrast from `--v-bg` via the OKLCH-lightness trick:

  ```css
  --v-fg: oklch(from var(--v-bg) calc((0.5 - l) * infinity) 0 0);
  ```

  `(0.5 - l) * infinity` resolves to `+infinity` when the bg's lightness is below 0.5 (clamping the result's lightness to `1` → white) and `-infinity` when above (clamping to `0` → black). Works on any Baseline browser that supports `oklch(from …)` and `infinity`, no `@supports` branch. Consumers who want non-binary contrast (e.g. very-dark-gray instead of pure black) override `--v-fg` directly.
- `--v-link-weight-min`, `--v-accent-weight-min`, `--v-muted-weight-min` — minimum `font-weight` to apply to text using each color. Lets hue-distinguished text (e.g. a desaturated link) safely sit alongside WCAG-compliant text by bumping weight when the color alone is borderline. Default `inherit` (no bump); raise to `500` / `600` per color as needed for the chosen palette.

**No color-palette knobs at root.** Tonal variations (primary / danger / success / etc.) live as `v-colors-*` variants that re-set `--v-bg` / `--v-fg` / `--v-accent` together for a tonal subtree — see §7.

### 5.2 Where defaults live

Two rules:

1. **`:root` declares only `--v-*` defaults.** Every documented root knob lives here; nothing else does.
2. **Each object's own rule declares its own `--o-*` defaults**, derived from inherited `--v-*` (and sometimes other `--o-*`) inputs. Because the declaration sits inside the object's rule, it re-resolves at each matched element — so scoping `--v-radius` / `--v-pad-*` in a sub-tree cascades through the object's knobs without intervention.

```css
:root {
  --v-spacing:    0.75rem;
  --v-pad-block:  var(--v-spacing);
  --v-pad-inline: var(--v-spacing);
  --v-gap-block:  var(--v-spacing);
  --v-gap-inline: calc(var(--v-spacing) * 0.5);
  --v-radius:     0.5rem;
  /* …rest of §5.1 */
}

.o-box {
  --o-box__pad-block:  var(--v-pad-block);
  --o-box__pad-inline: var(--v-pad-inline);
  padding: var(--o-box__pad-block) var(--o-box__pad-inline);
  /* Radius reads its own knob (assigned by a preset, §8.2) with a floor fallback —
     no subtraction chain, no self-reference. */
  border-radius: var(--o-box__radius, var(--v-radius-min));
}
```

**Derivation timing.** Custom properties resolve `var()` references at the element where the declaration sits, not where the value is read. So a `:root { --o-box__pad-block: var(--v-pad-block) }` declaration would freeze the pad-block default at root's value; scoping `--v-pad-block` in a sub-tree would leave the frozen default stuck. Janus avoids that by writing every `--o-*` default inside its own object's rule, where the derivation re-resolves at each matched element.

**`--v-*` knobs are themselves frozen at the scope they're declared.** If a consumer scopes only `--v-spacing` in a sub-tree, the four derived `--v-pad-*` / `--v-gap-*` knobs (frozen at `:root`) do *not* recompute. To re-derive the bundle at a target scope a consumer sets the five knobs together (Janus's own CSS uses an internal `v-spacing` mixin for exactly this, §5.3 — but that mixin is an authoring convenience, not a consumer API).

**No deeper nesting.** A nested `o-box` inside an `o-box` inherits the parent's `--o-box__radius` unchanged — it does NOT shrink further. If a design genuinely needs two distinct rounded-box levels, introduce a new object (e.g. `o-panel`) with its own knob. Inventing a name is cheaper than smuggling recursion into CSS variables.

### 5.3 Composition mixins (internal to Janus)

**Mixins are an internal authoring tool, not part of the consumer-facing API.** They exist so *Janus's own CSS* can stay DRY in the one situation where a single conceptual change must set several related knobs at once based on relationships that live implicitly in other rules — e.g. expanding a fluid `clamp()` for each type step (§5.4), or re-deriving the whole spacing bundle when `--v-spacing` changes. Authoring those by hand in every place they're needed is error-prone, so Janus reaches for a mixin internally.

**Consumers should not need them.** The supported ways a consumer customizes Janus are, in order of preference:

1. **Variable overrides** — set `--v-*` knobs (on `:root` or any scope). This covers the large majority of theming.
2. **`v-` variant classes** — apply a scoped re-theme (`v-colors-*`, `v-surface-*`, a radius preset, an alignment mode).
3. **`t-` tools** — surgical per-element overrides.
4. **Plain CSS overrides** — write your own rules. Because Janus is fork-and-copy, your CSS sits in the same project and can target anything.

None of those require touching a mixin. A consumer who wants a dense scope writes the knob bundle directly (or wraps it in their own class) rather than calling Janus's internal mixin:

```css
/* Consumer CSS — set the bundle directly; no Janus mixin needed. */
.v-dense {
  --v-spacing:    0.5rem;
  --v-pad-block:  0.5rem;
  --v-pad-inline: 0.5rem;
  --v-gap-block:  0.5rem;
  --v-gap-inline: 0.25rem;
}
```

The reason the bundle must be set together is the freezing rule (§5.2): the four `--v-pad-*` / `--v-gap-*` knobs are frozen at `:root`, so changing `--v-spacing` alone won't recompute them. Internally Janus captures that exact bundle in a mixin:

```css
/* Janus-internal — the authoring shorthand behind the bundle above. */
@define-mixin v-spacing $size {
  --v-spacing:    $size;
  --v-pad-block:  $size;
  --v-pad-inline: $size;
  --v-gap-block:  $size;
  --v-gap-inline: calc($size * 0.5);
}
```

Mixins are implemented via PostCSS (`postcss-mixins`) — the same plugin the v1 codebase already runs. They expand at build time; the emitted CSS has no preprocessor footprint, so a consumer who forks the CSS package and *chooses* to reuse a mixin can — but the documented, portable path is the four mechanisms above. We don't document mixins as a customization surface, and the sync workflow (§3.2) never asks a consumer to call one.

The bar for an internal mixin is high: it must bundle a fixed set of knobs (or a fixed expansion) that *always* move together. The currently-shipped internal mixins are:

- `v-spacing $size` — the spacing bundle above (extended to carry `--v-border-width`, §6.3).
- `v-fluid $min, $max` — the Utopia-style clamp primitive: emits `clamp($min, slope·vw + intercept, $max)` between the viewport anchors (§5.4). The shared engine behind both fluid type and opt-in fluid spacing (§6.5).
- `v-font-step $n` — wraps `v-fluid` for one type step `n`, applying the per-anchor ratio powers and the readability floor (§5.4); used to define the semantic font-size tokens.
- `v-breakpoint-*` / `v-container-*` — media-/container-query wrappers (carried forward from v1's `variables/breakpoints.css`). Consumers writing their own responsive CSS use plain `@media` / `@container`.

Mixins were dropped wholesale in an earlier draft of this spec; the revised position is "internal only, used sparingly, for irreducibly-bundled knob sets and mechanical expansions" (see §14).

### 5.4 Fluid type scale (Utopia-style)

The type scale is **fluid**: every font-size token interpolates with the viewport between two anchors, following the model popularized by [Utopia.fyi](https://utopia.fyi). Two things vary across the viewport range — the **base size** (`--v-font-size-min` → `--v-font-size-max`) and the **scale ratio** (`--v-font-ratio-min` → `--v-font-ratio-max`) — so larger screens get both bigger body text *and* a more dramatic step-to-step contrast. The anchors are `--v-viewport-min` / `--v-viewport-max` (§5.1).

**The clamp formula.** Each token resolves to `clamp(min, preferred, max)`, where the preferred value is a straight line through the two anchor points (size-at-min-viewport, size-at-max-viewport):

```
slope      = (sizeMax − sizeMin) / (viewMax − viewMin)
intercept  = sizeMin − slope × viewMin
preferred  = intercept + slope × 100vw      /* slope expressed in vw */
token      = clamp(sizeMin, preferred, sizeMax)
```

Below `--v-viewport-min` the token holds at `sizeMin`; above `--v-viewport-max` it holds at `sizeMax`; between them it scales linearly. This is exactly Utopia's calculation — we adopt the mechanism, not its `--step-N` naming.

**Steps.** A "step" `n` is a power of the ratio applied to the base size, computed independently at each anchor:

```
sizeMin(n) = --v-font-size-min × pow(--v-font-ratio-min, n)
sizeMax(n) = --v-font-size-max × pow(--v-font-ratio-max, n)
```

then fed through the clamp formula above. Body is step 0; headings are +1…+3; caption/code are −1 (§5.1). Because the ratio differs per anchor, the same step is a gentler jump on small screens and a bolder one on large screens.

**The internal mixin.** Hand-writing a clamp per token (and recomputing slope/intercept) is the textbook case for an internal mixin (§5.3). `v-font-step $n` takes a step exponent and expands to the floored clamp:

```css
/* Janus-internal. CSS lacks pow(), so the ratio powers are precomputed
   constants per step; the mixin assembles them into the clamp. */
@define-mixin v-font-step $n, $min-size, $max-size {
  /* min side floored for readability (§5.1) */
  clamp(
    max(var(--_font-size-floor), $min-size),
    calc(/* intercept */ + /* slope */ * 1vw),
    $max-size
  );
}

/* tokens/typography.css uses it to define the semantic surface */
:root {
  --v-font-size:           @mixin v-font-step 0 …;   /* body, step 0 */
  --v-font-size-h1:        @mixin v-font-step 3 …;
  --v-font-size-h2:        @mixin v-font-step 2 …;
  --v-font-size-h3:        @mixin v-font-step 1 …;
  --v-font-size-caption:   @mixin v-font-step -1 …;
  --v-font-size-code:      @mixin v-font-step -1 …;
}
```

(CSS has no `pow()`, so the per-step ratio powers are precomputed numeric constants the mixin/token file carries — the only place step indices appear at all. The toolchain may also generate these at build time from the four primary knobs, mirroring `utopia-core`.) Consumers never invoke `v-font-step`; they set the anchors and ratios (§5.1) and read the semantic tokens.

**Why fluid.** A static scale forces a compromise: comfortable on a phone *or* on a wide monitor, not both. The fluid scale removes the in-between breakpoint juggling — no `@media` steps for type — and the leading formula (§5.1) rides along automatically because it's `1em`-relative. It also subsumes v1's hi-DPI font bump cleanly: the resolution gate (§6.4) nudges the *anchors*, not a frozen value.

**Fluid spacing** uses the identical mechanism and is available as an opt-in (§6.5); type is the default fluid system, space stays static unless the consumer opts in.
