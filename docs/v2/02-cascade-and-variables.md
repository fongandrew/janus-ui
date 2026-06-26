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

The relationship is compositional — a component *uses* an object, it doesn't replace it. A component sits **above** its objects in the cascade: objects supply the structural baseline, and the component layers chrome plus the occasional minor structural override on top. This is why the cascade declares `objects` before `components`: when both layers target the same element, component declarations win, so a component can nudge a value the object set (e.g. a `c-toggle` adjusting the track proportions it inherited from `o-input-box`) without resorting to specificity hacks or `!important`. Components should override sparingly — the point of composing an object is to inherit its structure, not to rebuild it — but when a tweak is genuinely component-specific, the cascade lets the component have the final say over the objects it builds on. (Both still yield to `variants` and `tools`, which outrank them in turn — so a `v-surface-*` variant or a `t-` override beats a component's value.)

## 5. The variable system

Two tiers, plus a convention for private intermediates:

| Prefix | Tier | Who sets | Who reads | Notes |
|---|---|---|---|---|
| `--v-*` | **Root knob** | Consumers / variants / `:root` | Anything | Documented, stable, global concerns (spacing, radius, color base, typography). |
| `--o-*` | **Scoped knob** | Owning rule's `:root` defaults; outer rules redefine for descendants; consumers via inline style, scoped class, or JS | The owning rule itself | The canonical form for any externally-settable CSS knob. Used by objects, components, and variants alike — the question the cascade cares about is "is this overridable from outside?", and the answer for any exposed knob is yes. Examples: `--o-box__radius`, `--o-dialog__offset`, `--o-grid__min`. |

**`--_*` is a private-intermediate convention**, not a formal tier. When a stylesheet needs a working variable that nothing else should read — a derived `calc()` / `color-mix()` result, an internal animation duration, a temporary holding value — prefix it with `--_`. The underscore signals "do not consume from outside this stylesheet." Janus uses it internally; consumers can use it the same way in their own CSS and never read Janus's `--_*` values.

Components expose CSS knobs in one of two forms, by ownership:

- **`--o-{name}__{property}`** when the knob belongs to an *object* the component composes and the component is merely re-exposing or re-deriving it (e.g. nudging the `o-input-box` radius it inherits). This is the common case — the question the cascade cares about is "is this externally settable?", not which class type owns the rule.
- **`--c-{component}__{property}`** when the knob is *genuinely component-specific* — it has no object behind it. Examples already in the spec: `--c-card__radius` (the full-bleed collapse target, §10.1), `--c-modal__width` (§10.2), `--c-drawer__side` (§10.2). Naming these `--c-*` keeps "this is the card's own knob, not an object's" unambiguous and greppable.

