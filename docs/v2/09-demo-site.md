# Janus v2 — Documentation Site

Part 9 of the [Janus v2 design spec](./README.md). Covers the documentation site that ships alongside the library and **is** the library's canonical documentation.

**The site is the documentation.** There is no separate docs system, README gallery, or Storybook — the shipped site documents every public surface of the library with live, rendered examples sitting next to the values that produced them. It plays three roles at once:

1. **Reference** — every public surface is documented under one of three sections: **Composition** (§20.2) covers the `--v-*` variable knobs, the `o-*` objects, the `t-*` tools, and typography; **Colors** (§20.3) covers the color system; **Components** (§20.4) covers the `c-*` catalogue. Each lists names and defaults *and* renders them.
2. **Marketing / onboarding** — the Home page (§20.1) explains what Janus is and how to adopt it.
3. **Playground** — the **theme workbench** (§21), the scoped knob demos (§20.6), and the colors playground (§20.3) let a user manipulate the system live. The customization story has a deliberate three-tier structure — see §20.6.

**Authored in Solid JSX from day one; the CSS pages ship zero client JS.** Every page — including the earliest CSS-reference pages — is written as Solid JSX and rendered to **static HTML at build time** (SSG, via `vite-plugin-ssg`). There is no separate "raw HTML first, Solid later" phase: the first pages already use thin, render-only Solid components that apply the library's class lists (`<Card>` → `class="c-card o-box"` — the §4.1 pattern), and site-only chrome is `p-` classes (§4) in the site's own CSS. What stays strict is the *output*: the variables, objects, tools, typography, colors-grid, and base-element pages hydrate nothing — their built form is plain HTML + `index.css`, which is the human-review artifact for the CSS (PLAN Phase 0–3), the E2E target, and the proof of the CSS-first claim: the rendered docs for the CSS package need nothing but the CSS package. Interactivity (the workbench §21, playground islands, component demos with behavior) layers on later, once the DOM layer exists. The *library* remains framework-agnostic — a consumer can use `css/` with any or no framework — but the site itself commits to Solid; supporting not-Solid consumers is a property of the library's boundaries (§3), not something the site must prove by avoiding JSX.

## 19. Site architecture

**SSR-first.** Every page renders server-side. This inverts the v1 default (where SPA was the norm and SSR was a special page). The top nav shell, theme workbench, and sidebar are all SSR — the workbench's controls work via the callback-attrs progressive enhancement pattern (§12). SPA interactivity exists only as **islands**: hydrated regions inside otherwise-static content. The Composition section (§20.2) and the Colors contrast grid (§20.3 Section 1) render entirely without client JS in their base form. The theme workbench (§21), the scoped knob demos (§20.6), and the Typography **width-draggable frame** (§20.2.4) are enhancements that hydrate on top of that static render once the DOM layer exists; the pages document every knob with zero JS even if they never load.

**Multi-page Vite app, Solid-authored.** Same entry-point pattern as v1 — one HTML entry point per page at the repo root, each pointing at a TSX entry in `src/`. Pages are Solid JSX rendered by `vite-plugin-ssg.ts` (§3.1) at build time. Because the site shell and SSG are stood up first (Phase 0), every CSS doc page renders through the real site machinery from day one — no throwaway test harness, and **no interim hand-written-HTML page format** that would later be rewritten.

**Navigation.** The top nav bar holds exactly **three** links — **Composition**, **Colors**, **Components** — plus the **theme-workbench trigger** (§21). Three is the deliberate ceiling: more items don't fit comfortably. The site title / logo links to Home (Home is not itself a nav item). The nav is rendered server-side; the current-section indicator is resolved at SSR time from the entry point path. Each of the three sections owns its own internal navigation — Composition and Components use a sidebar / table-of-contents (§20.2, §20.4); Colors is a single scrolling page.

