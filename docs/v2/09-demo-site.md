# Janus v2 — Demo Site

Part 9 of the [Janus v2 design spec](./README.md). Covers the demo / marketing site that ships alongside the library.

The demo site serves two roles: a short marketing page explaining what Janus is and how to adopt it, and a live playground for exploring the design system's knobs, colors, and components.

## 19. Site architecture

**SSR-first.** Every page renders server-side. This inverts the v1 default (where SPA was the norm and SSR was a special page). The top nav shell, config modal, and sidebar are all SSR — they work without JS via the callback-attrs progressive enhancement pattern (§12). SPA interactivity exists only as **islands**: hydrated regions inside otherwise-static content.

**Multi-page Vite app.** Same pattern as v1 — one HTML entry point per page at the repo root, each pointing at a TSX entry in `src/`. The `vite-plugin-ssg.ts` plugin (§3.1) handles SSR rendering at build time.

**Navigation.** A top nav bar with links to each page plus a config-modal trigger. The nav is rendered server-side; the current-page indicator is resolved at SSR time from the entry point path.

## 20. Pages

### 20.1 Home

The landing page. Explains what Janus is and how to use it.

**Content:**

- **Headline + tagline.** One sentence: CSS-first design system, fork-and-copy, modern browsers.
- **Pseudo-package overview.** Brief description of the four pseudo-packages (`css/`, `utils/`, `dom/`, `solid/`) and the consumer profiles from §3.1 (static site → CSS only; vanilla JS app → CSS + utils + dom; Solid SPA → all four).
- **Design philosophy highlights.** Knobs over utilities, semantic names, small public surface, framework-agnostic core — pulled from §1.
- **Visual samples.** A card with surface treatment, a form with a few inputs, a button row — just enough to show the system in action, not a full component catalog.
- **Navigation cards.** Links to Components, Typography, Colors, and the SPA demo, each with a one-line description.

### 20.2 Components

The component catalog — the primary exploration surface.

**Layout:** Sidebar + main content area, same structural pattern as v1 but using v2 primitives (`o-split` for the sidebar/main split, `c-drawer` for the mobile collapse — see §10.4's sidebar recipe).

**Sidebar (SSR):** Grouped nav listing all components from §10 (buttons, cards, alerts, inputs, selects, modals, menus, tabs, etc.). Sidebar highlight tracks the scroll position of the main content.

**Main content:** An `o-grid` of component demo cards. Each card shows the component in a realistic context with enough variants to demonstrate the knob system. Roughly the same roster as v1's demos, reorganized to match v2's component list:

- Pure CSS components (§10.1): buttons, cards, alerts, inputs, checkboxes, radios, toggles, tags, badges, disclosure, tooltips
- Browser-primitive components (§10.2): tabs, modals, drawers, popovers, menus
- Composite (§10.3): styled select
- Form patterns: validation groups, form submit, labelled controls

### 20.3 Typography

Showcase of the typography system.

**Content:**

- Heading levels h1–h6 with their semantic font-size tokens (`--v-font-size-h1` through `-h6`)
- Body paragraphs demonstrating `--v-font-size` and `--v-line-height`
- Caption text (`--v-font-size-caption`) and code text (`--v-font-size-code`)
- Lists (ordered, unordered, nested), blockquotes, tables
- `<pre>` / `<code>` blocks
- A reference table showing each token's default value and effective ratio (from §5.1's line-height table)

### 20.4 Colors

Color system showcase + interactive playground.

**Section 1 — Contrast grid (SSR).** The existing APCA contrast display carried forward from v1: a grid of `v-colors-*` variant boxes, each showing foreground text with APCA Lc scores and pass/fail indicators against the silver-level font-weight tables. Covers: `v-colors-card`, `v-colors-default`, `v-colors-code`, `v-colors-pre`, `v-colors-popover`, `v-colors-tooltip`, `v-colors-primary`, `v-colors-secondary`, `v-colors-callout`, `v-colors-highlight`, `v-colors-input`, `v-colors-success`, `v-colors-warning`, `v-colors-danger`.

**Section 2 — Color playground (island).** An interactive region for experimenting with the v2 color model. This section is a hydrated island inside the otherwise-SSR page.

Controls — text inputs (not color pickers) for the four settable root color knobs:

| Knob | Default (light) | Notes |
|---|---|---|
| `--v-bg` | `light-dark(white, black)` | Body background |
| `--v-link` | palette-dependent | Link color |
| `--v-accent` | palette-dependent | Focus ring, selected state, primary action |
| `--v-muted` | palette-dependent | De-emphasized text |

`--v-fg` is shown as a **read-only computed value** — it auto-derives from `--v-bg` via the OKLCH lightness formula (§5.1). The display shows the resolved color so the user can see the binary flip.

