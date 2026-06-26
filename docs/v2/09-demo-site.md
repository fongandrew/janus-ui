# Janus v2 — Documentation Site

Part 9 of the [Janus v2 design spec](./README.md). Covers the documentation site that ships alongside the library and **is** the library's canonical documentation.

**The site is the documentation.** There is no separate docs system, README gallery, or Storybook — the shipped site documents every public surface of the library with live, rendered examples sitting next to the values that produced them. It plays three roles at once:

1. **Reference** — every public surface is documented under one of three sections: **Composition** (§20.2) covers the `--v-*` variable knobs, the `o-*` objects, the `t-*` tools, and typography; **Colors** (§20.3) covers the color system; **Components** (§20.4) covers the `c-*` catalogue. Each lists names and defaults *and* renders them.
2. **Marketing / onboarding** — the Home page (§20.1) explains what Janus is and how to adopt it.
3. **Playground** — interactive regions (the config modal §21, the colors playground §20.3) let a user manipulate knobs live.

**The CSS-reference pages are framework-free, and built first.** The variables, objects, tools, typography, colors, and base-element pages are authored as plain SSR markup — raw HTML elements carrying `o-*` / `c-*` / `t-*` / `v-*` classes, rendered to static HTML, with `index.css` the only asset. No Solid component wrappers, no `data-js`, no hydration. This is deliberate: these pages are stood up at the very start of the build (PLAN.md Phase 0–3) as the **human-review artifact for the CSS**, long before the DOM or Solid layers exist, and they prove the CSS-first claim — the CSS package documents itself with nothing but the CSS package. The Components section (§20.4) and the interactive playground islands come later, once the Solid and DOM layers are built, and they consume the real Solid wrappers.

## 19. Site architecture

**SSR-first.** Every page renders server-side. This inverts the v1 default (where SPA was the norm and SSR was a special page). The top nav shell, config modal, and sidebar are all SSR — they work without JS via the callback-attrs progressive enhancement pattern (§12). SPA interactivity exists only as **islands**: hydrated regions inside otherwise-static content. The Composition section (§20.2) and the Colors contrast grid (§20.3 Section 1) render entirely without JS in their base form — they are static markup + `index.css`. Composition's per-token **slider islands** (§20.2.1) and the Typography **width-draggable frame** (§20.2.4) are optional enhancements that hydrate on top of that static render once the DOM layer exists; the page documents every knob with zero JS even if they never load.

**Multi-page Vite app.** Same pattern as v1 — one HTML entry point per page at the repo root, each pointing at a TSX entry in `src/`. The `vite-plugin-ssg.ts` plugin (§3.1) handles SSR rendering at build time. Because the site shell and SSG are stood up first (Phase 0), every CSS doc page renders through the real site machinery from day one — no throwaway test harness.

**Navigation.** The top nav bar holds exactly **three** links — **Composition**, **Colors**, **Components** — plus a config-modal trigger. Three is the deliberate ceiling: more items don't fit comfortably. The site title / logo links to Home (Home is not itself a nav item). The nav is rendered server-side; the current-section indicator is resolved at SSR time from the entry point path. Each of the three sections owns its own internal navigation — Composition and Components use a sidebar / table-of-contents (§20.2, §20.4); Colors is a single scrolling page.

**Pages render with raw markup where possible.** Doc pages built before the Solid layer exists are authored as SSR page modules that emit plain HTML elements with the library's classes directly. When the Solid layer lands (Phase 7), the component-demo page is rebuilt on the real Solid wrappers; the CSS-reference pages can stay raw markup, since that is exactly what they document.

## 20. Pages

### 20.1 Home

The landing page. Explains what Janus is and how to use it.

**Content:**

- **Headline + tagline.** One sentence: CSS-first design system, fork-and-copy, modern browsers.
- **Pseudo-package overview.** Brief description of the four pseudo-packages (`css/`, `utils/`, `dom/`, `solid/`) and the consumer profiles from §3.1 (static site → CSS only; vanilla JS app → CSS + utils + dom; Solid SPA → all four).
- **Design philosophy highlights.** Knobs over utilities, semantic names, small public surface, framework-agnostic core — pulled from §1.
- **Visual samples.** A card with surface treatment, a form with a few inputs, a button row — just enough to show the system in action, not a full component catalog.
- **Navigation cards.** Links to the three sections — Composition, Colors, Components — each with a one-line description.