**Component scaffolding grows with the pages.** A doc page that needs a card renders `<Card>`; if `Card` doesn't exist yet, the page's author writes the ~5-line render-only wrapper (class list + prop pass-through) in `src/lib2/solid/` and moves on. Interactive behavior (`data-js` wiring, signals) is *not* added at this stage — wrappers stay pure prop→attribute mappers until the DOM layer lands (PLAN Phases 5–6). Site-only chrome that isn't library material (the doc ToC, the demo-card frame, the nav's specific arrangement) is built from `p-` classes in site CSS instead of being forced into the library.

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

The first and largest section. It documents the building blocks that produce layout, rhythm, and type — the `--v-*` variable knobs, the `o-*` objects, the `t-*` tools, and typography — all in one place. Composition is **built first** (PLAN Phases 1–3) and is the primary human-review surface for the CSS: everything here ships zero client JS (Solid-authored, statically rendered — §19).

**Layout.** A persistent left **sidebar / table-of-contents** lists the four areas — Variables, Objects, Tools, Typography — and their sub-sections; the main column scrolls through the documentation. The ToC entries are **plain anchor links that work with zero JS** — clicking one jumps to its section via the URL fragment. The active-section *highlight* that follows scroll position is **strictly progressive enhancement** (a small scroll-spy island added in Phase 9); the page is fully navigable and complete without it, consistent with the zero-client-JS claim for the CSS-reference pages. On narrow viewports the sidebar collapses to a `c-drawer` (same recipe as the Components page, §10.4). Composition may be one long anchored page or split into sub-routes — either works; the ToC is the through-line.

**Bootstrapping note.** Composition is built before the DOM/interactivity layers exist, but **not** before Solid: its shell chrome (the sidebar, the section cards, the nav) is Solid JSX from the start — thin render-only wrappers for anything that belongs to the library (`Card`, `Stack`), `p-` classes for site-only chrome (§19). Don't gold-plate the wrappers: a 5-line class-applier is enough; behavior and full prop APIs come with PLAN Phases 5–6. The point is to exercise the CSS as early as possible while never writing markup in a format that will be thrown away.

#### 20.2.1 Variables

The reference for every public `--v-*` knob. This is what humans review while the token layer is iterated (Phase 1).

**Layout:** one section per token group (spacing, radius/border, color, typography, shadow, motion), matching the `tokens/` file split (§5.1, PLAN Phase 1). Each section pairs a **reference table** with a **live render**.

**Reference table columns:** knob name, default value, the *resolved* computed value (read at SSR time or shown via a small inline sample), one-line description, and — for derived tokens — the formula or source knob it derives from (e.g. `--v-pad-inline` ← `--v-spacing`, `--v-border-color` ← `color-mix` of `--v-border-dynamic-*` and `--v-bg`). Primary knobs (the documented public surface) are visually distinguished from secondary/derived tokens.

**Live render:** next to each group, a swatch/sample strip showing the knob in effect — spacing shown as a ruler of padded boxes, radius as a row of progressively rounded boxes, the color knobs as labeled swatches, the shadow knobs as elevated tiles, the font-size/line-height tokens as a type ramp. The point is that a reviewer sees both the *number* and *what it does* without leaving the page.

**Exploration lives in the theme workbench, not in per-token islands.** Earlier drafts planned an inline "mini-workbench" per token group. That fragmented the pedagogy: global knobs interact (radius steps by pad; leading rides spacing), and a scoped preview per group can't show the interactions. Instead, every `--v-*` row in the reference table carries an **"open in workbench"** affordance that opens the theme workbench (§21) with that group focused — the whole page is the preview, which is exactly the point of a *global* knob. The Variables page stays the read-only reference; the workbench is the single place global knobs are manipulated. (Scoped, per-demo controls still exist — but for *object* knobs and *modes*, on the Objects/Components pages, where scope is the honest granularity. See §20.6.)

