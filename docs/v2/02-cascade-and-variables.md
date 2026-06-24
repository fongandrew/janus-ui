# Janus v2 — Cascade and Variables

Part 2 of the [Janus v2 design spec](./README.md). Covers the CSS layer architecture and the custom-property variable system.

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
- **Behavior names inside `data-js` mirror the same prefix scheme.** The DOM layer's single canonical attribute is `data-js="..."` (§12.2.2); each space-separated token names a behavior whose `t-`/`c-`/`p-` prefix matches the CSS class scheme. So `data-js="t-roving-focus"` for a toolkit behavior, `data-js="c-modal__close"` for a component-internal one. State-style attributes for CSS-only hooks (no JS wiring) keep the `data-v-*` form (e.g. `data-v-color-scheme="dark"`). The framework's own DOM-scanning (`mount()`) only reads the canonical `data-js`, so consumer-defined `data-foo` attributes never collide with framework dispatch.

### 4.1 Objects vs. components

Objects (`o-`) own **structure**: spacing, sizing, padding, layout, radius. They never carry visual chrome — no shadows, no hover states, no color. Some are padded containers (`o-box`, `o-input-box`); others are transparent layout primitives (`o-stack`, `o-grid`). All are pure CSS with zero JS.

Components (`c-`) own **chrome**: shadows, borders, background treatments, hover/focus states, color application. They layer these on top of objects rather than reimplementing structure. A `c-button` composes `o-input-box` for its sizing and padding, then adds hover state and outer shadow. A `c-modal` composes `o-dialog` for its radius and offset, then adds centered positioning and backdrop.

The relationship is compositional — a component *uses* an object, it doesn't replace it. This is why the cascade declares `components` before `objects`: when both layers target the same element, object declarations (structural) win over component declarations, ensuring that the structural skeleton stays consistent regardless of which chrome is applied on top.

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

