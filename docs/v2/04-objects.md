# Janus v2 — Objects

Part 4 of the [Janus v2 design spec](./README.md). Covers the pure-CSS layout / structural primitives.

## 9. Objects (zero JS, pure CSS)

### 9.1 Nesting model

Janus is designed around a **four-level nesting model**. The first level always exists; the others are present as content demands.

1. **Level 1 — Frame.** The outermost rounded surface in context. Not a class — it's a *role* filled by `<body>`, or by a component like `c-modal`, `c-drawer`, `c-card` when it's the top of its stacking context. Frames read `--v-radius` (often `0` for the page body, larger for window-style modals or desktop-archetype shells).
2. **Level 2 — Section / container.** Width-bounded organizational layer. The `o-container` class. **Transparent in radius terms** — never rounded. Can carry its own *surface* (a gradient band, a tinted background) by composing with `v-surface-*`. A single frame can hold multiple containers as sibling sections (marketing example: a full-bleed hero `o-container` next to a max-width `o-container.v-container-bounded`).
3. **Level 3 — Box / card.** Rounded grouping of related components or rows of content. The `o-box` family. Reads `--o-box__radius`.
4. **Level 4 — Control / text container.** Leaf controls (`o-input-box` — buttons, inputs) and standalone prose blocks (`o-text-box`). Reads its own `--o-*-radius` knob, which the enclosing box redefines.

The four levels describe the *mental model*; the radius story for each is in §8. Container level is transparent for radius. Each object owns its own radius knob (`--o-box__radius`, `--o-input-box__radius`, etc.); a **radius preset** (§8.2) assigns those knobs per layer — there is no subtraction cascade *between* objects, and a top-level control vs. one inside a preset scope differ because the preset's scoped assignment reaches the inner one.

**Frame is two sub-roles.** For radius, "frame" splits into the **page frame** (the `<body>` in a browser viewport — usually `0`, the browser/OS rounds the window) and the **dialog frame** (`c-modal` / `c-drawer`, via `o-dialog` — rounded). A web preset keeps modals rounded while the page is square (§8.2). A **sidebar** is *not* a third frame kind: it's a level-2 `o-container` that may carry a surface (`v-surface-*`); in a narrow sidebar you generally prefer full-bleed sub-sections over nested cards (§9.3, and the card→bleed collapse).

This is a *guideline*, not a hard limit. The model deliberately does **not** auto-derive radii through arbitrary nesting depth: a nested `o-box` inside an `o-box` shares the parent's `--o-box__radius`. UI that needs two distinct rounded-box levels should introduce a new object (e.g. `o-panel`, or `o-segmented` for shared-border cells — §9.8) rather than relying on a recursive cascade (see §5.2 / §8). For uniform-radius layouts, use the `v-radius-uniform` / `v-radius-flat` preset (§8.2).

### 9.2 Box family (padded containers)

| Class | Mode | Knobs | Purpose |
|---|---|---|---|
| `o-box` | block-mode | `--o-box__radius` | Default container. Uniform block padding, nesting-math inline padding. Use when contents are other components or rows. |
| `o-text-box` | text-mode | `--o-text-box__radius` (defaults to `--o-box__radius`) | Uniform block padding (via `text-box-trim`, §6) + alignment-aware inline padding (§6.1). A *perimeter + inline-alignment* primitive — interior vertical rhythm comes from flow (§6.2), not this box. Use when contents are raw text / prose. |
| `o-input-box` | text-mode | `--o-input-box__radius` | Shared base for text-bearing leaf controls (`<button>`, `<input>`, `<textarea>`, native `<select>`). Height = `--v-input-height`. Text-mode padding. **Not** used for checkbox / radio / toggle — those have their own dimensions. |
| `o-square` | square-mode | reads `--v-radius` directly | `aspect-ratio: 1`, no padding floor, no curvature avoidance. Use for icon / avatar / 1:1 content. Can become a circle via `--v-radius: 50%`. |

### 9.3 Layout objects (transparent — no padding, no surface)