**Progressive enhancement preserves the zero-JS claim.** The static reference table + static live render are authored first and **work with zero client JS from Phase 1 onward** — that is the CSS-review artifact. The workbench is a layer that arrives with the DOM layer (PLAN Phase 9), never a prerequisite for the page to render or document its knobs.

#### 20.2.2 Objects

The reference for every `o-*` object (§9).

**Layout:** one demo card per object — `o-box`, `o-text-box`, `o-input-box`, `o-square`, `o-dialog`, `o-stack`, `o-group`, `o-row`, `o-grid`, `o-container`, `o-split`, `o-centric`, `o-bar`, `o-segmented`, `o-prose` (+ `<hgroup>`), `o-caption`, `o-code`, `o-menu`, `o-menu-item`. Each card shows:

- A **live render** of the object doing its job, using neutral placeholder content (boxes/blocks, not finished components) so the object's *structural* behavior is the focus, not component chrome.
- The object's **knobs** — its `--o-<name>__*` custom properties (e.g. `--o-box__pad-block`, `--o-grid__min`, `--o-stack__gap`) listed with defaults.
- The **markup snippet** that produced the render, so a consumer can copy it.

**Key demonstrations** (these are the things worth seeing rendered, per §9):
- The four-level **nesting** at a couple of `--v-radius` / `--v-radius-min` settings (§8): `o-dialog` > `o-box` > `o-input-box`, **plus a box nested in a box** (the `--o-box__radius-inner` step), annotated with the computed `border-radius` at each tier — radius steps inward and never goes sharp, and `min == max` flattens it — so the stepped vs. flat looks are visible side by side.
- `o-bar` in its **three height modes** (text / contains-input / input, §9.7) with the same control in each, so the "too-tall header" fix is visible.
- `o-prose` rhythm: bare heading vs. `<hgroup>`, the heading space-above vs. prose gap, and the **list rhythm** switch (grouped ↔ continuous) with wrapped bullets.
- The **inline inset modes** (§6.1) side by side: field label at edge/radius/text; container prose meeting cards; a code block breaking out.
- `o-grid` and `o-split` **reflow** shown at multiple container widths (resize handles or side-by-side narrow/wide frames), and the **full-bleed opt-in** (`data-v-bleed`) on a narrow frame.
- `o-text-box` vs `o-box`: uniform block padding via `text-box-trim` (no `1lh` compensation math — §6).

Where a demonstration has discrete modes (bar height, list rhythm, insets, full-bleed), the demo card carries **scoped mode toggles** (§20.6) once the site hydrates — segmented controls that flip the class/attribute on that one render, with the markup snippet updating to match.

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
- A **clearly-labeled fluid opt-in demo** — a separate, explicitly-fluid region that spreads the anchors (e.g. `--v-font-size-min: 1rem; --v-font-size-max: 1.25rem` with `--v-font-ratio-max > --v-font-ratio-min`) inside its own scope, so the reader can see what opting in does. Because the *default* ramp is fixed, this demo must set the fluid anchors itself — it cannot rely on the page defaults. Implement it as a **width-draggable preview frame**: an `<iframe>` (or container-query-scoped region) hosting a type ramp with the fluid anchors set, plus a drag handle that varies its width across the `--v-viewport-min`…`--v-viewport-max` range, so heading sizes grow and the heading↔body contrast visibly widens as it gets wider. Label it unambiguously as the *fluid opt-in*, so no reader mistakes it for default behavior. This is the same draggable-width frame the `spacing-workbench.html` prototype uses; like the theme workbench (§21) it is a JS enhancement layered on top of the static ramp, not a prerequisite for the page. (It's the one type demo that *can't* use the workbench — the workbench drives the real viewport, and fluid type needs a fake, draggable one.)

### 20.3 Colors

Color system showcase + interactive playground. Built **second** (after Composition). Section 1 (the contrast grid) ships zero client JS; Section 2 (the playground) is a hydrated island added once the DOM layer exists. This is also the home of the color-contrast checker that exists today — all color-specific tooling lives here.

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

