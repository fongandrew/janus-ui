# Janus v2 — Objects

Part 4 of the [Janus v2 design spec](./README.md). Covers the pure-CSS layout / structural primitives.

## 9. Objects (zero JS, pure CSS)

### 9.1 Nesting model

Janus is designed around a **four-level nesting model**. The first level always exists; the others are present as content demands.

1. **Level 1 — Frame.** The outermost rounded surface in context. Not a class — it's a *role* filled by `<body>`, or by a component like `c-modal`, `c-drawer`, `c-card` when it's the top of its stacking context. Frames read `--v-radius` (often `0` for the page body, larger for window-style modals or desktop-archetype shells).
2. **Level 2 — Section / container.** Width-bounded organizational layer. The `o-container` class. **Transparent in radius terms** — never rounded. Can carry its own *surface* (a gradient band, a tinted background) by composing with `v-surface-*`. A single frame can hold multiple containers as sibling sections (marketing example: a full-bleed hero `o-container` next to a max-width `o-container.v-container-bounded`).
3. **Level 3 — Box / card.** Rounded grouping of related components or rows of content. The `o-box` family. Reads `--o-box__radius`.
4. **Level 4 — Control / text container.** Leaf controls (`o-input-box` — buttons, inputs) and standalone prose blocks (`o-text-box`). Reads its own `--o-*-radius` knob, which the enclosing box redefines.

The four levels describe the *mental model*; the radius story for each is in §8. Container level is transparent for radius. Each object owns its own radius knob (`--o-box__radius`, `--o-input-box__radius`, etc.); the **radius cascade** (§8.2, always on) assigns those knobs, stepping each level *inward* from the frame by the padding/inset between it and its parent (floored at `--v-radius-min`). So radius tracks **nesting depth** — the same control rounds less the deeper it sits — and a box re-derives its own children's control knob from its (already-stepped) radius.

**Frame is two sub-roles.** For radius, "frame" splits into the **page frame** (the `<body>` in a browser viewport — usually `0`, the browser/OS rounds the window) and the **dialog frame** (`c-modal` / `c-drawer`, via `o-dialog` — rounded). Painting the frame radius is a per-frame choice (§8.1), so a web app keeps modals rounded while the page itself is square. A **sidebar** is *not* a third frame kind: it's a level-2 `o-container` that may carry a surface (`v-surface-*`); in a narrow sidebar you generally prefer full-bleed sub-sections over nested cards (§9.3, and the card→bleed collapse).

This is a *guideline*, not a hard limit. The model deliberately does **not** auto-derive radii through arbitrary nesting depth: a nested `o-box` inside an `o-box` shares the parent's `--o-box__radius`. UI that needs two distinct rounded-box levels should introduce a new object (e.g. `o-panel`, or `o-segmented` for shared-border cells — §9.8) rather than relying on a recursive cascade (see §5.2 / §8). For a uniform radius everywhere, set `--v-radius-min == --v-radius` (§8.4).

### 9.2 Box family (padded containers)