| Class | Knobs | Purpose |
|---|---|---|
| `o-stack` | `--o-stack__gap` (default `var(--v-gap-block)`) | Vertical flow with consistent gap. `display: flex; flex-direction: column; gap: var(--o-stack__gap)`. |
| `o-group` | `--o-group__gap` (default `var(--v-gap-inline)`) | Horizontal flow with consistent gap. Wraps. |
| `o-row` | `--o-row__gap` (default `var(--v-gap-inline)`) | Like `o-group` but center-aligned, used for action rows. (Renamed from v1's `o-cluster`.) |
| `o-grid` | `--o-grid__min` (default `16rem`), `--o-grid__gap-block` (default `var(--v-gap-block)`), `--o-grid__gap-inline` (default `var(--v-gap-inline)`) | Intrinsic responsive grid. See §9.3.1. |
| `o-container` | `--o-container__max` (default `none`), `--o-container__gutter` (default `var(--v-pad-inline)`) | Section / width-bounded region. The level-2 role (§9.1). Holds the inline gutter for narrow viewports plus optional max-width. **Exposes its gutter** so a child can break out full-bleed (`margin-inline: calc(-1 * var(--o-container__gutter))` — the one sanctioned negative-margin case, §6.1). Composes with `v-surface-*` to carry a section background. Transparent in radius terms — never rounded. Multiple siblings inside one frame model "sections" of a page. |
| `o-split` | — | Two-up layout (sidebar + main) that collapses below threshold. `:has()` + container query, no media queries. |
| `o-centric` | — | Centers contents within an optional max-width. (Renamed from v1's `o-center` to signal "the centering container," not "the center itself.") |

Layout objects affect flow only — no padding, no surface, no radius of their own. `o-container` is the level-2 role in the mental model: it's where consumers reach for width-bounding and section-level surfaces (see §9.1).

#### 9.3.1 `o-grid` — intrinsic responsive grid

```css
.o-grid {
  --o-grid__min:        16rem;
  --o-grid__gap-block:  var(--v-gap-block);
  --o-grid__gap-inline: var(--v-gap-inline);
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(min(var(--o-grid__min), 100%), 1fr));
  gap: var(--o-grid__gap-block) var(--o-grid__gap-inline);
}

.o-grid--fit {
  /* Collapses empty tracks — last item stretches to fill */
  grid-template-columns:
    repeat(auto-fit, minmax(min(var(--o-grid__min), 100%), 1fr));
}
```

Three knobs, one selector, intrinsically responsive — no breakpoints.

- `--o-grid__min` is the *minimum* per-cell width; the browser fits as many columns as that allows. Consumers tune per context (`.v-cards { --o-grid__min: 20rem }`).
- `min(--o-grid__min, 100%)` prevents the cell from overflowing when the container itself is narrower than the min (common gotcha).
- Default uses `auto-fill` (keeps empty tracks). `o-grid--fit` opts into `auto-fit` (collapses empty tracks; the last item stretches). Pick the modifier when you have few items and want them to fill the row.
- Gap defaults split block / inline so the `--v-gap-*` derivation flows correctly.

Fixed-column layouts (e.g. "always two columns until 600px, then four") are not an `o-grid` use case. Write the `grid-template-columns` directly in consumer CSS — `o-grid` is the intrinsic primitive; explicit-column grids are a different shape.

### 9.4 Dialog object

| Class | Knobs | Purpose |
|---|---|---|
| `o-dialog` | `--o-dialog__radius`, `--o-dialog__offset` | Applied to `<dialog>` (or any element acting as one). **Chrome only** — radius, viewport-edge breathing room (`--o-dialog__offset` defaults to `--v-spacing`), surface treatment. Position-agnostic. The positioning models — centered with backdrop, edge-anchored with slide, anchor-positioned — live on `c-modal` / `c-drawer` / `c-popover` (§10), which compose `o-dialog`'s chrome with their own positioning + transition. |

### 9.5 Typography objects

| Class | Knobs | Purpose |
|---|---|---|
| `o-caption` | `--o-caption__font-size` (default `var(--v-font-size-caption)`) | Small-text structural primitive for badges, tooltips, and similar caption-class content. Sets font-size and a matching line-height. Does **not** carry color or chrome — those belong on the composing component (`c-badge`, `c-tooltip`). |
| `o-code` | `--o-code__font-size` (default `var(--v-font-size-code)`) | Monospace text container for `<code>` and `<pre>`. Sets font-size, font-family (`--v-font-family-mono`), and a matching line-height. `<pre>` elements compose this with `o-text-box` for padded code blocks. |

### 9.6 Menu objects

| Class | Knobs | Purpose |
|---|---|---|
| `o-menu` | `--o-menu__pad-block`, `--o-menu__pad-inline` | Popover frame for dropdowns, selects, command palettes, and similar floating list containers. Structural only — radius, padding, overflow, max-height. Chrome (shadow, border, backdrop) comes from the composing component or `v-surface-*`. Typically composes with `o-dialog` when used inside a `<dialog>` / popover. |
| `o-menu-item` | `--o-menu-item__height`, `--o-menu-item__font-size` | Individual row inside an `o-menu`. Owns its own height and font-size defaults (compact relative to `--v-input-height` / `--v-font-size`). Not coupled to a global "small" token — the object defines its own proportions. Consumed by option lists, dropdown items, select options, nav menus. |

### 9.7 Bar object

| Class | Knobs | Purpose |
|---|---|---|
| `o-bar` | `--o-bar__height`, `--o-bar__pad-block`, `--o-bar__pad-inline` | Horizontal header / toolbar / app-bar strip. The **block-axis instance** of the inline-alignment principle (§6.1): it reconciles its own height and block padding with a control's intrinsic height so optical inset stays consistent. |

Three height modes — the "magic header sizes" from v1, made explicit:

1. **Text height** — tall enough for one line of text; block padding `var(--v-pad-block)` (`text-box-trim`-corrected, §6).
2. **Input height** — the bar *is* `--v-input-height` (a toolbar exactly one control tall; the control sits flush, no extra block padding).
3. **Contains-input** — tall enough to hold a control, with *reduced* block padding so the control's text sits `--v-spacing` from the bar edge: `--o-bar__pad-block: calc(var(--v-pad-block) − <control's internal block padding>)`. This is the block-axis version of text-align (§6.1); positive padding only, no negative margins.

A bar follows the subtree's `v-align-edge` / `v-align-text` mode for inline padding, exactly like a box.

### 9.8 Segmented object

| Class | Knobs | Purpose |
|---|---|---|
| `o-segmented` | `--o-segmented__divider` (default `var(--v-border-width) solid var(--v-border-color)`) | A rounded frame holding a column (or row) of **cells that share one border**, with dividers between them instead of gaps. The grouped-list / settings-group pattern (iOS-style). |

Behavior:

- The **group** is the rounded box: it owns `--o-box__radius` (outer corners) and its surface/border (via `v-surface-card` or `c-card`). Its own padding is **`0`** — the cells carry the padding. This is the "card → segment" extreme of §6.1, where the child owns the whole spacing budget.
- **Cells** are the immediate children — each effectively an `o-box` / `o-text-box` / `o-bar` that carries the padding. Adjacent cells are separated by `--o-segmented__divider` (a border on the shared edge); only the first and last cells round their outer corners (inheriting the group radius), interior corners square.
- **No gaps** — the divider replaces the gap. Use when content is a set of peer rows that read as one grouped unit (a preferences group of font settings, a list of account rows).

This is the primitive many v1 consumers hand-rolled for settings / preference groups. It's a *peer object*, not a new nesting layer — it sits at the box level and contains box-level cells.

### 9.9 Rejected from v1

- `o-empty-state` — compose with `o-stack` + `o-centric`.
- `o-badge` — structural role now handled by `o-caption`; chrome lives on `c-tag` / `c-badge` (§10.1).
- `o-frame` — level 1 is a *role*, not a class. See §9.1.