The component catalog — the third and last section (built after Composition and Colors). The render-only Solid wrappers that grew alongside the CSS (§19) gain their full prop APIs and `data-js` wiring by this point; this page demos the finished components.

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
| **Tables** | `tables-demo` | Data table with header, dividers, control-height rows (`--c-table__row-height`), a multi-line cell, an inline-editable cell, and a scoped row-height override showing the decoupling from `--v-input-height` (§10.1). |
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
- The theme workbench, sidebar, and top nav remain SSR — they use callback-attrs for their interactivity (§12), not Solid hydration

**Purpose.** This page exists to demonstrate and validate the island pattern. It shows that:

1. The same components work in both SSR and SPA contexts
2. The SSR shell (nav, modal, sidebar) functions without hydration
3. The SPA island hydrates independently without affecting the surrounding SSR content
4. The `vite-plugin-janus-bundle.ts` handler purge (§12.4) correctly strips unused handlers from the client bundle

### 20.6 The customization story: three tiers, three surfaces

v1 demoed customizability with a small modal over a constrained variable set. v2's surface is much bigger, and its knobs don't all live at the same altitude — so the demo structure follows the *architecture* of the knob system instead of putting everything in one dialog. Three tiers, each shown where it actually applies:

| Tier | What it is | Where it's demoed | Interaction |
|---|---|---|---|
| **1. Theme** — global `--v-*` knobs | Spacing bundle, type anchors/ratios, radius pair, control height, motion, weights | The **theme workbench** (§21), available on every page | Sliders; **the page itself is the preview**; persistent |
| **2. Object knobs** — `--o-*` | `--o-stack__gap`, `--o-grid__min`, `--o-prose__gap`, `--o-dialog__offset`, insets… | The **Objects page** demo cards (§20.2.2) | Scoped controls on the demo render; ephemeral |
| **3. Modes & variants** — classes / attributes | Bar height modes, dialog header plain/glass, footer stickiness, list rhythm, full-bleed, `v-colors-*` / `v-surface-*` | The relevant **component/object demo card** | Segmented toggles on the demo; the markup snippet updates live |

The reasoning:

- **Global knobs deserve a global preview.** A `--v-spacing` change moves *everything* — pad, gaps, leading offsets, stepped radii. A scoped thumbnail can't show that; the whole site can. So tier 1 gets a persistent panel whose preview is the page you're already reading (§21). This is also the strongest possible marketing claim: the documentation site is itself one theme of the system, and you can regrade it live.
- **Object knobs are scoped by definition** — `--o-grid__min` on *this* grid. So they're demoed exactly at that scope: each Objects-page card exposes its own knobs as small controls affecting only its render. No global persistence; leaving the page resets. (Object knobs still *affect how components look* — a component demo that composes an object lists the inherited object knobs in its card, linking back to the object.)
- **Modes are classes, not variables** — you don't slide between a plain and a glass dialog header. Segmented toggles flip the actual class/attribute on the demo markup and show the resulting snippet, which doubles as copy-paste documentation.
- **Typography spans tiers on purpose.** The type *scale* (anchors, ratios, line-height) is tier 1 — it lives in the workbench's Type group. The *flow* (prose gap, heading gap, hgroup leading, list rhythm) belongs to `o-prose`, the typography object — tier 2/3 on the Objects page. The Typography sub-page (§20.2.4) remains the static reference ramp plus the fluid opt-in frame.
- **Color stays on the Colors page** (§20.3) — it has its own contrast tooling and doesn't share the workbench's slider pedagogy.

## 21. Theme workbench

The **theme workbench** replaces v1's preferences modal *and* the earlier v2 "config modal" concept. It is the productionized descendant of the `docs/v2/spacing-workbench.html` prototype: grouped sliders driving live tokens, a resolved-`:root` readout, and copy-CSS — but where the prototype drove an iframe, the shipped workbench drives **the site itself**.

