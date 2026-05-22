# Janus v2 — Objects

Part 4 of the [Janus v2 build plan](./README.md). Covers the pure-CSS layout / structural primitives.

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