| Class | Mode | Knobs | Purpose |
|---|---|---|---|
| `o-box` | block-mode | `--o-box__radius` | Default container. Uniform block padding, nesting-math inline padding. Use when contents are other components or rows. |
| `o-text-box` | text-mode | `--o-text-box__radius` (defaults to `--o-box__radius`) | Uniform block padding (via `text-box-trim`, §6) + perimeter inline padding floored at its **own** corner radius so text clears the curve (§6.1, the straight-edge principle applied to a box's own contents). A *perimeter + inline-alignment* primitive — interior vertical rhythm comes from flow (§6.2), not this box. Use when contents are raw text / prose. |
| `o-input-box` | text-mode | `--o-input-box__radius` | Shared base for text-bearing leaf controls (`<button>`, `<input>`, `<textarea>`, native `<select>`). Height = `--v-input-height`. Text-mode padding. **Not** used for checkbox / radio / toggle — those have their own dimensions. |
| `o-square` | square-mode | reads `--v-radius` directly | `aspect-ratio: 1`, no padding floor, no curvature avoidance. Use for icon / avatar / 1:1 content. Can become a circle via `--v-radius: 50%`. |

### 9.3 Layout objects (transparent — no padding, no surface)

| Class | Knobs | Purpose |
|---|---|---|
| `o-stack` | `--o-stack__gap` (default `var(--v-gap-block)`) | Vertical flow with consistent gap. `display: flex; flex-direction: column; gap: var(--o-stack__gap)`. |
| `o-group` | `--o-group__gap` (default `var(--v-gap-inline)`) | Horizontal flow with consistent gap. Wraps. |
| `o-row` | `--o-row__gap` (default `var(--v-gap-inline)`) | Like `o-group` but center-aligned, used for action rows. (Renamed from v1's `o-cluster`.) |
| `o-grid` | `--o-grid__min` (default `16rem`), `--o-grid__gap-block` (default `var(--v-gap-block)`), `--o-grid__gap-inline` (default `var(--v-gap-inline)`) | Intrinsic responsive grid. See §9.3.1. |
| `o-container` | `--o-container__max` (default `none`), `--o-container__gutter` (default `var(--v-pad-inline)`) | Section / width-bounded region. The level-2 role (§9.1). Holds the inline gutter for narrow viewports plus optional max-width. **Exposes its gutter** so a child can break out full-bleed (`margin-inline: calc(-1 * var(--o-container__gutter))` — the sanctioned negative-margin case, §6.1). It's also a **query container** (`container-type: inline-size`, the shared `frame` name it shares with `o-dialog`), so the *same* `@container` rule full-bleeds its boxes when **it** is narrow that full-bleeds a dialog's boxes when the dialog is narrow — one mechanism, both frames (§6.1 full-bleed, §10 `c-card`/`c-modal`). Composes with `v-surface-*` to carry a section background. Transparent in radius terms — never rounded. Multiple siblings inside one frame model "sections" of a page. |
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

**The dialog frame is the scroll container, and it is transparent.** `o-dialog` carries the border, the radius, and the shadow, but **no background of its own** — the surface color and the rounded corners come from the *surfaces* tiled inside it: a header that rounds the **top** corners and a body that rounds the **bottom** and grows to fill (`flex: 1 0 auto`, so there is never an unfilled gap below the content). This is load-bearing, not incidental. A solid background *on the scroll element* is painted past its radius during the overscroll rubber-band — square corners, or a visible band where the rounding should be — and a separate opaque frame *behind* the scroller only relocates the problem (it shows through a two-tone glass header at the corners). A transparent scroller with self-rounding surfaces is the only arrangement that keeps the corners under overscroll while preserving the bounce (`overscroll-behavior: contain`, never `none`; the page behind is locked with `body:has(:modal) { overflow: hidden }`). Any `backdrop-filter` surface that reaches a rounded edge must round its **own** outer corners — a compositing layer escapes the ancestor's clip. (This mirrors the proven structure in the Mind-the-Gap consumer's `.c-modal__view`.)

### 9.5 Typography objects

| Class | Knobs | Purpose |
|---|---|---|
| `o-prose` | `--o-prose__gap` (the prose/line-based gap), `--o-prose__inset` (inline text inset) | **Running-text flow.** A block-flow container for prose whose interior rhythm is *boundary-owned* (§6.2): every gap is a `margin-block-start` on the lower element, valued by what's above — body↔body & heading→content get the prose gap; content→heading gets the heading's space-above. It also opts its **immediate text children** into `text-box-trim` (the one container that signals "this is running text"), so the same object owns both the trim and the rhythm. When it's a **direct child of a container that holds boxes**, that container insets its text by `--o-prose__inset` (default `--v-pad-inline`; a dialog uses the radius) to line up with the cards (§6.1) — growing the block padding to match at the container's first/last child, and letting **block-box children** (code, blockquote) break back out; inside a box it stays flush. Use it instead of hanging base-layer margins off raw `h*`/`p`. |
| `<hgroup>` (styled) | `--o-hgroup__leading` | **Title + subtitle as one unit.** Uses *additive* leading (`line-height = 1em + constant`) so the whitespace between lines stays constant across the title/subtitle size difference, and trims **only the group's outer edges** (`trim-start` on the first child, `trim-end` on the last) so the title↔subtitle boundary keeps its half-leading and reads continuous with no margin (§6.2). The only place a heading sits tight to following text. |
| `o-caption` | `--o-caption__font-size` (default `var(--v-font-size-caption)`) | Small-text structural primitive for badges, tooltips, and similar caption-class content. Sets font-size and a matching line-height. Does **not** carry color or chrome — those belong on the composing component (`c-badge`, `c-tooltip`). |
| `o-code` | `--o-code__font-size` (default `var(--v-font-size-code)`) | Monospace text container for `<code>` and `<pre>`. Sets font-size, font-family (`--v-font-family-mono`), and a matching line-height. `<pre>` elements compose this with `o-text-box` for padded code blocks. Because `<pre>` carries its own padding, it gets `text-box-trim: trim-both` (the padded-box rule, §6) — its padding also absorbs the trimmed cap/descender overshoot, so horizontal `overflow` doesn't clip the first/last line. |

`o-text-box` remains the *perimeter + inline-alignment* primitive; `o-prose` is what you reach for when the box holds **multiple** flowing text elements and you want the boundary-owned rhythm. (A bare `o-text-box` with one block of text needs neither.)

**List rendering.** The `base` layer indents any `ul`/`ol` by `1em` — em-relative, so it **compounds per nesting level** (each nested list indents proportionally to its own, possibly smaller, text). `o-prose` adds **depth-cycled markers** on top, each cycle repeating every three levels. `ul` cycles the native `list-style-type`: disc → circle → square. `ol` drops the native marker (`list-style: none`) for a **custom counter** (`li::before { content: counter(item, …) "." }`) so ordered markers are tabular-figure, right-aligned, and **hang flush** with the list's left edge: the marker box spans the list's left padding and is pulled into it with a matching *negative inline margin* — a negative margin, not a `transform`, because it must move flow so the item text stays flush at the content edge — and that padding widens with the marker's digit count. The counter *style* cycles decimal → lower-alpha → lower-roman. (Carried from the Slip Switch consumer's editor styling, where ordered-list cycling was proven; the bare `1em` base rule is its baseline.)