### 21.1 Form factor

A **side panel (drawer), not a modal** — triggered from the top nav on every page. A modal would cover the thing being themed; the drawer leaves the page visible while you drag, which is the entire point. On narrow viewports it becomes a bottom sheet. Opening it does not navigate; it works on whatever page you're on (the Variables page and the Components page are both good preview material — the user picks by navigating normally with the panel open).

### 21.2 Contents

Grouped to mirror the token files (§5.1), workbench-prototype defaults shown as slider positions:

**Presets** — Compact / Default / Spacious (the prototype's presets, carried forward): each sets the whole slider bundle. A manual tweak deselects the preset chip.

**Preferences (carried from v1)** — color scheme (system / light / dark), animations (system / on / off), font family. These are user prefs, not theme knobs, but they share the panel and the persistence mechanism.

**Rhythm** — sliders:
- `--v-spacing` (master; 0.25–1.5rem, default 1rem)
- `--v-input-height` (1.75–3.5rem, default 2rem)
- The derived multiples, each expressed ×spacing with the resolved value shown: pad (`--v-pad-*`, default ×1.25), section (`--v-gap-section`, ×1.5), cluster (`--v-gap-inline`, ×0.5), tight (`--v-gap-tight`, ×0.25). Dragging a multiple rewrites that token's `calc()`; dragging the master moves everything.

**Type** — sliders: base size anchors `--v-font-size-min` / `-max` (dragging one with "linked" on moves both — the fixed-type default; unlinking spreads them = fluid opt-in), ratio anchors `--v-font-ratio-min` / `-max` (same linking), `--v-line-height`, and numeric fields for `--v-viewport-min` / `-max`. Prose rhythm (`--o-prose__gap` etc.) is *not* here — it's an object knob (§20.6).

**Radius** — quick preset chips (Stepped / Near-uniform / Flat — which just set the two sliders, §8.4), then sliders: `--v-radius` (max), `--v-radius-min` (floor), `--o-dialog__offset` (×spacing). Plus the "draw window radius" toggle where the site frame demonstrates a painted frame (§8.1).

**Advanced (behind a `<details>` expando)** — plain **text fields** for every root knob, including the ones without sliders (shadows, motion, weights, borders) and every slider-backed knob's raw value, so `calc()` expressions and `var()` references are enterable. This preserves the old config modal's expert path without making it the primary UI. An empty field means "use the default"; each shows its default as placeholder.

**Readout + actions** — a live resolved-token readout (the prototype's `:root` block: current font steps at the current viewport, rhythm values, radius cascade), a **Copy `:root` CSS** button that emits exactly the overridden knobs as a paste-ready block (this is the bridge from playing to adopting), and **Reset**.

### 21.3 Behavior

**The page is the preview.** Slider input writes the custom property to `document.documentElement.style` immediately — every component on the page moves. No scoped preview region, no iframe.

**Persistence.** Values persist to localStorage via the `ui-style-prefs` mechanism carried from v1 (each knob stored under its property name; applied to `<html>` on load). The workbench is therefore also the site's persistent settings surface.

**Reset** clears all overrides: removes the localStorage keys, removes the inline styles, returns sliders to defaults and text fields to placeholders. Per-knob reset = clear that field / double-click that slider.

**No color knobs.** Color manipulation lives in the Colors page playground (§20.3); the workbench covers structure, rhythm, type, and radius.

### 21.4 Implementation

The workbench panel is SSR markup (it renders in the drawer with zero JS; the controls are inert until hydration) wired via the callback-attrs pattern (§12) — `data-js` mount/change handlers calling `setStylePref` / `removeStylePref`. The `<details>` expando is native HTML. Slider→token bindings are declarative (`data-*` naming the property and unit) so adding a knob to the panel is markup, not code. E2E: drag `--v-spacing`, assert a card's padding changed; reload, assert persistence; reset, assert defaults.
