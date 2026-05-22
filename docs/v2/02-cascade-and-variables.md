# Janus v2 — Cascade and Variables

Part 2 of the [Janus v2 build plan](./README.md). Covers the CSS layer architecture and the custom-property variable system.

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