Components still prefer JSX props for customization; CSS knobs (either form) are reserved for cross-cutting concerns (animation timings, exposing an inner object's knob, a component-only dimension). The double-underscore namespace boundary (`--c-modal__width`, not `--c-modal-width`) applies to both forms.

**Namespacing convention for `--o-*` knobs.** Scoped knobs are written as `--o-{name}__{property}` — a double underscore separates the namespace from the property. So `--o-box__radius`, `--o-input-box__radius`, `--o-container__gutter`. This makes the boundary unambiguous (`o-input-box` is one namespace, not three) and lets you grep `--o-input-box__` to find every knob belonging to a single thing. Root knobs (`--v-*`) don't use the boundary — they're global and not scoped to a thing.

**The override pattern.** A rule sets a *different-named* knob to redefine an inner object's appearance for its subtree. The canonical case is the radius cascade (§8.2): a box assigns the *control* knob (a different name than its own radius), so a control inside it rounds one step deeper:

```css
.o-box {
  --o-input-box__radius: max(var(--v-radius-min), calc(var(--o-box__radius) - var(--v-pad-inline)));
}
```

Each object reads its own knob (`.o-box { border-radius: var(--o-box__radius, var(--v-radius-min)) }`), and an enclosing rule assigns it. Because a rule writes a *different* knob than it reads, no knob references *itself*, so the self-reference cycle that breaks recursive `var()` cascades never arises (see §5.2). Context-aware styling falls out: a control at the root reads one value; the same control inside a box reads a stepped-down one.

### 5.1 Root knobs (`--v-*`)

Root knobs split into two tiers:

- **Primary knobs** have static defaults (a literal value). These are the knobs a consumer sets to define a design — font size, spacing, radius, colors. Changing a primary knob is always safe; it never depends on another knob.
- **Secondary knobs** default as derivations of primary knobs (via `var()` or `calc()`). They exist so consumers can override a specific relationship without touching the primary, but they don't *need* to be set — the defaults just work. Changing the primary automatically recomputes all its secondaries at root.

#### Primary knobs

Layout & rhythm:
- `--v-spacing` — base spacing unit (default `1rem`). Keeps chrome rhythm on the 16px grid while body text sits a touch below it at a fixed 15px (see `--v-font-size-min`).
- `--v-radius` — the **max** radius, carried by the outermost frame (window / dialog); the anchor the per-layer radii step *inward* from (§8). Default `0.5rem`. Used by `o-dialog`, `o-square`, and page-body framing.
- `--v-radius-min` — the radius **floor** (default `0.25rem`). Nothing rounds below it, so corners are never sharp; the inward cascade bottoms out here (§8).
- `--v-border-width` — base border width (default `1px`).
- `--v-input-height` — height of interactive controls (default `2.5rem`). Drives `o-input-box` and the controls layered on it. Deliberately *independent* of `--v-spacing`.

Typography (a Utopia-style scale that ships **fixed by default** — the two anchors collapse to one size; fluid type is an opt-in, §5.4):
- `--v-font-family`
- `--v-font-family-mono`
- `--v-font-size-min` — base body size at (and below) the minimum viewport (default `0.9375rem` ≈ 15px).
- `--v-font-size-max` — base body size at (and above) the maximum viewport (default `0.9375rem` ≈ 15px). **By default this equals `--v-font-size-min`, so body text is a fixed 15px** — the app-appropriate default, since UI text should not resize as the window changes. Marketing/content sites opt into fluid type by spreading the two anchors apart (§5.4, §6.7); the default app config anchors a touch below v1's 16px to read as denser, app-grade UI while spacing stays on the 16px grid (`--v-spacing: 1rem`).
- `--v-font-ratio-min` — modular-scale ratio applied at the minimum viewport (default `1.2`, a minor third). Steps above/below body multiply/divide by this.
- `--v-font-ratio-max` — modular-scale ratio applied at the maximum viewport (default `1.25`, a major third). Larger screens get a more dramatic scale.
- `--v-line-height` — base line height (default `1.5`).

Fluid-scaling viewport anchors (primary; the shared engine behind opt-in fluid type and opt-in fluid spacing, §6.5 / §6.7 — inert while the size anchors are collapsed, as they are by default):
- `--v-viewport-min` — lower anchor; below it everything holds at its `*-min` value (default `20rem` ≈ 320px).
- `--v-viewport-max` — upper anchor; above it everything holds at its `*-max` value (default `80rem` ≈ 1280px).

The resolved base size, `--v-font-size`, is a **secondary** knob — a `clamp()` interpolating `--v-font-size-min` → `--v-font-size-max` across the viewport range (see §5.4 for the formula). With the default collapsed anchors the clamp degrades to a constant 15px; a consumer who spreads the anchors gets true fluid interpolation. Consumers set the *anchors and ratios* above; `--v-font-size` and the per-role tokens fall out. (Renamed from v1's static `--v-text-size`.)

Color:
- `--v-bg` — body / base background (default `light-dark(white, black)`).
- `--v-link` — link color.
- `--v-accent` — accent / current-action color (focus ring, selected state, primary action tint).
- `--v-muted` — de-emphasized text color.

Shadows (ship **lifted by default** — real multi-layer shadows, not flat; §7.0 carries the values):
- `--v-shadow-outer` — default `0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%)`. The resting outer elevation (cards, popovers). A multi-layer value reads as real depth, not a single fuzzy drop.
- `--v-shadow-inner` — default `inset 0 1px 2px 0 rgb(0 0 0 / 10%)`. The embossed-input inset.
- Split so a `.t-shadow` helper or a component variant can replace one without disturbing the other. A non-transparent default doesn't force every component to paint it — components apply the knob where they want elevation (cards at rest, buttons on hover); a component that wants none sets `box-shadow: none`.
- `--v-shadow-inner-top`, `--v-shadow-inner-bottom` — scroll-edge shadows for scrollable regions (modal/drawer bodies). Defaults `inset 0 6px 6px -4px rgb(0 0 0 / 15%)` / `inset 0 -6px 6px -4px rgb(0 0 0 / 15%)`. Toggled by `t-scroll-shadow`'s `data-scroll-top`/`-bottom` sentinels (§12.2.4).

Motion:
- `--v-duration` — the standard transition pace (default `240ms`). Components derive faster/slower paces by `calc()` (`* 0.5` for hover/active, `* 2` for extended) rather than a t-shirt scale. `prefers-reduced-motion` zeros it and everything follows.
- `--v-ease` — standard easing (default `cubic-bezier(0.4, 0, 0.2, 1)`, Material-style ease-out).

Font weights (semantic stack consumed by base styles and components; tinted-surface variants bump the whole stack ~100 — §7):
- `--v-font-weight-normal` (default `400`), `--v-font-weight-label` (`500`), `--v-font-weight-subtitle` (`600`), `--v-font-weight-strong` (`600`), `--v-font-weight-title` (`700`).
- `--v-font-weight` — the **currently-applied** weight, tracked as a custom property. CSS cannot read the inherited `font-weight` back into a variable, so any rule that sets `font-weight` from the stack above **also sets `--v-font-weight` to the same number** (base styles and components do this in tandem). Features that need to *read* the active weight — the icon-stroke ramp (§6.4 / base), the weight-floor fallback — consume `--v-font-weight`, not `font-weight`. Default `400`.

#### Secondary knobs

Layout & rhythm (derive from `--v-spacing`):
- `--v-pad-block` — default block padding for box objects (default `var(--v-spacing)`).
- `--v-pad-inline` — default inline padding for box objects (default `var(--v-spacing)`).
- `--v-gap-block` — default block gap (used by `o-stack`; default `var(--v-spacing)`).
- `--v-gap-inline` — default inline gap (used by `o-group`, `o-row`; default `calc(var(--v-spacing) * 0.5)`).
- `--v-control-inset` — a control's internal inline padding (text-to-border). Default is the **height-relative** `calc((var(--v-input-height) − 1em) / 2)` (the v1 input-box inset), *not* `var(--v-pad-inline)`: this keeps inputs balanced independent of box padding. Curvature-clamped on the object. It is also the **"inner text" reference** for inline alignment (§6.1) — the inset that lands accompanying text on a control's own text.

Inline insets (accompanying text → the box it introduces, §6.1). Because boxes don't nest (frame → box → control), these arise in exactly two places:
- `--o-field__inset` — inset for a form field's `<label>` + description, **default `var(--o-input-box__radius)`** (the control's straight edge — the v1 form look). On by default wherever a field sits, frame or box. `v-align-edge` sets it to `0`; `v-align-text` to `var(--v-control-inset)`.
- `--o-prose__inset` — inset for an `o-prose` that is a **direct child of a container holding boxes** (`o-container:has(boxes) > o-prose`), so its running text lines up with the cards beside it. **Default `var(--v-pad-inline)`** (the cards' inner-text level); a **dialog** frame uses the lighter `var(--o-box__radius)` (straight edge). Only direct children inset — prose *inside* a box takes that box's perimeter padding and stays flush, so the inset never compounds with box padding. When the prose is the container's **first/last** child its block padding grows to match (`padding-block-start`/`-end` = the inset), so the corner stays uniform. Block-box children (code, blockquote) break out by `calc(-1 * var(--o-prose__inset))`. At a **full-bleed** breakpoint (the frame's boxes break out — §6.1) this drops to `0`, and because the block padding tracks it, that drops to `0` too (flush on both edges).

The four `--v-pad-*` / `--v-gap-*` knobs are *frozen at root* once declared — changing `--v-spacing` in a sub-tree does NOT recompute them. To re-derive them at a scope, set all five together (Janus's internal `v-spacing` mixin does this in-house, §5.3; consumers set the bundle by hand or in their own variant class).

Font sizes (each a **step** on the scale — §5.4). Every token is its own `clamp()` between the viewport anchors; with the default collapsed size anchors each clamp resolves to a fixed size (it only *interpolates* once a consumer opts into fluid type). The per-role defaults below name the *step* the role occupies. Headings live above body, caption/code below:
- `--v-font-size` — resolved base body size, **step 0**: `clamp(--v-font-size-min, slope·vw + intercept, --v-font-size-max)`. The value the page inherits and every `1em` resolves against. Derived, not hand-set — consumers move the `*-min` / `*-max` anchors instead.
- `--v-font-size-h1` — page title (default = step **+3**).
- `--v-font-size-h2` — section heading (default = step **+2**).
- `--v-font-size-h3` — card / sub-section heading (default = step **+1**).
- `--v-font-size-h4` — default = step **0** (`var(--v-font-size)`).
- `--v-font-size-h5` — default = step **0**.
- `--v-font-size-h6` — default = step **0**.
- `--v-font-size-caption` — small text for captions, badges, tooltips (default = step **−1**). Consumed by `o-caption`.
- `--v-font-size-code` — monospace text size (default = step **−1**). Consumed by `o-code`. (Caption and code share step −1 by default; either is independently overridable — bump `--v-font-size-code` to step 0 if your mono face runs small.)

The step exponent feeds the scale mechanism in §5.4, which expands to a `clamp(min, slope·vw + intercept, max)` per token — so an `h1` is "step +3 of the scale," *not* a hard-coded `1.5×` of body. Under the default fixed config that step is a constant multiple of the 15px base; once a consumer opts into fluid type the dual ratios kick in, so the gap between levels widens on large screens (ratio approaches `--v-font-ratio-max`) and tightens on small ones (`--v-font-ratio-min`) — the Utopia property: a calmer scale on phones, a more expressive one on desktops.

**Readability floor.** Each token's `clamp()` *minimum* (its value at `--v-viewport-min`) is floored so small steps stay legible on small screens, via a private intermediate:

```css
--_font-size-floor: min(13px, calc(var(--v-font-size-min) - 1px));
```

Text below ~13px is hard to read, so a step's min side never falls below this. When `--v-font-size-min` itself is ≤13px, the floor drops to 1px below base — otherwise caption and code would collapse onto body at the small end and lose their semantic distinction. The floor clamps only the *bottom* of the fluid range; the max side still scales up freely.

Line heights (derive from `--v-spacing`):
- `--v-line-height-h1` through `--v-line-height-h6`, `--v-line-height-caption`, `--v-line-height-code` — all default to `calc(1em + 0.5 * var(--v-spacing))`.

The line-height formula adds a fixed leading amount (half the base spacing) rather than multiplying. As font-size grows, the fixed portion becomes a smaller fraction of the total, so effective ratio drops automatically — tighter leading for headings, looser for small text. Tying the offset to `--v-spacing` means denser layouts (`v-spacing: 0.5rem`) also tighten leading, and roomier layouts loosen it.

**Additive vs. multiplicative leading.** This `1em + constant` form is *additive* leading, and it's a general principle, not just a heading trick. Multiplicative line-height (`1.5`) makes the whitespace *between* lines grow with font size — which looks wrong when a large heading wraps next to small text (e.g. inside an `<hgroup>`, §6.2): the heading's own lines sit farther apart than the subtitle does. Additive leading gives every line, big or small, the same constant space between, which is why `<hgroup>` and the heading line-heights use it. Body copy keeps multiplicative `--v-line-height` (the conventional choice for long-form reading); the two are a deliberate per-context choice.

**This composes cleanly whether type is fixed or fluid.** Because the offset is added to `1em` — the element's *own resolved* font size — the leading tracks whatever each token's `clamp()` currently resolves to. Under the default fixed config that's a constant, so leading is simply correct per role; and if a consumer opts into fluid type, the leading tracks each fluid `clamp()` automatically at every viewport — an `h1` that grows from step +3-at-320px to step +3-at-1280px keeps correct leading the whole way, since `1em` is whatever the clamp currently resolves to. Nothing recomputes either way.

The table below shows resolved values under the **default fixed config** (15px base, ratio `1.2`, spacing `1rem` → additive offset `0.5 · 1rem` = 8px). Because type ships fixed (§5.4), these hold at *every* viewport — there is no narrow-vs-wide variation by default. A consumer who opts into fluid type gets the same roles interpolating between two such tables (a gentler one at `--v-viewport-min`, a bolder one at `--v-viewport-max`):

| Role | Step | Font size (fixed) | Line height | Effective ratio |
|------|------|-------------------|-------------|-----------------|
| caption / code | −1 | 13px *(12.5px floored up — see below)* | 21px | 1.62 |
| body | 0 | 15px | 22.5px (`--v-line-height: 1.5`, unitless) | 1.50 |
| h3 | +1 | 18px | 26px | 1.44 |
| h2 | +2 | ~21.6px | ~29.6px | 1.37 |
| h1 | +3 | ~25.9px | ~33.9px | 1.31 |

**Readability-floor caveat (carry into the Variables/Typography review).** The `--_font-size-floor` (≈13px) clamps the *bottom* of each step, so under the default config caption/code resolve to **13px**, not their pure step value of 12.5px. The smallest step is therefore slightly larger — and, because leading is additive (`1em + 8px`), its effective ratio (1.62) reads looser — than the modular scale alone implies. This is intended: at the bottom of the ramp legibility wins over scale purity. A reviewer eyeballing the type ramp should expect caption to sit a hair above its "1.2-down-from-body" position.

Body text uses the primary `--v-line-height` (unitless `1.5`, inherits and recomputes naturally). The secondary line-height knobs are for elements that set their own font-size and need to re-declare line-height — headings in the base layer, `o-caption`, `o-code`, `o-menu-item`.

**Text rhythm (derive from the *line*, not `--v-spacing`).** Vertical spacing *between* text elements scales with the line, so it stays proportional as the type scale moves — distinct from the spacing-derived `--v-gap-*` / `--v-pad-*` (§6.2). These knobs are consumed by the `o-prose` flow:

- `--o-prose__gap` — the paragraph-to-paragraph gap; a multiple of the line (e.g. `calc(<n> * var(--v-line-height) * 1em)`). Also the default for `heading → following content`.
- the **heading space-above** — the larger gap a heading owns before itself (the section break); also line-relative.
- `--o-hgroup__leading` — the constant added to `1em` for additive leading inside an `<hgroup>` (§6.2).
- `--v-list-rhythm` — a cascading switch for list-item spacing: a fraction of the prose gap ("grouped"), or `calc(var(--v-line-height) * 1em - 1cap)` ("continuous", so wrapped items share one baseline). Set once at a scope (e.g. an editor root) to flip every list.

**A modular scale under the hood, semantic names on the surface.** v1 shipped `--v-font-size-sm` / `-lg` / `-xl` / `-2xl`; v2 keeps the *mechanism* of a modular scale — now a **fluid** one (§5.4, Utopia-style) — but never exposes step indices as the public API. The internal steps (−2 … +3) exist only as the math that derives the tokens; the documented surface is semantic. Heading sizes are named by level, not by relative magnitude — a consumer who wants to restyle `h2` overrides `--v-font-size-h2` (or shifts the whole ramp by changing the two ratios) without wondering whether some `xl` step also affects something else. The two non-heading tokens (`caption`, `code`) name the *kind of content*, not a position on a scale. Objects that need their own text sizing (menus, list items) define it internally via `--o-*` knobs, not by reaching for a global step. This is the "mechanism + defaults; consumers name the contexts" principle (§1) applied to type: Janus owns the scale math, consumers tune anchors/ratios and name roles.

Color (derive from `--v-bg`):
- `--v-fg` — body / base foreground. Default derives binary black-or-white contrast from `--v-bg` via the OKLCH-lightness trick:

  ```css
  --v-fg: oklch(from var(--v-bg) calc((0.5 - l) * infinity) 0 0);
  ```

  `(0.5 - l) * infinity` resolves to `+infinity` when the bg's lightness is below 0.5 (clamping the result's lightness to `1` → white) and `-infinity` when above (clamping to `0` → black). Works on any Baseline browser that supports `oklch(from …)` and `infinity`, no `@supports` branch. Consumers who want non-binary contrast (e.g. very-dark-gray instead of pure black) override `--v-fg` directly.
- `--v-link-weight-min`, `--v-accent-weight-min`, `--v-muted-weight-min` — minimum `font-weight` to apply to text using each color. Lets hue-distinguished text (e.g. a desaturated link) safely sit alongside WCAG-compliant text by bumping weight when the color alone is borderline. **Default `500` for the shipped palette** (the bundled link/accent/muted colors need the bump); the *mechanism* falls back to `inherit` (no bump) when a consumer clears it.
- `--v-border-dynamic-base` (default `light-dark(black, white)`), `--v-border-dynamic-mix` (default `light-dark(17.5%, 50%)`), and the resolved `--v-border-color: color-mix(in hsl, var(--v-border-dynamic-base) var(--v-border-dynamic-mix), var(--v-bg))` — one recipe places every border a fixed perceptual distance from any surface, so borders read correctly on tinted cards/alerts without hard-coding a gray.
- `--v-body-bg` — the body's painted background: two low-opacity radial gradients (warm + cool) over `var(--v-bg)` (§7.0), applied with `background-attachment: fixed`. Keeps pages from reading flat.
- `--v-ring` (default `var(--v-accent)`, crisp outline) and `--v-ring-alt` (default `color-mix(in hsl, var(--v-accent) 35%, transparent)`, soft halo) — the two layers of the focus ring; `--v-shadow-focus: 0 0 0 0.125rem var(--v-ring-alt)` is the halo layer (§7 / states mixin).

> **Note on tiers.** Everything in this Color-secondary group is *derived from* `--v-bg` / `--v-accent` and exists so a consumer can break one relationship without touching the primary. The full resolved set (including the motion, weight, and scroll-shadow knobs above) is what the Variables doc page (§20.2.1) enumerates; this section is the source of truth for it.

**No color-palette knobs at root.** Tonal variations (primary / danger / success / etc.) live as `v-colors-*` variants that re-set `--v-bg` / `--v-fg` / `--v-accent` together for a tonal subtree — see §7.

### 5.2 Where defaults live

Two rules:

1. **`:root` declares only `--v-*` defaults.** Every documented root knob lives here; nothing else does.
2. **Each object's own rule declares its own `--o-*` defaults**, derived from inherited `--v-*` (and sometimes other `--o-*`) inputs. Because the declaration sits inside the object's rule, it re-resolves at each matched element — so scoping `--v-radius` / `--v-pad-*` in a sub-tree cascades through the object's knobs without intervention.

```css
:root {
  --v-spacing:    1rem;
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
     the preset does the inward step-down by writing a *different* knob, so no self-reference. */
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
2. **`v-` variant classes** — apply a scoped re-theme (`v-colors-*`, `v-surface-*`, an alignment mode).
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

Mixins are **internal only, used sparingly, for irreducibly-bundled knob sets and mechanical expansions** (see §14).

### 5.4 Type scale (Utopia-style, fluid-capable — ships fixed)

The type scale is **fluid-capable but ships fixed**: the *mechanism* is the Utopia clamp popularized by [Utopia.fyi](https://utopia.fyi), but the **default app config collapses both size anchors to one value (`--v-font-size-min == --v-font-size-max == 0.9375rem`), so every token resolves to a fixed size that does not track the viewport.** Fixed type is the right default for application UI — text shouldn't reflow-resize as you drag the window. A consumer opts into fluid type by spreading the anchors apart (and, if desired, the ratios), which is the recommended configuration for **marketing / content sites** where type is the star (§6.7). When the anchors are spread, two things vary across the viewport range — the **base size** (`--v-font-size-min` → `--v-font-size-max`) and the **scale ratio** (`--v-font-ratio-min` → `--v-font-ratio-max`) — so larger screens get both bigger body text *and* a more dramatic step-to-step contrast. The viewport anchors are `--v-viewport-min` / `--v-viewport-max` (§5.1).

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

**Why keep the fluid mechanism even though the default is fixed.** Collapsing the anchors costs nothing — `clamp(0.9375rem, …, 0.9375rem)` is a constant, no special-casing — so the same engine serves both modes. When a consumer *does* want fluid type (marketing/content), spreading the anchors removes the in-between breakpoint juggling — no `@media` steps for type — and the leading formula (§5.1) rides along automatically because it's `1em`-relative. The hi-DPI font bump (§6.4) works in either mode: it nudges the *anchors* together, so it raises a fixed size or shifts a fluid range without special-casing.

**Both type and spacing ship fixed; fluidity is opt-in per axis.** Spacing stays static unless the consumer opts in (§6.5), and type does the same — the default app config keeps the type anchors collapsed. Fluid type is the recommended expression for marketing/content sites (§6.7), not the out-of-the-box default.

### 5.5 Axes of sizing & choosing a signal

Fluid type (§5.4) solves exactly one sizing problem — *legibility vs. viewport width* — which is why it is **opt-in, not the default**: binding text size to viewport width is a trap for app UI, where a toolbar should not grow when you drag the window wider. The default collapses the type anchors to a fixed 15px and lets the consumer rebind the legibility axis to a continuous signal only when that's wanted (marketing/content). The system stays flexible because sizing decomposes into **three independent axes**, and each axis is driven by a **signal you choose** — the framework never assumes which.

**The three axes.** They move independently; conflating them is what makes a design system rigid.

| Axis | Controls | Knob(s) | Typical driver |
|---|---|---|---|
| **Legibility** | how big text is | `--v-font-size-min` / `-max` (and the ramp) | device class / viewport / user preference |
| **Density** | how tight the chrome is — padding, gaps, control height, borders | `--v-spacing` bundle, `--v-input-height`, `--v-border-width` (§6.6) | UI *role* + device — usually **not** viewport |
| **Expressiveness** | how dramatic the type ramp is | `--v-font-ratio-min` / `-max` | brand |

**The two signals.** Anything that varies a value does so off one of these:

- **Continuous size** — `vw` (viewport) or `cqw` (container). Fluid, breakpoint-free. The Utopia mechanism (§5.4).
- **Discrete context** — a scope class (role), a `@media` feature (`resolution`, `pointer: coarse`, a device-class breakpoint), or a `@container` branch. Stepwise.

**The load-bearing property: knobs are signal-agnostic.** Every knob is a custom property, and the *value expression* is where the signal lives — the knob itself is inert about it:

```css
--v-font-size-min: 1rem;                              /* no signal — fixed   */
--v-font-size:     clamp(1rem, …vw…, 1.125rem);       /* viewport (Utopia)   */
.v-toolbar  { --v-spacing: 0.375rem; }               /* role scope          */
@container (max-width: 30rem) { … --v-spacing: … }   /* container size      */
@media (pointer: coarse)      { … --v-input-height:…}/* device class        */
```

Because the framework never hard-codes the binding, you rebind any axis to any signal per project without fighting the cascade. Utopia is *one available expression* for the legibility axis, not the default — **the default ships the anchors collapsed (`--v-font-size-min == --v-font-size-max == 0.9375rem`), a fixed scale with no viewport signal**; spreading the anchors opts the legibility axis onto the viewport signal. **Choosing a sizing strategy = choosing, per axis, which signal drives it.** See §6.7 for the recipes that fall out for marketing sites, desktop apps, and web apps.