### 20.2 Composition

The first and largest section. It documents the building blocks that produce layout, rhythm, and type — the `--v-*` variable knobs, the `o-*` objects, the `t-*` tools, and typography — all in one place. Composition is **built first** (PLAN Phases 1–3) and is the primary human-review surface for the CSS: everything here is framework-free (static markup + `index.css`, zero JS).

**Layout.** A persistent left **sidebar / table-of-contents** lists the four areas — Variables, Objects, Tools, Typography — and their sub-sections; the main column scrolls through the documentation. The ToC entries are **plain anchor links that work with zero JS** — clicking one jumps to its section via the URL fragment. The active-section *highlight* that follows scroll position is **strictly progressive enhancement** (a small scroll-spy island added in Phase 9); the page is fully navigable and complete without it, consistent with the framework-free claim for the CSS-reference pages. On narrow viewports the sidebar collapses to a `c-drawer` (same recipe as the Components page, §10.4). Composition may be one long anchored page or split into sub-routes — either works; the ToC is the through-line.

**Bootstrapping note.** Composition is built before the Solid component layer exists, so its shell chrome (the sidebar, the section cards, the nav) is assembled from **ad-hoc markup + CSS classes**, not finished `Card`/`Sidebar` components. That is fine and expected — the point is to exercise the CSS as early as possible. These ad-hoc shells are refactored into real components later, once the Solid layer lands (see PLAN Phase 9).

#### 20.2.1 Variables

The reference for every public `--v-*` knob. This is what humans review while the token layer is iterated (Phase 1).

**Layout:** one section per token group (spacing, radius/border, color, typography, shadow, motion), matching the `tokens/` file split (§5.1, PLAN Phase 1). Each section pairs a **reference table** with a **live render**.

**Reference table columns:** knob name, default value, the *resolved* computed value (read at SSR time or shown via a small inline sample), one-line description, and — for derived tokens — the formula or source knob it derives from (e.g. `--v-pad-inline` ← `--v-spacing`, `--v-border-color` ← `color-mix` of `--v-border-dynamic-*` and `--v-bg`). Primary knobs (the documented public surface) are visually distinguished from secondary/derived tokens.

**Live render:** next to each group, a swatch/sample strip showing the knob in effect — spacing shown as a ruler of padded boxes, radius as a row of progressively rounded boxes, the color knobs as labeled swatches, the shadow knobs as elevated tiles, the font-size/line-height tokens as a type ramp. The point is that a reviewer sees both the *number* and *what it does* without leaving the page.

**Scoped slider islands (layered on later).** Beyond the static reference, each token group carries an optional **inline "mini-workbench"**: that group's knobs as **sliders** driving a *scoped* preview region (an `@scope` block or a small `<iframe>` — **not** the whole page) plus a live **resolved-token readout** with a **"copy CSS"** button. This is the pattern from `docs/v2/spacing-workbench.html` (controls → live preview → resolved `:root`) brought inline per concept, so a reader can drag *one* rhythm or radius knob and watch *one* preview move without committing the change to the page. These islands are **distinct from the config modal (§21)** and do a different job: the modal is the *global, persistent* editor (text fields for `calc()`/`var()`, writes to `<html>` + localStorage), while these are *local, ephemeral* teaching tools (sliders, because continuous drag is the pedagogy, scoped to a preview). Keep both — do not unify them.

**Progressive enhancement preserves the zero-JS claim.** The static reference table + static live render are authored first and **work with zero JS from Phase 1 onward** — that is the CSS-review artifact. The slider islands are a JS layer that **hydrates on top** once the DOM layer exists (alongside the config modal, §21), never a prerequisite for the page to render or document its knobs. The static page is always the floor; the islands are enhancement. This page is the read-only counterpart to the config modal: the modal *changes* knobs live and persistently; this page *documents* them, and (once hydrated) lets you explore each one in isolation.

#### 20.2.2 Objects

The reference for every `o-*` object (§9).

**Layout:** one demo card per object — `o-box`, `o-text-box`, `o-input-box`, `o-square`, `o-dialog`, `o-stack`, `o-group`, `o-row`, `o-grid`, `o-container`, `o-split`, `o-centric`, `o-caption`, `o-code`, `o-menu`, `o-menu-item`. Each card shows:

- A **live render** of the object doing its job, using neutral placeholder content (boxes/blocks, not finished components) so the object's *structural* behavior is the focus, not component chrome.
- The object's **knobs** — its `--o-<name>__*` custom properties (e.g. `--o-box__pad-block`, `--o-grid__min`, `--o-stack__gap`) listed with defaults.
- The **markup snippet** that produced the render, so a consumer can copy it.

**Key demonstrations** (these are the things worth seeing rendered, per §9):
- The four-level **nesting** at a couple of `--v-radius` / `--v-radius-min` settings (§8): `o-dialog` > `o-box` > `o-input-box`, annotated with the computed `border-radius` at each tier — radius steps inward and never goes sharp, and `min == max` flattens it — so the stepped vs. flat looks are visible side by side.
- `o-grid` and `o-split` **reflow** shown at multiple container widths (resize handles or side-by-side narrow/wide frames).
- `o-text-box` vs `o-box` block-padding difference (the `1lh` compensation).

#### 20.2.3 Tools

The reference for the narrow `t-*` tools layer (§11).

**Layout:** a compact table/grid — one row per tool (`t-px`, `t-py`, `t-p`, `t-px-0` … `t-flex`, `t-flex-fill`, `t-hidden`, `t-sr-only`, `t-border`, `t-radius-none`, `t-radius-full`, `t-shadow*`, `t-align-*`, `t-truncate`, etc.) — each row showing the tool's name, what it does in one line, and a **before/after live render** (a pair of small boxes, one without and one with the class, so the effect is visible). Tools are deliberately few (§11); the section fits on one screen and serves as the "escape hatch" cheat-sheet.

#### 20.2.4 Typography

Showcase of the typography system (still part of Composition — type *is* composition).

**Content:**

- Heading levels h1–h6 with their semantic font-size tokens (`--v-font-size-h1` through `-h6`)
- Body paragraphs demonstrating `--v-font-size` and `--v-line-height`
- Caption text (`--v-font-size-caption`) and code text (`--v-font-size-code`)
- Lists (ordered, unordered, nested), blockquotes, tables
- `<pre>` / `<code>` blocks
- A reference table showing each token's resolved size and effective ratio (from §5.1's line-height table)
- A note that the scale **ships fixed by default** (§5.4): with the shipped collapsed anchors (`--v-font-size-min == --v-font-size-max`), every level is a constant size that does **not** track the viewport — the right default for app UI. The page's main type ramp is this fixed default; resizing the browser does *not* move it, and that is correct. The Utopia *mechanism* underneath is fluid-capable, but fluidity is an **opt-in** (recommended for marketing/content), not the out-of-the-box behavior.
- A **clearly-labeled fluid opt-in demo** — a separate, explicitly-fluid region that spreads the anchors (e.g. `--v-font-size-min: 1rem; --v-font-size-max: 1.25rem` with `--v-font-ratio-max > --v-font-ratio-min`) inside its own scope, so the reader can see what opting in does. Because the *default* ramp is fixed, this demo must set the fluid anchors itself — it cannot rely on the page defaults. Implement it as a **width-draggable preview frame**: an `<iframe>` (or container-query-scoped region) hosting a type ramp with the fluid anchors set, plus a drag handle that varies its width across the `--v-viewport-min`…`--v-viewport-max` range, so heading sizes grow and the heading↔body contrast visibly widens as it gets wider. Label it unambiguously as the *fluid opt-in*, so no reader mistakes it for default behavior. This is the same draggable-width frame the `spacing-workbench.html` prototype uses; like the Variables slider islands (§20.2.1) it is a JS enhancement layered on top of the static ramp, not a prerequisite for the page.

### 20.3 Colors

Color system showcase + interactive playground. Built **second** (after Composition). Section 1 (the contrast grid) is framework-free; Section 2 (the playground) is a hydrated island added once the DOM layer exists. This is also the home of the color-contrast checker that exists today — all color-specific tooling lives here.

**Section 1 — Contrast grid (SSR).** The existing APCA contrast display carried forward from v1: a grid of `v-colors-*` variant boxes, each showing foreground text with APCA Lc scores and pass/fail indicators against the silver-level font-weight tables. Covers the §7 variant catalogue exactly: the **default** base palette (no variant) as the reference cell, then the tonal variants `v-colors-primary`, `v-colors-secondary`, `v-colors-success`, `v-colors-warn`, `v-colors-info`, `v-colors-danger`, and the surface-role variants `v-colors-code`, `v-colors-pre`, `v-colors-popover`, `v-colors-tooltip`, `v-colors-callout`, `v-colors-highlight`. (Names match §7 — note `v-colors-warn`, not `warning`; there are no `v-colors-card` / `v-colors-input` color variants — card/input surfaces are `v-surface-*` + the base palette, so they need no separate contrast cell.)

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