Typography:
- `--v-font-family`
- `--v-font-family-mono`
- `--v-font-size` — base font size (default `1rem`). (Renamed from v1's `--v-text-size`.)
- `--v-line-height` — base line height (default `1.5`).

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

The four `--v-pad-*` / `--v-gap-*` knobs are *frozen at root* once declared — changing `--v-spacing` in a sub-tree does NOT recompute them. The `v-spacing` mixin (§5.3) sets all five together; consumers who'd rather avoid the mixin set the bundle by hand.

Font sizes (derive from `--v-font-size`):
- `--v-font-size-h1` — page title (default `max(var(--_font-size-floor), calc(var(--v-font-size) * 1.5))`).
- `--v-font-size-h2` — section heading (default `max(var(--_font-size-floor), calc(var(--v-font-size) * 1.25))`).
- `--v-font-size-h3` — card / sub-section heading (default `max(var(--_font-size-floor), calc(var(--v-font-size) * 1.125))`).
- `--v-font-size-h4` — default `var(--v-font-size)`.
- `--v-font-size-h5` — default `var(--v-font-size)`.
- `--v-font-size-h6` — default `var(--v-font-size)`.
- `--v-font-size-caption` — small text for captions, badges, tooltips (default `max(var(--_font-size-floor), calc(var(--v-font-size) * 0.8125))`). Consumed by `o-caption`.
- `--v-font-size-code` — monospace text size (default `max(var(--_font-size-floor), calc(var(--v-font-size) * 0.875))`). Consumed by `o-code`.

All derived font-size knobs apply a readability floor via a private intermediate:

```css
--_font-size-floor: min(13px, calc(var(--v-font-size) - 1px));
```

Text below 13px is hard to read, so derived sizes clamp there. But when `--v-font-size` itself is ≤13px, the floor drops to 1px below base — otherwise caption and code would collapse to the same size as body and lose their semantic distinction.

Line heights (derive from `--v-spacing`):
- `--v-line-height-h1` through `--v-line-height-h6`, `--v-line-height-caption`, `--v-line-height-code` — all default to `calc(1em + 0.5 * var(--v-spacing))`.

The line-height formula adds a fixed leading amount (half the base spacing) rather than multiplying. As font-size grows, the fixed portion becomes a smaller fraction of the total, so effective ratio drops automatically — tighter leading for headings, looser for small text. Tying the offset to `--v-spacing` means denser layouts (`v-spacing: 0.5rem`) also tighten leading, and roomier layouts loosen it.

At default spacing (`0.75rem`), the offset is `0.375rem`:

| Role | Font size | Line height | Effective ratio |
|------|-----------|-------------|-----------------|
| caption | 0.8125rem | 1.1875rem | 1.46 |
| code | 0.875rem | 1.25rem | 1.43 |
| body | 1rem | — (`--v-line-height: 1.5`, unitless) | 1.50 |
| h3 | 1.125rem | 1.5rem | 1.33 |
| h2 | 1.25rem | 1.625rem | 1.30 |
| h1 | 1.5rem | 1.875rem | 1.25 |

Body text uses the primary `--v-line-height` (unitless `1.5`, inherits and recomputes naturally). The secondary line-height knobs are for elements that set their own font-size and need to re-declare line-height — headings in the base layer, `o-caption`, `o-code`, `o-menu-item`.

**No t-shirt font-size scale.** v1 shipped `--v-font-size-sm` / `-lg` / `-xl` / `-2xl`; v2 replaces them with semantic tokens tied to their purpose. Heading sizes are named by level, not by relative magnitude — a consumer who wants to restyle `h2` overrides `--v-font-size-h2` without wondering whether `xl` also affects something else. The two non-heading tokens (`caption`, `code`) name the *kind of content*, not a position on a scale. Objects that need their own text sizing (menus, list items) define it internally via `--o-*` knobs, not by reaching for a global size step.

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

**`--v-*` knobs are themselves frozen at the scope they're declared.** If a consumer scopes only `--v-spacing` in a sub-tree, the four derived `--v-pad-*` / `--v-gap-*` knobs (frozen at `:root`) do *not* recompute. The `v-spacing` mixin (§5.3) bundles the five knobs so a single declaration re-derives all of them at the target scope.

**No deeper nesting.** A nested `o-box` inside an `o-box` inherits the parent's `--o-box__radius` unchanged — it does NOT shrink further. If a design genuinely needs two distinct rounded-box levels, introduce a new object (e.g. `o-panel`) with its own knob. Inventing a name is cheaper than smuggling recursion into CSS variables.

### 5.3 Composition mixins

Janus does *not* ship a general-purpose mixin system (cf. v1's overuse). It ships a small number of named mixins for the specific case where a single conceptual change must set multiple related knobs together — without a mixin, the consumer has to remember the whole bundle every time.

The canonical example is the spacing scale: changing `--v-spacing` alone does nothing useful, because the four derived `--v-pad-*` / `--v-gap-*` knobs are frozen at root. One mixin solves it:

```css
@define-mixin v-spacing $size {
  --v-spacing:    $size;
  --v-pad-block:  $size;
  --v-pad-inline: $size;
  --v-gap-block:  $size;
  --v-gap-inline: calc($size * 0.5);
}

/* Consumer */
.v-dense {
  @mixin v-spacing 0.5rem;
}
```

Mixins are implemented via PostCSS (`postcss-mixins`) — the same plugin the v1 codebase already runs. They expand at build time; the emitted CSS has no preprocessor footprint.

The bar for shipping a new mixin is high: it must bundle a fixed set of knobs that *always* move together. One-off helpers belong in consumer CSS, not the framework. The currently-shipped mixins are:

- `v-spacing $size` — the spacing bundle above.
- `v-breakpoint-*` / `v-container-*` — media-/container-query wrappers (carried forward from v1's `variables/breakpoints.css`).

Mixins were dropped wholesale in an earlier draft of this spec; the revised position is "use sparingly, only for irreducibly-bundled knob sets" (see §14).