**Preview area.** A scoped region (not the whole page) where the custom color values apply. Contains:

- A representative card with body text, a link, muted text, and an accent-colored element
- The `v-colors-*` variant grid (smaller version) so users can see how tonal variants cascade from the changed root knobs
- APCA contrast ratios recalculated live for each fg/bg pairing
- The `*-weight-min` fallback indicators (§7.1) — shows when a color's contrast would require a font-weight bump

Text inputs accept any valid CSS color value (`hsl(...)`, `oklch(...)`, named colors, hex). The playground does not persist to localStorage — it's an ephemeral exploration tool. (Persistent color changes belong in consumer CSS, not a runtime setting.)

### 20.5 SPA

Demonstrates the SSR + island architecture pattern.

**Structure:**

- The page itself is SSR, like every other page
- Explanatory text above the island describes the architecture: SSR shell for the page chrome, hydrated island for interactive content
- The main content area contains a **hydrated SPA island** that hosts a subset of the component demos with full client-side interactivity (signals, reactivity, client-side routing within the island)
- The config modal, sidebar, and top nav remain SSR — they use callback-attrs for their interactivity (§12), not Solid hydration

**Purpose.** This page exists to demonstrate and validate the island pattern. It shows that:

1. The same components work in both SSR and SPA contexts
2. The SSR shell (nav, modal, sidebar) functions without hydration
3. The SPA island hydrates independently without affecting the surrounding SSR content
4. The `vite-plugin-janus-bundle.ts` handler purge (§12.4) correctly strips unused handlers from the client bundle

## 21. Config modal

The config modal (triggered from the top nav) provides live manipulation of the design system's knobs. It extends v1's preferences modal with a full knob editor.

### 21.1 Existing preferences (carried forward)

- **Color scheme** — system / light / dark (radio group)
- **Animations** — system / enabled / disabled (radio group)
- **Font family** — select from available fonts
- **Font size** — slider (12–24px)

### 21.2 Knobs section

A new section below the existing preferences. All inputs are **plain text fields** so users can enter `calc()` expressions, `var()` references, or any valid CSS value.

**Primary knobs (always visible):**

| Knob | Default | Description |
|---|---|---|
| `--v-spacing` | `0.75rem` | Base spacing unit |
| `--v-radius` | `0.5rem` | Frame / window radius |
| `--v-input-height` | `2.5rem` | Control height |
| `--v-border-width` | `1px` | Base border width |
| `--v-font-size` | `1rem` | Base font size |
| `--v-line-height` | `1.5` | Base line height |
| `--v-font-family` | system default | Primary font stack |
| `--v-font-family-mono` | system default | Monospace font stack |

**Secondary knobs (behind `<details>` expando):**

Layout derivatives:
- `--v-pad-block` (default `var(--v-spacing)`)
- `--v-pad-inline` (default `var(--v-spacing)`)
- `--v-gap-block` (default `var(--v-spacing)`)
- `--v-gap-inline` (default `calc(var(--v-spacing) * 0.5)`)

Font-size derivatives:
- `--v-font-size-h1` through `--v-font-size-h6`
- `--v-font-size-caption`
- `--v-font-size-code`

Line-height derivatives:
- `--v-line-height-h1` through `--v-line-height-h6`
- `--v-line-height-caption`
- `--v-line-height-code`

Shadow:
- `--v-shadow-outer` (default `0 0 transparent`)
- `--v-shadow-inner` (default `0 0 transparent`)

### 21.3 Behavior

**Persistence.** Knob values persist to localStorage via the existing `ui-style-prefs` system. On page load, stored values are applied to `document.documentElement.style` — the same mechanism that already handles font-size and font-family preferences. Each knob is stored under its CSS custom property name as the key.

**Placeholders.** Each text input shows its default value as placeholder text. An empty input means "use the default."

**Reset.** A single reset button clears all knob overrides:

1. Removes all knob keys from localStorage
2. Removes corresponding inline styles from `<html>`
3. Returns all inputs to empty (showing placeholders)

The reset is all-or-nothing — no per-knob reset. If a user wants to reset one knob, they clear the input field, which removes that property from storage and inline style on blur.

**No color knobs.** Color manipulation lives in the Colors page playground (§20.4), not the config modal. The modal is for structural/rhythm/typography knobs that affect the whole page persistently.

### 21.4 Implementation

The config modal uses the callback-attrs pattern (§12) — it works in both SSR and SPA contexts. The knob inputs are wired via `data-js` mount/change handlers that call `setStylePref` / `removeStylePref` from `ui-style-prefs.ts`.

The `<details>` expando for secondary knobs is native HTML — no JS needed for the expand/collapse behavior, consistent with the progressive enhancement approach.