### 20.4 Components

The component catalog — the third and last section (built after Composition and Colors). Reference-page chrome that was thrown together ad-hoc for Composition (sidebar, cards) is, by this point, refactored into the real Solid components this page demos.

**Layout:** Sidebar + main content area, same structural pattern as v1 but using v2 primitives (`o-split` for the sidebar/main split, `c-drawer` for the mobile collapse — see §10.4's sidebar recipe).

**Sidebar (SSR):** Grouped nav listing all components from §10 (buttons, cards, alerts, inputs, selects, modals, menus, tabs, etc.). Sidebar highlight tracks the scroll position of the main content.

**Main content:** An `o-grid` of component demo cards. Each card shows the component in a realistic context with enough variants to demonstrate the knob system. Every demo uses the actual Solid components from `src/lib/solid/` (not raw HTML) — the demos are integration tests for the wrapper layer.

Each demo card follows the `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` pattern from v1. Each has a unique `id` (e.g. `buttons-demo`) for sidebar anchor linking and E2E test scoping. Reference v1's demo files (`git show main:src/demos/<name>-demo.tsx`) for content structure.

**Demo catalogue:**

| Demo | id | Content |
|---|---|---|
| **Buttons** | `buttons-demo` | Full width (`t-col-span-full`). Row of size variants (if applicable). Row of tonal variants: default, primary, danger. Disabled button. `IconButton` examples. Shows hover/active states on interaction. |
| **Cards** | `cards-demo` | Grid of cards showing surface treatments: `v-surface-card`, `v-surface-elevated`, `v-surface-sunken`, `v-surface-glass`, `v-surface-gradient`. Each card has title, body text, and a link to show text colors. |
| **Alerts** | `alerts-demo` | Stack of alerts: default, success, warning, danger, info. Each with descriptive text. At least one with a close action. |
| **Inputs** | `inputs-demo` | Default, placeholder, with value, error state, disabled. Email/URL type inputs. `LabelledInput` with description. `LabelledInput` with error message. |
| **Textareas** | `textareas-demo` | Default, placeholder, disabled, error. Inside `LabelledInput`. |
| **Checkboxes** | `checkboxes-demo` | Unchecked, checked, indeterminate, disabled. Group with labels. |
| **Radios** | `radios-demo` | Radio group (3–4 options), one pre-selected, one disabled. Horizontal and vertical layouts. |
| **Toggles** | `toggles-demo` | Off, on, disabled. Each with label text. |
| **Native Selects** | `selects-demo` | Default with options, with initial value, disabled. Inside `LabelledInput`. |
| **Styled Select** | `styled-selects-demo` | Select with rendered options (color swatches or font previews alongside text). Shows the composite component's full keyboard interaction. |
| **Tags** | `tags-demo` | Row of tonal variant tags. Removable tags. |
| **Badges** | `badges-demo` | Count badges, dot badges. Different variants. |
| **Avatars** | `avatars-demo` | Image avatar, initials fallback. Different sizes via scoped knobs. |
| **Spinners** | `spinners-demo` | Default, different sizes. Spinner inside a loading button. |
| **Skeletons** | `skeletons-demo` | Text lines, circle, card-shaped skeleton. |
| **Disclosure** | `disclosure-demo` | Closed, open, nested. Styled summary content. |
| **Tooltips** | `tooltips-demo` | Tooltip on hover with anchor positioning. Multiple positions. Longer content. Note: full positioning requires Chromium; show a note for other browsers. |
| **Tabs** | `tabs-demo` | 3–4 tabs with panel content. One disabled tab. Keyboard navigation works. |
| **Modals** | `modals-demo` | Open/close modal. Modal with scrollable content (inner shadows). Modal with form. Speed bump demo. |
| **Drawers** | `drawers-demo` | Open from each side (left, right, top, bottom). Drawer with nav content. |
| **Popovers** | `popovers-demo` | Button trigger, content popover. Anchor-positioned. |
| **Menus** | `menus-demo` | Dropdown menu from button. Menu with icons. Typeahead demo. |
| **Forms** | `forms-demo` | Complete form with validation, submit, error display, success output. `FormGroup` for cross-field validation. |
| **Modal Forms** | `modal-forms-demo` | Modal form with submit-closes-modal, reset-on-close, and speed bump behaviors. |

Each demo must be interactive — not just static HTML renderings. Buttons should respond to clicks, toggles should toggle, forms should validate. Use the `data-js` behavior system + Solid signals where needed.

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
- **Font size** — slider (12–24px). Because the base size is now the *pair* of anchors (`--v-font-size-min` / `-max`), this slider **sets both anchors together** to the same value — keeping type fixed (the default), just larger or smaller. It never spreads the anchors; spreading them (to opt into fluid type) is done in the Knobs section by editing the two anchor fields independently.

### 21.2 Knobs section

A new section below the existing preferences. All inputs are **plain text fields** so users can enter `calc()` expressions, `var()` references, or any valid CSS value.

**Primary knobs (always visible):**

| Knob | Default | Description |
|---|---|---|
| `--v-spacing` | `1rem` | Base spacing unit |
| `--v-radius` | `0.5rem` | Frame / window radius |
| `--v-input-height` | `2.5rem` | Control height |
| `--v-border-width` | `1px` | Base border width |
| `--v-font-size-min` | `0.9375rem` | Base body size at the min viewport. Equals `-max` by default → **fixed 15px**; spread the two to opt into fluid type (§5.4, §6.7) |
| `--v-font-size-max` | `0.9375rem` | Base body size at the max viewport (equal to `-min` by default) |
| `--v-font-ratio-min` | `1.2` | Modular-scale ratio at the min viewport |
| `--v-font-ratio-max` | `1.2` | Modular-scale ratio at the max viewport (equal to `-min` by default, so the ramp is fixed too) |
| `--v-viewport-min` | `20rem` | Lower fluid anchor (used only when type/space fluidity is opted in) |
| `--v-viewport-max` | `80rem` | Upper fluid anchor |
| `--v-line-height` | `1.5` | Base line height |
| `--v-font-family` | system default | Primary font stack |
| `--v-font-family-mono` | system default | Monospace font stack |

**Secondary knobs (behind `<details>` expando):**

Layout derivatives:
- `--v-pad-block` (default `var(--v-spacing)`)
- `--v-pad-inline` (default `var(--v-spacing)`)
- `--v-gap-block` (default `var(--v-spacing)`)
- `--v-gap-inline` (default `calc(var(--v-spacing) * 0.5)`)

Font-size derivatives (each a fluid `clamp()` step on the scale, §5.4):
- `--v-font-size` (the resolved fluid base, step 0)
- `--v-font-size-h1` through `--v-font-size-h6`
- `--v-font-size-caption`
- `--v-font-size-code`

Line-height derivatives:
- `--v-line-height-h1` through `--v-line-height-h6`
- `--v-line-height-caption`
- `--v-line-height-code`

Shadow (ship lifted by default — §5.1 / §7.0):
- `--v-shadow-outer` (default `0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%)`)
- `--v-shadow-inner` (default `inset 0 1px 2px 0 rgb(0 0 0 / 10%)`)

### 21.3 Behavior

**Persistence.** Knob values persist to localStorage via the existing `ui-style-prefs` system. On page load, stored values are applied to `document.documentElement.style` — the same mechanism that already handles font-size and font-family preferences. Each knob is stored under its CSS custom property name as the key.

**Placeholders.** Each text input shows its default value as placeholder text. An empty input means "use the default."

**Reset.** A single reset button clears all knob overrides:

1. Removes all knob keys from localStorage
2. Removes corresponding inline styles from `<html>`
3. Returns all inputs to empty (showing placeholders)

The reset is all-or-nothing — no per-knob reset. If a user wants to reset one knob, they clear the input field, which removes that property from storage and inline style on blur.

**No color knobs.** Color manipulation lives in the Colors page playground (§20.3), not the config modal. The modal is for structural/rhythm/typography knobs that affect the whole page persistently.

### 21.4 Implementation

The config modal uses the callback-attrs pattern (§12) — it works in both SSR and SPA contexts. The knob inputs are wired via `data-js` mount/change handlers that call `setStylePref` / `removeStylePref` from `ui-style-prefs.ts`.

The `<details>` expando for secondary knobs is native HTML — no JS needed for the expand/collapse behavior, consistent with the progressive enhancement approach.