### 9.6 Menu objects

| Class | Knobs | Purpose |
|---|---|---|
| `o-menu` | `--o-menu__pad-block`, `--o-menu__pad-inline` | Popover frame for dropdowns, selects, command palettes, and similar floating list containers. Structural only — radius, padding, overflow, max-height. Chrome (shadow, border, backdrop) comes from the composing component or `v-surface-*`. Typically composes with `o-dialog` when used inside a `<dialog>` / popover. |
| `o-menu-item` | `--o-menu-item__height`, `--o-menu-item__font-size` | Individual row inside an `o-menu`. Owns its own height and font-size defaults (compact relative to `--v-input-height` / `--v-font-size`). Not coupled to a global "small" token — the object defines its own proportions. Consumed by option lists, dropdown items, select options, nav menus. |

### 9.7 Bar object

| Class | Knobs | Purpose |
|---|---|---|
| `o-bar` | `--o-bar__height`, `--o-bar__pad-block`, `--o-bar__pad-inline` | Horizontal header / toolbar / app-bar strip. The **block-axis instance** of the inline-alignment principle (§6.1): it reconciles its own height and block padding with a control's intrinsic height so optical inset stays consistent. |

The bar reconciles its height and padding with a control's intrinsic height, keeping block and inline padding **symmetric** so a control's reference point — its border, or with reduced padding its text — lands at the same optical inset on both axes. (An asymmetric bar — more padding on the sides than the top — reads wrong on filled buttons.) Common sizings:

1. **Text height** — tall enough for one line of text; padding `var(--v-pad-block)` (`text-box-trim`-corrected, §6).
2. **Input height** — the bar *is* `--v-input-height` (a toolbar exactly one control tall; the control sits flush).
3. **Contains-input** — holds a control with *reduced* padding so the control's **text** (not its border) sits `--v-spacing` from the bar edge — the same border-vs-text choice as §6.1, here resolved by the bar's own padding rather than a child's inset. A bar of filled buttons keeps full symmetric padding instead, so the border lands at the inset on both axes. Positive padding only, no negative margins.

**Frame corners are occupied, not padded around (§8.5).** A bar on a painted frame corner can't pad its content out of a large curve without wrecking alignment, so instead it **puts a round control in the corner** — a leading icon button (sidebar/menu trigger) on a window header, a leading icon + close button on a dialog — and lets the brand/title sit clear *after* it (the trailing primary action, a pill at large radius, takes the opposite corner). Padding stays normal and symmetric; the corner control is the design answer, and it's frame-level only (never nested boxes).

### 9.8 Segmented object

| Class | Knobs | Purpose |
|---|---|---|
| `o-segmented` | `--o-segmented__divider` (default `var(--v-border-width) solid var(--v-border-color)`) | A rounded frame holding a column (or row) of **cells that share one border**, with dividers between them instead of gaps. The grouped-list / settings-group pattern (iOS-style). |

Behavior:

- The **group** is the rounded box: it owns `--o-box__radius` (outer corners) and its surface/border (via `v-surface-card` or `c-card`). Its own padding is **`0`** — the cells carry the padding. The "card → segment" pattern: the group owns only the radius/border, and each cell owns its full inline padding.
- **Cells** are the immediate children — each effectively an `o-box` / `o-text-box` / `o-bar` that carries the padding. Adjacent cells are separated by `--o-segmented__divider` (a border on the shared edge); only the first and last cells round their outer corners (inheriting the group radius), interior corners square.
- **No gaps** — the divider replaces the gap. Use when content is a set of peer rows that read as one grouped unit (a preferences group of font settings, a list of account rows).

This is the primitive many v1 consumers hand-rolled for settings / preference groups. It's a *peer object*, not a new nesting layer — it sits at the box level and contains box-level cells.

### 9.9 Rejected from v1

- `o-empty-state` — compose with `o-stack` + `o-centric`.
- `o-badge` — structural role now handled by `o-caption`; chrome lives on `c-tag` / `c-badge` (§10.1).
- `o-frame` — level 1 is a *role*, not a class. See §9.1.
