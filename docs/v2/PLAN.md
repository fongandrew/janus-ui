# Janus v2 — Implementation Plan

This document tells you **what to build and in what order**. For the design rationale and detailed rules, consult the [design spec](./README.md). Section references like "§5.1" point into the spec.

The plan is phased. Each phase has a "done when" check. Phases are sequential unless noted otherwise. Within a phase, the order of items is a suggested priority — not a hard requirement.

---

## Phase 0: Repo setup

**Goal:** A clean working tree for v2 on a dedicated branch, with v1 accessible via git for reference.

### 0.1 Create the branch

```
git checkout -b v2
```

All v2 work happens here. `main` stays untouched — the v1 demo site remains deployable from `main` for comparison. To reference v1 code during the build, use `git show main:path/to/file` (e.g. `git show main:src/lib/utility/throttle.ts`).

### 0.2 Remove v1 source

Delete everything the v2 build replaces. One commit, clear message.

**Delete:**

| Path | Why |
|---|---|
| `src/lib/` | v1 library — replaced by the new pseudo-package structure |
| `src/demos/` | v1 demo components |
| `src/*.tsx`, `src/*.ts` (all files in `src/`) | v1 demo site pages (`app.tsx`, `index.tsx`, `components.tsx`, `colors.tsx`, `typography.tsx`, `ssr.tsx`, `prefs-modal.tsx`, `ssr-callbacks.ts`) and their e2e tests |
| `*.html` at root | v1 entry points (`index.html`, `colors.html`, `typography.html`, `ssr.html`) — will be recreated |
| `dist/`, `playwright-report/`, `test-results/` | Build artifacts |
| `scripts/` | v1 utility scripts (`check-apca.ts`) |
| `types/` | v1 type shims — recreate as needed |

**Keep:**

| Path | Why |
|---|---|
| `docs/v2/` | The design spec and this plan |
| `plugins/` | `vite-plugin-purgecss.ts` and `vite-plugin-ssg.ts` to adapt; `vite-plugin-manglecss.ts` to evaluate. `vite-plugin-janus-bundle.ts` will be added new. |
| `package.json` | Starting point for dependencies. Will need edits (description, scripts, drop `@floating-ui/dom` and `lucide-solid`, etc.) but the toolchain deps (vite, solid, eslint, stylelint, postcss, playwright, vitest) carry forward. |
| `vite.config.ts` | Adapt for v2 entry points and pseudo-package aliases. |
| `tsconfig.json`, `tsconfig.node.json` | Adapt path aliases for new `src/lib/` structure. |
| `eslint.config.js` | Adapt — will add the boundary rule (Phase 8). |
| `.stylelintrc.js`, `postcss.config.js` | Carry forward. |
| `.prettierrc` | Carry forward. |
| `.gitignore` | Carry forward. |
| `playwright.config.ts` | Carry forward. |
| `vitest.setup.ts` | Carry forward. |
| `CLAUDE.md`, `.github/` | Carry forward, update as needed. |
| `assets/` | Carry forward (test images). |
| `LICENSE.md` | Carry forward. |

### 0.3 Adjust root configs

In the same commit or a follow-up:

- **`package.json`** — update description, remove deps that won't be needed (`@floating-ui/dom`, `lucide-solid`), keep everything else. Bump `@playwright/test` (see §0.4). Scripts will be updated incrementally as pseudo-packages are built.
- **`vite.config.ts`** — clear the `rollupOptions.input` (no HTML entry points yet), update the `resolve.alias` to point at the new pseudo-package paths once they exist.
- **`tsconfig.json`** — update path aliases: `~/lib/css/*`, `~/lib/utils/*`, `~/lib/dom/*`, `~/lib/solid/*`.
- **`README.md`** — replace v1 content with a stub pointing at `docs/v2/README.md`. The full "Updating your fork" section comes in Phase 8.

### 0.4 Browser targets and Playwright

v2's CSS features (§15) have uneven browser support. This affects the build target, Playwright config, and how E2E tests are structured.

**Feature support matrix (as of mid-2025):**

| Feature | Chromium | Firefox | WebKit/Safari |
|---|---|---|---|
| CSS anchor positioning | 125+ | No | No |
| `commandfor` / `command` | 135+ | No | No |
| `scroll-state()` container queries | 133+ | No | No |
| `oklch(from …)` relative color | 119+ | 128+ | 18+ |
| `light-dark()` | 123+ | 120+ | 17.5+ |
| Popover API | 114+ | 125+ | 17+ |
| `<dialog>` | all | all | all |
| `:has()`, container queries, `@layer` | all | all | all |

**Playwright version.** Bump `@playwright/test` to a version shipping Chromium 135+ (for `commandfor`). v1 pins `^1.51.1` which ships Chromium 134 — too old. Check the [Playwright releases](https://github.com/microsoft/playwright/releases) for the first version bundling Chromium ≥135 and pin there. After bumping, run `npx playwright install` to pull the new browser binaries.

**Vite build target.** v1 already targets `['safari17', 'ios17', 'chrome135', 'firefox137']`. These are fine for v2 — the target controls JS/CSS *syntax* transforms, not feature availability. CSS features like anchor positioning that older browsers don't support degrade gracefully (the browser ignores the unknown properties). No change needed unless the target list drifts.

**Playwright project structure.** Restructure the Playwright config to separate tests into tiers by browser support:

```ts
// playwright.config.ts — project structure sketch
projects: [
  // Tier 1: Chromium-only features (anchor positioning, commandfor, scroll-state)
  {
    name: 'chromium-desktop',
    testMatch: '**/*.desktop.e2e.[tj]s?(x)',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'chromium-mobile',
    testMatch: '**/*.mobile.e2e.[tj]s?(x)',
    use: { ...devices['Pixel 7'] },
  },

  // Tier 2: Cross-browser (features supported by all three engines)
  {
    name: 'firefox-desktop',
    testMatch: '**/*.desktop.e2e.[tj]s?(x)',
    grepInvert: /@chromium-only/,
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit-desktop',
    testMatch: '**/*.desktop.e2e.[tj]s?(x)',
    grepInvert: /@chromium-only/,
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'webkit-mobile',
    testMatch: '**/*.mobile.e2e.[tj]s?(x)',
    grepInvert: /@chromium-only/,
    use: { ...devices['iPhone 15'] },
  },
]
```

Tests that exercise Chromium-only features tag themselves with `@chromium-only` in the test title. Firefox and WebKit projects skip those via `grepInvert`. This keeps the test suite honest — features that should work cross-browser run cross-browser; features that can't are still tested but scoped.

Example:

```ts
test('tooltip positions via anchor @chromium-only', async ({ page }) => {
  // anchor positioning — Chromium only
});

test('tooltip shows on hover', async ({ page }) => {
  // popover behavior — cross-browser
});
```

### 0.5 Verify

```
git status          # only expected deletions + config edits
npm install         # no broken deps
npx playwright install  # pull new browser binaries
npx tsc --noEmit    # no stale references (should be trivially clean — no src/ files)
```

**Done when:** The `v2` branch has a clean `src/` directory (empty or just `src/lib/` scaffold stubs), all root configs are adjusted, `npm install` succeeds, and `npx playwright install` completes with Chromium ≥135. v1 code is accessible via `git show main:...`.

---

## Phase 1: CSS foundation (`src/lib/css/`)

**Goal:** A working `index.css` that declares layers, resets defaults, and establishes all root knobs.

Build in this order — each step depends on the previous:

1. **Scaffold.** Create `src/lib/css/` with `janus.json` (`depends: []`), `README.md`, `CHANGELOG.md`.
2. **`index.css`** — the single entry point. Declare the `@layer` order (§4): `reset, base, components, objects, variants, tools`. Import everything else from here.
3. **`reset.css`** — box-sizing, margin resets, etc. Layer: `reset`. Must include `* { border-color: transparent }` — v1 reserves border space on every interactive element so the box doesn't shift on focus or invalid state. Without the transparent default, borders appear as visible lines before they're needed. *(Aesthetic spec §reset)*
4. **`tokens/`** — root knobs and mixins:
   - `spacing.css` — `--v-spacing`, the four derived `--v-pad-*` / `--v-gap-*`, and the `v-spacing` mixin (§5.3, §6). **The mixin should also bundle `--v-border-width`** — denser layouts want thinner borders, not just smaller padding. *(Aesthetic spec §13)* Do NOT reset `--v-radius` in the mixin — the radius cascade (§8) already re-derives `--o-box__radius`, `--o-input-box__radius`, etc. from `--v-radius` and `--v-spacing`, so changing `--v-spacing` alone naturally tightens inner radii through the concentric step-down. Overriding `--v-radius` in the mixin would flatten the cascade. Also add the hi-DPI density bump: `@media (resolution >= 200dpi) { :root { --v-input-height: 2.75rem; --v-font-size: 1.0625rem; --v-spacing: 1rem; } }` — phone screens need larger touch targets and body text. *(Aesthetic spec §14)*
   - `radius.css` — `--v-radius`, `--v-border-width` (§5.1, §8).
   - `color.css` — `--v-bg`, `--v-fg` (with the OKLCH derivation), `--v-link`, `--v-accent`, `--v-muted`, weight-min knobs (§5.1, §7). **Additional tokens to add:**
     - `--v-border-dynamic-base: light-dark(black, white)`, `--v-border-dynamic-mix: light-dark(17.5%, 50%)`, `--v-border-color: color-mix(in hsl, var(--v-border-dynamic-base) var(--v-border-dynamic-mix), var(--v-bg))` — one recipe places every border at a fixed perceptual distance from any surface. *(Aesthetic spec §01)*
     - `--v-body-bg` — a gradient stack: two low-opacity radial gradients (warm peach + cool teal) over `var(--v-bg)`, with `background-attachment: fixed`. This prevents flat-looking pages. *(Aesthetic spec §02)*
     - `--v-ring: var(--v-accent)` (crisp outline) + `--v-ring-alt: color-mix(in hsl, var(--v-accent) 35%, transparent)` (soft halo) — split from a single `--v-accent` ring. `--v-shadow-focus: 0 0 0 0.125rem var(--v-ring-alt)` — the inner layer of the focus ring. *(Aesthetic spec §07)*
     - **Set weight-min defaults to 500**, not `inherit`: `--v-link-weight-min: 500`, `--v-accent-weight-min: 500`, `--v-muted-weight-min: 500`. The shipping palette needs actual values; `inherit` means no contrast compensation. *(Aesthetic spec §10)*
   - `typography.css` — `--v-font-family`, `--v-font-family-mono`, `--v-font-size`, `--v-line-height`, all derived `--v-font-size-*` and `--v-line-height-*` tokens, the `--_font-size-floor` private intermediate (§5.1). **Add the font-weight stack:** `--v-font-weight-normal: 400`, `--v-font-weight-label: 500`, `--v-font-weight-subtitle: 600`, `--v-font-weight-strong: 600`, `--v-font-weight-title: 700`. These are semantic weight tokens that components and base styles consume. Tinted-surface variants bump the entire stack by ~100 (§ aesthetic spec §05).
   - `shadow.css` — `--v-shadow-outer`, `--v-shadow-inner` (§5.1). **Also add:** `--v-shadow-inner-top: inset 0 6px 6px -4px rgb(0 0 0 / 15%)`, `--v-shadow-inner-bottom: inset 0 -6px 6px -4px rgb(0 0 0 / 15%)` — scroll-edge shadows for modal/drawer scrollable content. *(Aesthetic spec §16)*
   - `breakpoints.css` — `v-breakpoint-*` / `v-container-*` mixins (§5.3).
5. **`base.css`** — element-level styles. Layer: `base`. Consumes `--v-*` tokens. Beyond the basics (body, headings, links, form defaults, `code`, `pre`, tables), base.css carries several important v1 conventions:
   - **Body**: `background: var(--v-body-bg); background-attachment: fixed;` *(Aesthetic spec §02)*
   - **Links** (`a:where([href])`): `color: var(--v-link); font-weight: var(--v-link-weight-min, inherit); text-underline-offset: 0.25rem`. **Focus**: `a:focus-visible { outline: none; text-decoration-style: double; }` — inline links use a double underline on focus, not a box outline that disrupts the reading line. *(Aesthetic spec §08)*
   - **Heading demotion in `<header>`**: `header h1, h2 { font-size: var(--v-font-size-h2); }`, `header h2, h3 { font-size: var(--v-font-size-h3); }`, etc. This lets card titles use semantically correct heading levels (h2 for the card section) while rendering at an appropriate visual size (h3-scale inside the card header). *(Aesthetic spec §12)*
   - **Default text truncation**: `a, b, em, h1, h2, h3, h4, h5, h6, p, span, strong { overflow-x: hidden; text-overflow: ellipsis; }`. Headings and inline text truncate by default — opt-out, not opt-in. Add `t-wrap` escape hatch. *(Aesthetic spec §20)*
   - **Icon stroke scaling**: `.lucide, .icon { stroke-width: clamp(2, var(--v-font-weight) / 200, 3); }` — icon stroke thickens with surrounding text weight (body=2, label=2.5, title=3). *(Aesthetic spec §11)*
   - **Code surfaces**: `code` gets tinted-paper bg (`v-colors-code`); `pre` gets always-dark surface (`v-colors-pre`), even in light mode. *(Aesthetic spec §04)*

### 1.T Tests

Create a **CSS test harness** — a plain HTML page (`src/lib/css/test-harness.html`) that imports `index.css` and renders representative elements: headings (h1–h6), paragraphs, links, form inputs, `<code>`, `<pre>`, a `<table>`. This page serves as the E2E target for all CSS-layer tests through Phase 3.

Write `src/lib/css/tokens.desktop.e2e.ts`:

- Verify every primary knob (`--v-spacing`, `--v-radius`, `--v-border-width`, `--v-input-height`, `--v-font-family`, `--v-font-family-mono`, `--v-font-size`, `--v-line-height`, `--v-bg`, `--v-link`, `--v-accent`, `--v-muted`, `--v-shadow-outer`, `--v-shadow-inner`) resolves to a non-empty concrete value via `getComputedStyle`.
- Verify secondary knobs (`--v-pad-block`, `--v-pad-inline`, `--v-gap-block`, `--v-gap-inline`, `--v-fg`, `--v-font-size-h1` through `-h6`, `-caption`, `-code`) all resolve.
- Verify light/dark mode switching: set `data-v-color-scheme="dark"` on `<html>`, confirm `--v-bg` and `--v-fg` change.
- Verify base element styling: headings have decreasing font sizes, links have `--v-link` color, body has `--v-bg` background.

### 1.D Design notes

The default color palette should carry v1's warmth, not generic black-on-white. Reference `git show main:src/lib/styles/variables/color-schemes.css` for exact values:

- **Light mode `--v-bg`**: warm off-white (v1 used `hsl(30deg 12% 98.5%)`), not pure `#fff`
- **Dark mode `--v-bg`**: deep blue-gray (v1 used `hsl(216deg 16% 8%)`), not pure `#000`
- **Body background**: subtle radial gradient overlays (warm peachy at ~15% opacity + cool cyan at ~7% opacity) over the solid `--v-bg`. This creates visual depth without distraction.
- **`--v-link`**: a saturated cyan/teal (v1 used `hsl(195deg 100% 20%)`)
- **Dynamic border color**: derived via `color-mix()` from `--v-bg` — `color-mix(in hsl, black 17.5%, var(--v-bg))` in light mode, `color-mix(in hsl, white 50%, var(--v-bg))` in dark mode. Not a flat gray.
- **Shadows**: two semantic root knobs, not a t-shirt scale. `--v-shadow-outer` default should be a multi-layer shadow (`0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%)`) for realistic depth. `--v-shadow-inner` default: `inset 0 1px 2px 0 rgb(0 0 0 / 10%)` for embossed inputs. Components needing stronger shadows (modals, elevated surfaces) write larger values directly or scope a redefinition. Reference `git show main:src/lib/styles/variables/composition.css`.

**Done when:** Importing `index.css` in a blank HTML page applies the reset, sets all `--v-*` custom properties on `:root`, and styles basic elements (headings, links, paragraphs). Verify with browser devtools that every primary and secondary knob from §5.1 resolves to a concrete value. The page should look warm and intentional — not a browser default with custom properties bolted on.

---

## Phase 2: CSS objects (`src/lib/css/objects/`)

**Goal:** All structural / layout primitives from §9.

**Dependency:** Phase 1 (tokens must exist for `var(--v-*)` references to resolve).

Build the box family first — components layer on these:

1. **`box.css`** — `o-box` with `--o-box__pad-block`, `--o-box__pad-inline`, `--o-box__radius`. Sets `--o-input-box__radius` for descendants (§8).
2. **`text-box.css`** — `o-text-box` with `1lh`-compensated block padding, curvature-clearing inline padding (§6).
3. **`input-box.css`** — `o-input-box` with `--v-input-height`, text-mode padding. Reads inherited `--o-input-box__radius` with fallback to `--v-radius` (§8). This is the shared base for buttons, inputs, textareas, native selects.
4. **`square.css`** — `o-square`, `aspect-ratio: 1`, reads `--v-radius` directly.
5. **`dialog.css`** — `o-dialog` with `--o-dialog__radius`, `--o-dialog__offset`. Redefines `--o-box__radius` and `--o-input-box__radius` for descendants (§8, §9.4).

Then layout objects (no internal dependencies between these):

6. **`stack.css`** — `o-stack` with `--o-stack__gap`.
7. **`group.css`** — `o-group` with `--o-group__gap`.
8. **`row.css`** — `o-row` with `--o-row__gap`.
9. **`grid.css`** — `o-grid` with `--o-grid__min`, `--o-grid__gap-block`, `--o-grid__gap-inline`. Plus `o-grid--fit` modifier (§9.3.1).
10. **`container.css`** — `o-container` with `--o-container__max`.
11. **`split.css`** — `o-split`. `:has()` + container query, no media queries.
12. **`centric.css`** — `o-centric`.

Then typography and menu objects:

13. **`caption.css`** — `o-caption` with `--o-caption__font-size` (§9.5).
14. **`code.css`** — `o-code` with `--o-code__font-size` (§9.5).
15. **`menu.css`** — `o-menu` with padding knobs (§9.6).
16. **`menu-item.css`** — `o-menu-item` with height and font-size knobs (§9.6).

### 2.T Tests

Extend the CSS test harness (`test-harness.html`) with markup for every object.

Write `src/lib/css/objects.desktop.e2e.ts`:

- **Box family radius cascade**: render `o-box` > `o-input-box` and verify `border-radius` steps down correctly (computed style on box vs. inner input-box). Repeat with `o-dialog` > `o-box` > `o-input-box` three-level nesting.
- **Spacing**: verify `o-box` padding matches `--v-pad-block` / `--v-pad-inline`. Verify `o-text-box` block padding is visually smaller (lh compensation).
- **Layout reflow**: `o-grid` — set viewport to 1200px, verify multi-column; set viewport to 400px, verify single-column. `o-split` — same pattern, verify it collapses to stacked at narrow width.
- **Stack/group gaps**: verify `o-stack` children have vertical spacing, `o-group` has horizontal spacing.

**Done when:** A plain HTML page with `index.css` can render: a padded `o-box` with nested `o-input-box` elements showing the radius step-down; an `o-stack` of items; an `o-grid` that reflows responsively; an `o-split` that collapses. The four-level nesting model from §9.1 works visually.

---

## Phase 3: CSS components, variants, and tools

**Goal:** Visual chrome, tonal variants, surface treatments, and the narrow tools layer.

**Dependency:** Phase 2 (components compose objects).

### 3a: Variants and state mixins (`src/lib/css/variants/`, `src/lib/css/tools/`)

Build variants before components — components reference tonal classes. Build state mixins alongside — components reference those too.

**Variants:**

1. **`colors.css`** — all `v-colors-*` classes (§7). Each re-sets `--v-bg`, `--v-fg`, `--v-link`, `--v-accent`, `--v-muted` for its subtree. Include light-dark branches via `light-dark()` / `color-scheme`. The catalogue has two groups:

   **Tonal variants** (semantic intent):
   - `v-colors-primary`, `v-colors-danger`, `v-colors-success`, `v-colors-warn`, `v-colors-info`, `v-colors-secondary`

   **Surface-role variants** (UI context — not listed in §7 but critical for v1's polish): *(Aesthetic spec §03, §04, §05)*
   - `v-colors-tooltip` — always inverted vs. color scheme (`--v-bg: light-dark(#141821, #fafafa); --v-fg: light-dark(#fafafa, #141821)`). Tooltips float *above* the page — their surface must read as a separate layer.
   - `v-colors-popover` — matches card/surrounding chrome (`--v-bg: var(--v-card-bg, var(--v-bg))`). Popovers replace UI — they should match.
   - `v-colors-code` — tinted paper for inline `<code>` (`--v-bg: color-mix(in hsl, var(--v-muted) 8%, var(--v-bg))`).
   - `v-colors-pre` — always dark, even in light mode (`--v-bg: #141821; --v-fg: #fdf3e1; --v-muted: #d1ccc4`). Code blocks are terminal-context: dense, syntax-colored, monospaced.
   - `v-colors-callout` — tinted background + auto weight-bump. Re-sets `--v-font-weight-normal: 500`, `--v-font-weight-label: 600`, `--v-font-weight-strong: 800`. The entire weight stack shifts up ~100 for readability on a mid-tone surface. *(Aesthetic spec §05)* `v-colors-warn` and `v-colors-info` should apply the same weight bump (they are also tinted-surface variants).
   - `v-colors-highlight` — active-descendant / selected-item highlight (uses `--v-accent` or `--v-link` as bg). Used by menus, lists, and other keyboard-navigated components in conjunction with `data-v-kb-nav`.

2. **`surface.css`** — `v-surface-card`, `v-surface-elevated`, `v-surface-sunken`, `v-surface-glass`, `v-surface-gradient` (§7).
3. **`radius.css`** — `v-radius-flat` (§8.2).
4. **`text.css`** — `v-text-display`, `v-text-meta` if needed. Sparingly.

**State mixins** (`tools/states.css`): *(Aesthetic spec §06, §07)*

5. **`states.css`** — defines the two core interaction mixins that all interactive components use:
   - **`t-hover` mixin**: `filter: contrast(0.95) saturate(1.15); will-change: filter;` — one filter that works on every button, link, badge, and tone. No per-palette hover-color knobs. The filter subtly darkens while making colors pop.
   - **`t-focus-ring` mixin**: `box-shadow: var(--v-shadow-focus); outline: 2px solid var(--v-ring); outline-offset: 2px;` — stacks a soft halo (`--v-ring-alt` via `--v-shadow-focus`) under a crisp outline (`--v-ring`). Both are needed — outline alone is invisible against busy layouts, halo alone is fuzzy.
   - Components consume these: `c-button:hover { @mixin t-hover; box-shadow: var(--v-shadow-outer); }`, `c-button:active { box-shadow: none; }`, `c-button:focus-visible { @mixin t-focus-ring; }`.

### 3b: Components (`src/lib/css/components/`)

Pure CSS components from §10.1, in rough priority order:

1. **`button.css`** — `c-button`. Layers `@mixin t-hover` + `box-shadow: var(--v-shadow-outer)` on hover, `box-shadow: none` on active. `@mixin t-focus-ring` on `:focus-visible`. `c-button--icon` for square mode. All transitions via `var(--v-duration) var(--v-ease)`.
2. **`card.css`** — `c-card`. Surface chrome on `o-box` / `o-text-box`. **Conditional shadow**: cards inside `o-container` on wide viewports lose `--v-shadow-outer`; cards inside `:modal` / `:popover-open` always show it. *(Aesthetic spec §15)* Also: `:has(:invalid, [aria-invalid="true"]) [type="submit"]` renders at `opacity: 0.5` but keeps `pointer-events: unset` — the disabled-looking submit must remain clickable so the form engine can dispatch focus to the first invalid field. *(Aesthetic spec §18)*
3. **`input.css`** — `c-input`. Inner shadow (`--v-shadow-inner`), `@mixin t-focus-ring`, invalid-state border (`var(--v-danger-text)`).
4. **`alert.css`** — `c-alert`. Text-mode, toned via `v-colors-*`. **Empty collapse**: `.c-error-message:empty { display: none; }` and `.c-alert:has(.c-alert__children[data-t-empty]) { display: none; }` — error containers collapse to zero height when empty, preventing dead vertical bands in forms. *(Aesthetic spec §19)*
5. **`checkbox.css`**, **`radio.css`** — `c-checkbox`, `c-radio`. Custom-styled native inputs.
6. **`toggle.css`** — `c-toggle`. Pure CSS via `:checked`.
7. **`select-native.css`** — `c-select-native`. Styled chrome around `<select>`.
8. **`tag.css`** — `c-tag`. Composes `o-caption`.
9. **`badge.css`** — `c-badge`. Composes `o-caption`.
10. **`avatar.css`** — `c-avatar`. Square-mode.
11. **`spinner.css`** — `c-spinner`. CSS animation.
12. **`skeleton.css`** — `c-skeleton`. CSS animation.
13. **`disclosure.css`** — `c-disclosure`. `<details><summary>`.
14. **`tooltip.css`** — `c-tooltip`. Anchor positioning, `[popover]`, no JS. Applies `v-colors-tooltip` (always inverted).

Browser-primitive component chrome (§10.2) — these need CSS only at this phase; JS wiring comes in Phase 5:

15. **`tabs.css`** — `c-tabs`. Tablist chrome. **Selected-tab indicator**: uses `color-mix(in hsl, var(--v-border-dynamic-base) var(--v-border-dynamic-mix), var(--v-accent))` for the border color — same `color-mix` recipe as dynamic borders but mixing against the active tone. Use `inset box-shadow` for the underline so neighboring tabs don't shift on selection. The indicator self-themes: a tab strip inside `v-colors-success` picks up the success tone. *(Aesthetic spec §17)*
16. **`modal.css`** — `c-modal`. Centered `<dialog>`, backdrop (`backdrop-filter: blur(4px)`), `@mixin t-focus-ring`. **Scroll-edge shadows**: scrollable modal content gets `--v-shadow-inner-top` when not scrolled to top and `--v-shadow-inner-bottom` when not scrolled to bottom, driven by `data-scroll-top` / `data-scroll-bottom` attributes set by a DOM handler. *(Aesthetic spec §16)*
17. **`drawer.css`** — `c-drawer`. Edge-anchored `<dialog>` with side variants.
18. **`popover.css`** — `c-popover`. Anchor-positioned `[popover]`. Applies `v-colors-popover` (matches surrounding chrome).
19. **`menu-component.css`** — `c-menu`. Chrome on `o-menu`. Menu item highlight is conditional on keyboard/mouse mode: `body:not([data-v-kb-nav="true"]) .o-menu-item:hover` vs `body[data-v-kb-nav="true"] .o-menu-item[data-active]` both apply `v-colors-highlight`. *(Aesthetic spec §09)*
20. **`styled-select.css`** — `c-styled-select` chrome.

### 3c: Tools (`src/lib/css/tools/`)

The narrow set from §11: `t-px-0`, `t-py-0`, `t-p-0`, `t-px`, `t-py`, `t-p`, `t-flex`, `t-flex-fill`, `t-flex-auto`, `t-flex-none`, `t-flex-wrap`, `t-block`, `t-inline`, `t-inline-block`, `t-hidden`, `t-sr-only`, `t-border`, `t-border-none`, `t-border-inner`, `t-radius-none`, `t-radius-full`, `t-shadow`, `t-shadow-inner`, `t-shadow-outer`, `t-shadow-none`, `t-align-start`, `t-align-center`, `t-align-end`, `t-truncate`.

### 3.T Tests

Extend the CSS test harness with markup for every component in every major state (default, hover-simulated via class, focus, disabled, invalid where applicable). Add variant demonstrations (each `v-colors-*` applied to buttons, cards, alerts).

Write `src/lib/css/components.desktop.e2e.ts`:

- **Buttons**: verify `c-button` has correct padding (from `o-input-box`), border-radius, hover shadow. Test `c-button--icon` is square. Test tonal variants (`v-colors-primary`, `v-colors-danger`) change background/text color.
- **Cards**: verify `c-card` has shadow, border, correct radius. Test `v-surface-card` vs `v-surface-elevated` shadow difference.
- **Inputs**: verify `c-input` has inner shadow, correct height (`--v-input-height`). Simulate `:focus` and verify focus ring appears. Test `:invalid` / `aria-invalid` state styling.
- **Checkboxes/Radios**: verify custom styling replaces browser defaults. Test `:checked` state.
- **Toggle**: verify unchecked/checked visual states. Track width and thumb position.
- **Alerts**: verify tonal coloring with `v-colors-success`, `v-colors-danger`, `v-colors-warn`.
- **Tooltips** `@chromium-only`: verify anchor positioning places tooltip near its anchor. Verify popover shows/hides.

Write `src/lib/css/components.mobile.e2e.ts`:

- Verify touch-target sizing: buttons and inputs meet minimum 44px tap target.
- Verify card shadows are suppressed inside containers on mobile (if this pattern carries forward).

### 3.D Design notes

Each component needs visual polish beyond just "applies the right CSS class." Reference v1 files via `git show main:src/lib/styles/components/<name>.css` and `git show main:src/lib/styles/tools/elements.css` for patterns to carry forward:

**Buttons:**
- Hover: `filter: contrast(0.95) saturate(1.15)` + `box-shadow: var(--v-shadow-outer)` (darkens slightly while making colors pop)
- Active: `box-shadow: none` (pressed feel)
- Transition: `color, background-color, border-color, box-shadow` all transition at `calc(var(--v-duration) * 0.5) var(--v-ease)` (fast feedback)

**Inputs:**
- Inner shadow: `var(--v-shadow-inner)` for embossed feel (not flat)
- Focus ring: dual ring — inner `box-shadow: 0 0 0 0.125rem var(--v-ring-alt)` + outer `outline: 0.125rem solid var(--v-ring)` with offset. Must be clearly visible on any background.
- Disabled: opacity blend (~65%) + `cursor: not-allowed`

**Cards:**
- Default shadow: `var(--v-shadow-outer)`
- Border: dynamic via `color-mix()` (not a flat `#ccc` border)

**Toggles:**
- Track: inner shadow for depth
- Thumb: smooth transform transition, tooltip-inverted color
- Checked: `--v-accent` or `--v-link` background, thumb slides to far end

**Modals:**
- Backdrop: semi-transparent `hsl(0 0% 0% / 50%)` + `backdrop-filter: blur(4px)`
- Entry/exit: fade transition with visibility step
- Scrollable content: inner shadows at top/bottom to indicate scroll direction

**Alerts / Callouts:**
- Font weight boost inside colored backgrounds: labels 500→600, strong 700→800. Ensures readability on tinted backgrounds.

**All interactive elements:**
- Transitions on state changes (not instant). Base pace is `var(--v-duration)` (~240ms); fast feedback uses `calc(var(--v-duration) * 0.5)`, extended transitions use `calc(var(--v-duration) * 2)`. `prefers-reduced-motion` zeros `--v-duration`.
- Consistent cursor changes: `pointer` on clickable, `not-allowed` on disabled, `text` on inputs.

**Done when:** A plain HTML page can render every component from §10.1 with appropriate tonal variants and surface treatments, using only CSS classes and native HTML. No JS. Buttons, cards, alerts, inputs, toggles, modals (opened via `commandfor`), and tooltips (via `[popover]` + anchor positioning) all render correctly. Components should look polished — hover a button and see a shadow appear with a smooth transition, focus an input and see a clear ring, toggle a switch and see the thumb slide.

---

## Phase 4: Utils (`src/lib/utils/`)

**Goal:** Framework-agnostic JS/TS utilities. No DOM types, no framework imports.

**Dependency:** None — can run in parallel with Phases 2–3.

1. **Scaffold.** `janus.json` (`depends: []`), `README.md`, `CHANGELOG.md`, `tsconfig.json` (no `dom` lib), `eslint.config.js`, `vitest.config.ts`.
2. Port utilities from v1's `src/lib/utility/` that have no DOM dependency: data structures, type guards, memoization, text formatting, etc. Audit each for `window`/`document` references — anything that touches the DOM belongs in `dom/`.

**Key files to evaluate for porting** (v1 paths → v2 `utils/`):
- `memoize/*.ts`, `lru-cache.ts`, `priority-queue.ts` — pure data structures
- `sort-by.ts`, `find-last-index.ts`, `iterators.ts`, `compact.ts` — pure utilities
- `camel-to-kebab.ts`, `normalize-text.ts`, `parse.ts` — string utilities
- `text/*.ts` (date-time, list, number, plural, relative-time, t-tag) — formatting
- `error-code.ts`, `deferred.ts`, `debounce-async.ts`, `throttle.ts` — async/control flow
- `type-helpers.ts` — types only

Skip (DOM-dependent, belongs in `dom/`): `focusables.ts`, `get-scrollable-parent.ts`, `is-visible.ts`, `is-focus-visible.ts`, `element-types.ts`, `event-propagation.ts`, `multi-view.ts`, `document-setup.ts`, `unmount-observer.ts`, `browser.ts`, `os.ts`.

**Done when:** `utils/` builds and tests pass with no DOM types in scope. The boundary lint rule (once built in Phase 8) confirms no cross-package imports.

---

## Phase 5: DOM layer (`src/lib/dom/`)

**Goal:** The framework-agnostic JS behavior system from §12.

**Dependency:** Phase 4 (utils). CSS classes from Phases 1–3 are referenced by name only (string constants in `data-js` tokens), not imported.

Build in this order — each piece depends on the previous:

1. **Scaffold.** `janus.json` (`depends: ["utils"]`), `README.md`, `CHANGELOG.md`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`.
2. **`config.ts`** — `setup()` and the `JS_ATTR` constant (default `"data-js"`).
3. **`compose-attrs.ts`** — `ca`, `only`, `concat`, `override`, `CombineAttrs` factory (§12.2.1). This is the core primitive everything else uses. Build and test thoroughly.
4. **`dispatch.ts`** — `registerBehavior` + the document-level capture-phase dispatcher (§12.2.2–12.2.3). Lazy listener installation per event type.
5. **`mount.ts`** — initial DOM scan + `MutationObserver` wiring. Fires synthetic `mount` events.
6. **`form/`** — the form engine (§12.1):
   - `validate.ts` — `registerValidator`, `addValidator`, `isDirty`, touched-state machine, the per-field dispatch logic.
   - `submit.ts` — `registerSubmitHandler`, `addSubmitHandler`, `setErrors`, `setFormError`, disabled-state filtering, submit choreography.
   - `index.ts` — public API re-exports.
7. **`handlers/`** — behavior modules (§12.2.4). Order by dependency:
   - `t-roving-focus.ts` — used by tabs, menus, styled-select
   - `t-request-close.ts` — used by modal, drawer, popover. Exports `onRequestClose` and `forceClose`.
   - `t-focus-trap.ts`, `t-restore-focus.ts` — standalone
   - `t-typeahead-filter.ts`, `t-active-descendant.ts`, `t-open-tab.ts` — standalone
   - `t-kb-nav.ts` — **new** *(Aesthetic spec §09)*. Toggles `body[data-v-kb-nav="true"]` on first Tab/arrow-key, removes on first mousedown. This single boolean drives the CSS conditional for menu hover vs. active-descendant highlighting, ensuring mouse users see hover highlights while keyboard users see active-descendant highlights — never both simultaneously.
   - `t-empty.ts` — **new** *(Aesthetic spec §19)*. Sets `data-t-empty` attribute on containers whose children render no visible content. Drives the empty-alert/error-message collapse in CSS (`.c-alert:has([data-t-empty]) { display: none }`).
   - `t-scroll-shadow.ts` — **new** *(Aesthetic spec §16)*. Observes scroll position of modal/drawer content areas. Sets `data-scroll-top` when scrolled to top, `data-scroll-bottom` when scrolled to bottom. CSS uses these to show/hide `--v-shadow-inner-top` / `--v-shadow-inner-bottom`.
   - Form behaviors: `t-validate.ts`, `t-submit.ts`, `t-validate-group.ts`, `t-validate-error.ts`, `t-reset-on-close.ts`, `t-close-on-success.ts`
   - Component-internal: `c-modal__close.ts`, `c-modal-speed-bump.ts`, `c-tabs__select.ts`, etc.
8. **`components/`** — thin compositions (§12.3): `tabs.ts`, `modal.ts`, `drawer.ts`, `popover.ts`, `menu.ts`, `styled-select.ts`.
9. **`index.ts`** — public API (no handler side-effects). **`all.ts`** — Pattern A entry that imports every handler.

### 5.T Tests

**Unit tests (Vitest)** — colocated as `*.test.ts`:

- **`compose-attrs.test.ts`**: the full merge matrix. Test `ca()` with: `id`/`role` conflict throws; `data-js` concats with space; `data-*` conflict throws; `class` concats; ARIA attrs concat; nested `concat()`/`override()` wrappers. Test `only()` filtering. Test mismatched wrapper types (e.g. `concat` vs `override` on same key).
- **`validate.test.ts`**: registry path (`registerValidator` + lookup by name), WeakMap path (`addValidator` + lookup by element ref), touched-state machine (untouched → touched on blur, dirty on input), validation dispatch (returns error string, clears on fix), group validation.
- **`submit.test.ts`**: registry path, closure path, disabled-state filtering (`aria-disabled` inputs excluded from FormData), submit choreography (validate → collect → handler → success/error), `setErrors` / `setFormError` server-fed error flow.
- **`dispatch.test.ts`**: `registerBehavior` creates listener on first registration, walks `data-js` ancestor chain, multiple behaviors on one element via space-separated tokens.

**E2E tests (Playwright)** — create an interactive HTML test harness (`src/lib/dom/test-harness.html`) that loads `css/index.css` + `dom/all`:

- **`tabs.desktop.e2e.ts`**: arrow key navigation between tabs, Home/End, `aria-selected` toggles, panel visibility toggles.
- **`modal.desktop.e2e.ts`**: open via `commandfor` `@chromium-only`, ESC closes, outside-click closes, focus trap keeps focus inside, focus restores on close.
- **`menu.desktop.e2e.ts`**: open menu, arrow key navigation, typeahead letter-jump, Enter selects, ESC closes.
- **`form-validation.desktop.e2e.ts`**: submit empty form → errors appear on touched fields, fix one field → its error clears, submit again → remaining errors shown, successful submit → handler called.
- **`form-validation.mobile.e2e.ts`**: same flows using `.tap()` instead of `.click()`, verify touch-friendly error display.

**Done when:** A plain HTML page with `css/index.css` + a `<script>` that imports `dom/all` + calls `mount()` renders interactive tabs, a modal with ESC-close, a form with validation + submit choreography, and a menu with keyboard nav — all without any framework.

---

## Phase 6: Solid layer (`src/lib/solid/`)

**Goal:** Thin Solid wrappers from §13.

**Dependency:** Phases 1–5 (CSS classes, DOM behaviors).

1. **Scaffold.** `janus.json` (`depends: ["css", "dom", "utils"]`), configs.
2. **`aria.ts`** — `ariaize()` + `attrs()` (§13.1).
3. **`use-labelled-input.ts`** — the hook (§13.2). Test ID generation, `aria-describedby` joining.
4. **`labelled-input.tsx`** — `LabelledInput`, `LabelledInline`, `LabelledInputGroup` (§13.2).
5. **All components** — a Solid component for every item in §10. Each is a thin prop→attribute mapper rendering the correct CSS classes and `data-js` tokens via `ca()` merge. Even components that are "just CSS" (no interactivity) get a Solid wrapper — it enforces consistent API, correct ARIA, and makes the component discoverable on the demo page.

   **Complete component catalogue:**

   | File | Exports | CSS class(es) | Notes |
   |---|---|---|---|
   | `button.tsx` | `Button`, `IconButton` | `c-button o-input-box`, `c-button c-button--icon o-input-box` | Props: `variant` (maps to `v-colors-*`), `disabled` (→ `aria-disabled`). `IconButton` sets square mode. |
   | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | `c-card o-box` | `Card` accepts `surface` prop (maps to `v-surface-*`). Subcomponents are thin `<div>`/`<h*>`/`<p>` wrappers for structure. |
   | `alert.tsx` | `Alert` | `c-alert` | Props: `variant` (maps to `v-colors-*`), `role` (defaults to `"alert"`). |
   | `input.tsx` | `Input` | `c-input o-input-box` | Props: `validators`, `onValidate` (§13.4), standard input attrs. Wires `aria-invalid`, `aria-describedby` from `useLabelledInput` when used inside `LabelledInput`. |
   | `textarea.tsx` | `Textarea` | `c-input o-input-box` | Same validation props as `Input`. Renders `<textarea>`. |
   | `checkbox.tsx` | `Checkbox` | `c-checkbox` | Renders custom-styled native `<input type="checkbox">`. Props: `disabled`, `checked`, `indeterminate`. |
   | `radio.tsx` | `Radio`, `RadioGroup` | `c-radio` | `RadioGroup` renders `<fieldset role="radiogroup">` with `data-js="t-roving-focus"`. `Radio` renders `<input type="radio">`. |
   | `toggle.tsx` | `Toggle` | `c-toggle` | Renders `<input type="checkbox" role="switch">`. Props: `checked`, `disabled`. |
   | `select-native.tsx` | `SelectNative` | `c-select-native o-input-box` | Wraps native `<select>`. Props: `options` (convenience) or `children` for `<option>` elements. |
   | `tag.tsx` | `Tag` | `c-tag` | Props: `variant`, `onRemove` (renders remove button). |
   | `badge.tsx` | `Badge` | `c-badge` | Props: `variant`, `dot` (boolean for dot-indicator mode). |
   | `avatar.tsx` | `Avatar` | `c-avatar o-square` | Props: `src`, `alt`, `fallback` (initials or icon). |
   | `spinner.tsx` | `Spinner` | `c-spinner o-square` | Props: `size`. Renders `aria-label="Loading"` by default. |
   | `skeleton.tsx` | `Skeleton` | `c-skeleton` | Props: `width`, `height`, `circle` (boolean). |
   | `disclosure.tsx` | `Disclosure` | `c-disclosure` | Renders `<details><summary>`. Props: `summary` (content for summary), `open`. |
   | `tooltip.tsx` | `Tooltip` | `c-tooltip` | Renders anchored `[popover]`. Props: `content`, `anchor` (ID of the anchor element). No JS — pure CSS anchor positioning. |
   | `tabs.tsx` | `Tabs`, `TabList`, `Tab`, `TabPanel` | `c-tabs` | `TabList` renders `<div role="tablist" data-js="t-roving-focus c-tabs__select">`. `Tab` renders `<button role="tab">`. `TabPanel` renders `<div role="tabpanel">`. |
   | `modal.tsx` | `Modal` | `c-modal o-dialog` | Renders `<dialog>` with `data-js="t-request-close t-restore-focus"`. Props: `id` (required for `commandfor` triggers), `onClose`. |
   | `drawer.tsx` | `Drawer` | `c-drawer o-dialog` | Same as `Modal` but adds `c-drawer--{side}` modifier. Props: `side` (`'left'|'right'|'top'|'bottom'`). |
   | `popover.tsx` | `Popover` | `c-popover` | Renders `[popover]` with anchor positioning. Props: `anchor` (ID), `id`. |
   | `menu.tsx` | `Menu`, `MenuItem` | `c-menu o-menu`, `o-menu-item` | `Menu` renders `[popover] role="menu"` with `data-js="t-roving-focus t-typeahead-filter t-request-close"`. `MenuItem` renders `<button role="menuitem">`. |
   | `styled-select.tsx` | `StyledSelect` | `c-styled-select` | The one composite component. Props: `options`, `value`, `onChange`, `renderOption`. Wires `data-js="t-roving-focus t-active-descendant t-typeahead-filter"`. |
   | `password.tsx` | `Password` | `c-input o-input-box` | Extends `Input` with show/hide toggle. |

6. **Form wrappers** — `Form`, `FormGroup`, `FormError`, `SubmitButton` (§13.5). `FormContext` for cross-portal `form=` targeting.
7. **Modal form** — `ModalForm`, `ModalSpeedBump` (§13.6).
8. **`utils/`** — Solid-specific helpers (signals, resources, etc.) that v1 had in `src/lib/utility/solid/`. Keep internal to `solid/`.

### 6.T Tests

**Unit tests (Vitest)** — colocated as `*.test.ts`:

- **`aria.test.ts`**: `ariaize({ disabled: true })` → `{ 'aria-disabled': true }`, never native `disabled`. `attrs('foo', undefined, 'bar')` → `'foo bar'`, `attrs(undefined)` → `undefined`.
- **`use-labelled-input.test.ts`**: ID generation is deterministic (`${id}-label`, `-desc`, `-err`). `aria-describedby` joins description + error IDs only when rendered. `errorMessage` prop present → `data-external-error` marker emitted.

**E2E tests (Playwright)** — these test Solid-rendered components, not raw HTML. Create a Solid test app (`src/lib/solid/test-app/`) that renders each component with representative props. This app doubles as a development playground during the build and as the E2E target.

Write one E2E file per component group, following v1's `describeComponent` pattern (see Testing strategy below). Key tests:

- **`button.desktop.e2e.ts`**: renders all variants (default, primary, danger), sizes, disabled state. Verify `aria-disabled` present (not native `disabled`). Verify `IconButton` is square.
- **`card.desktop.e2e.ts`**: renders card with subcomponents. Verify structure and surface variants.
- **`input.desktop.e2e.ts`**: renders default, error, disabled states. Verify `aria-invalid`, `aria-describedby`, placeholder. Test `LabelledInput` wrapper renders correct label association.
- **`checkbox.desktop.e2e.ts`**: click toggles checked state. Verify `aria-checked`. Test disabled. Test indeterminate via evaluate.
- **`radio.desktop.e2e.ts`**: arrow keys navigate within group (`t-roving-focus`). Selection updates `aria-checked`.
- **`toggle.desktop.e2e.ts`**: click toggles, verify visual state change and `aria-checked`.
- **`select-native.desktop.e2e.ts`**: renders options, selection works.
- **`tabs.desktop.e2e.ts`**: arrow keys navigate tabs, `aria-selected` updates, panel visibility toggles.
- **`modal.desktop.e2e.ts`**: open/close, focus trap, ESC close, `commandfor` trigger `@chromium-only`.
- **`drawer.desktop.e2e.ts`**: open from each side, close behavior.
- **`menu.desktop.e2e.ts`**: open, arrow nav, typeahead, select, close.
- **`tooltip.desktop.e2e.ts`**: hover anchor → tooltip visible `@chromium-only` (anchor positioning).
- **`form.desktop.e2e.ts`**: full validation flow — submit empty → errors, fix → errors clear, successful submit → handler called. Test `FormError` displays form-level error. Test `SubmitButton` outside form via `form={id}`.
- **`modal-form.desktop.e2e.ts`**: submit flow, `t-close-on-success` closes modal, `t-reset-on-close` clears fields, speed bump on dirty close.
- **`hydration.desktop.e2e.ts`**: render SSR output, hydrate, verify no console mismatch warnings. Compare SSR HTML structure against hydrated DOM.

Mobile E2E tests (`*.mobile.e2e.ts`) for touch-critical components: buttons (tap), modals (tap outside to close), menus (tap navigation), forms (tap to focus + virtual keyboard considerations).

**Done when:** A Solid app can render every component from the catalogue above with correct props, ARIA attributes, and CSS classes. `<LabelledInput>` with validation, `<Form>` with submit handling, and `<ModalForm>` with speed bump all work end-to-end through the DOM layer's `data-js` dispatch. Hydration works without mismatch. All E2E tests pass in Chromium; cross-browser tests pass in Firefox and WebKit.

---

## Phase 7: Plugins

**Goal:** Vite plugins from §3.1.

1. **`vite-plugin-purgecss.ts`** — adapt from v1. Removes unused CSS classes from emitted output.
2. **`vite-plugin-ssg.ts`** — adapt from v1. Static-site generation for SSR routes.
3. **`vite-plugin-janus-bundle.ts`** — **new** (§12.4). Text-scans SSR output for `data-js` tokens, generates a client entry importing only the matching handler modules. This depends on the filename-as-manifest convention from Phase 5 being stable.

**Done when:** A build with all three plugins produces a production bundle where: unused CSS is stripped, SSR pages are pre-rendered, and the client JS contains only the handler modules referenced in the SSR output.

---

## Phase 8: Scaffolding & enforcement

**Goal:** The cross-cutting infrastructure from §3.2–3.4 and §16.

Can start as early as Phase 1 (the boundary rule is most useful once multiple pseudo-packages exist) but must be complete before shipping.

1. **ESLint boundary rule** (§3.3) — custom rule that reads each pseudo-package's `janus.json` `depends` and rejects cross-package imports not listed there. Run in CI.
2. **Per-pseudo-package configs** (§3.4) — `tsconfig.json`, `eslint.config.js`, `vitest.config.ts` per package. `css/` gets stylelint only; `utils/` forbids DOM types; `dom/` forbids framework imports; `solid/` allows everything.
3. **Root `README.md`** — includes the "Updating your fork" section (§3.2) written for a consumer's agent.
4. **Root `CHANGELOG.md`** + per-pseudo-package `CHANGELOG.md` files — dated entries with `BREAKING` / `ADDED` / `CHANGED` labels and "consumer action required" lines (§3.2).

**Done when:** `npm run lint` catches a deliberate cross-package import violation. Each pseudo-package's `tsconfig.json` scopes types correctly. The root README's "Updating your fork" section is clear enough for an agent to follow without human guidance.

---

## Phase 9: Demo site

**Goal:** The demo / marketing site from §19–21.

**Dependency:** All previous phases — the site exercises the full stack.

### 9a: Site shell

1. SSR-first architecture: all pages render server-side via `vite-plugin-ssg`.
2. Top nav with links to each page + config modal trigger. SSR, not hydrated.
3. Config modal (§21): carry forward existing prefs (color scheme, animations, font family, font size). Add the **Knobs section** — text inputs for all primary knobs (`--v-spacing`, `--v-radius`, `--v-input-height`, `--v-border-width`, `--v-font-size`, `--v-line-height`, `--v-font-family`, `--v-font-family-mono`), secondary knobs behind a `<details>` expando (pad/gap derivatives, font-size/line-height derivatives, shadow knobs). Persist via `ui-style-prefs`. Reset button clears all.

### 9b: Pages

4. **Home** (§20.1) — landing page with explanatory text, visual samples, navigation cards. The visual samples should show off the design system's polish: a card with surface treatment and shadow, a row of tonal buttons, a form snippet with labeled inputs. Not a wall of text.
5. **Components** (§20.2) — sidebar + `o-grid` of component demos. Sidebar uses `o-split` / `c-drawer` recipe from §10.4. **Each component from §10 gets its own demo card.** See the component demo catalogue below.
6. **Typography** (§20.3) — headings, prose, lists, tables, code, with a token reference table.
7. **Colors** (§20.4) — APCA contrast grid (SSR) + color playground (island). Playground has text inputs for `--v-bg`, `--v-link`, `--v-accent`, `--v-muted`; `--v-fg` shown read-only. Scoped preview area with live contrast ratios.
8. **SPA** (§20.5) — SSR shell + hydrated island hosting component demos. Validates the island pattern.

### 9c: Component demo catalogue

Every component gets a demo card on the Components page. Each demo card uses the `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` pattern. Each card has a unique `id` for sidebar anchor linking and E2E test scoping. Reference v1's demo files (`git show main:src/demos/<name>-demo.tsx`) for content structure — adapt for v2 class names and patterns.

| Demo card | id | What to show |
|---|---|---|
| **Buttons** | `buttons-demo` | Row of default buttons (sm/md/lg sizes if supported). Row of tonal variants: default, `v-colors-primary`, `v-colors-danger`. Disabled button. `IconButton` examples. Ghost/link-style buttons if applicable. Full width: `t-col-span-full`. |
| **Cards** | `cards-demo` | Grid of cards with different surface treatments: `v-surface-card`, `v-surface-elevated`, `v-surface-sunken`, `v-surface-glass`, `v-surface-gradient`. Each card contains a title, body text, and a link. |
| **Alerts** | `alerts-demo` | Stack of alerts in each tonal variant: default, `v-colors-success`, `v-colors-warn`, `v-colors-danger`, `v-colors-info`. Each with representative text and an optional close trigger. |
| **Inputs** | `inputs-demo` | Default input, input with placeholder, input with value, error state (`aria-invalid`), disabled state. Email and URL type inputs. Input inside `LabelledInput` with description text. Input inside `LabelledInput` with error message. |
| **Textareas** | `textareas-demo` | Default textarea, with placeholder, disabled, error state. Inside `LabelledInput`. |
| **Checkboxes** | `checkboxes-demo` | Unchecked, checked, indeterminate, disabled checked, disabled unchecked. Each with a label. Group of checkboxes. |
| **Radios** | `radios-demo` | Radio group with 3-4 options. One pre-selected. Disabled option. Horizontal and vertical layouts. |
| **Toggles** | `toggles-demo` | Toggle off, toggle on, disabled. Each with label text. |
| **Native Selects** | `selects-demo` | Default select with options, select with initial value, disabled select. Inside `LabelledInput`. |
| **Styled Select** | `styled-selects-demo` | Select with rendered options (e.g., color swatches or icons alongside text). Single selection. Shows the composite component's full interaction. |
| **Tags** | `tags-demo` | Row of tags in different tonal variants. Removable tag with `onRemove`. |
| **Badges** | `badges-demo` | Count badges (numeric), dot badges. Different variants. |
| **Avatars** | `avatars-demo` | Image avatar, fallback-initials avatar. Different sizes via scoped `--v-input-height`. |
| **Spinners** | `spinners-demo` | Default spinner, different sizes. Spinner inside a button (loading state pattern). |
| **Skeletons** | `skeletons-demo` | Text skeleton lines, circle skeleton, card-shaped skeleton. |
| **Disclosure** | `disclosure-demo` | Default closed, default open. Nested disclosure. Styled summary. |
| **Tooltips** | `tooltips-demo` | Tooltip on hover (anchor positioning). Different positions if configurable. Tooltip with longer content. `@chromium-only` for full positioning demo; show a static fallback note for other browsers. |
| **Tabs** | `tabs-demo` | Tab group with 3-4 tabs, each with panel content. One disabled tab. Demonstrate keyboard navigation (arrow keys). |
| **Modals** | `modals-demo` | Button that opens a basic modal. Modal with scrollable content (shows inner shadows). Modal with form inside. Modal speed bump demo (edit form, try to close). |
| **Drawers** | `drawers-demo` | Buttons opening drawers from each side (left, right, top, bottom). Drawer with navigation content. |
| **Popovers** | `popovers-demo` | Button triggering a popover. Popover with content. `@chromium-only` for anchor-positioned placement. |
| **Menus** | `menus-demo` | Button opening a dropdown menu. Menu with icons. Menu with keyboard navigation (demonstrate typeahead). |
| **Forms** | `forms-demo` | Complete form with multiple input types, validation, and submit handling. Shows validation errors on submit, field-level error clearing, successful submission output. Include a `FormGroup` for cross-field validation. |
| **Modal Forms** | `modal-forms-demo` | Button opens modal form. Submit success closes modal. Dirty form + close triggers speed bump. Reset on close. |

Each demo card should use the actual Solid components (not raw HTML), so the demos double as integration tests for the Solid wrapper layer.

### 9.T Tests

Write page-level E2E smoke tests. Use v1's `describeComponent` pattern — each test scopes to a demo card by `id`, scrolls it into view, and runs assertions within that container.

**`demo-site.desktop.e2e.ts`** — page-level:

- Each page (`/`, `/components`, `/typography`, `/colors`, `/spa`) loads without errors.
- Top nav links navigate correctly between pages.
- Config modal opens from nav trigger, knob inputs are present, closing persists values.
- Knob changes visibly affect the page (e.g., change `--v-spacing` → verify padding changes on a card).
- Reset button clears all knob overrides.
- Color scheme toggle (light/dark/system) changes page appearance.

**`components.desktop.e2e.ts`** — per-component:

One `describeComponent` block per demo card from the catalogue above. Each block tests the component's interactive behavior within the demo context. These are the **primary verification layer** — if a component renders correctly in the demo, it works. Key tests per component:

- Buttons: click, verify no errors. Disabled button click is no-op.
- Inputs: focus → type → blur → verify value. Error state shows error message.
- Checkboxes: click → verify checked state toggles.
- Tabs: click tab → panel changes. Arrow keys navigate.
- Modal: trigger open → verify visible → ESC → verify closed.
- Menu: trigger open → arrow down → verify focus moves → Enter → verify selection.
- Form: submit empty → verify errors → fill required → submit → verify success output.
- Tooltips `@chromium-only`: hover anchor → tooltip visible.

**`components.mobile.e2e.ts`** — mobile-specific:

- Touch interactions: `.tap()` instead of `.click()`.
- Sidebar collapses to drawer on mobile viewport.
- Drawer opens/closes via hamburger button.
- Modal/drawer touch-outside-to-close.

**`colors.desktop.e2e.ts`**:

- Contrast grid renders with APCA scores.
- Playground inputs change preview area colors live.
- `--v-fg` read-only display updates when `--v-bg` changes.

**Done when:** `npm run build` produces a multi-page static site. Every page works with JS disabled (SSR). The colors playground and SPA island hydrate correctly. The config modal's knob inputs visibly affect the page and persist across reloads. Reset clears everything. All E2E tests pass. Every component from §10 has a visible, interactive demo on the Components page.

---

## Cross-cutting notes

### What to port from v1 vs. rewrite

v1 source is reference, not a template. Use `git show main:<path>` to read v1 files without polluting the working tree. Specific things worth porting:
- `vite-plugin-purgecss.ts`, `vite-plugin-ssg.ts` — adapt, don't rewrite.
- Pure utilities headed for `utils/` — port directly, strip DOM deps. Key candidates listed in Phase 4.
- Demo component structure — adapt for v2 class names and patterns.
- APCA contrast computation in `colors.tsx` — reuse `apca-w3` / `colorparsley` integration.
- `ui-style-prefs.ts` infrastructure — reuse for the knob persistence in the config modal.

### Testing strategy

Testing is not an afterthought — it's built into every phase. Each phase above has a `*.T Tests` subsection specifying exactly what to test and where test files go. This section covers the cross-cutting patterns and conventions.

**Three test layers:**

1. **Unit tests (Vitest)** — for `utils/` and `dom/` pure logic. Colocate as `*.test.ts` next to source. Run via `npm run test:unit`.
2. **E2E tests (Playwright)** — the primary verification layer for anything involving rendering, CSS computation, or multi-element interaction. Colocate as `*.desktop.e2e.ts` / `*.mobile.e2e.ts`. Run via `npm run test:e2e`.
3. **Demo site as visual test** — the demo pages are the "test" for visual correctness. E2E tests verify behavior; the demos verify appearance.

**Test harness pattern (Phases 1–5).** Before the demo site exists, CSS and DOM tests need HTML pages to test against. Create minimal HTML test harnesses:

- `src/lib/css/test-harness.html` — loads `index.css`, renders static HTML with every object and component class. Grows through Phases 1–3.
- `src/lib/dom/test-harness.html` — loads `index.css` + `dom/all`, renders interactive elements (tabs, modals, forms, menus). Used in Phase 5.

These harnesses need Vite dev server support. Add them as entry points in `vite.config.ts` (multi-page app) alongside the main demo pages.

**`describeComponent` helper (Phase 6+).** Port v1's test helper pattern from `src/demos/test-utils/demo-e2e-helpers.ts`. This higher-order function:

1. Takes a demo `id` and a test callback.
2. For each configured page (default: both `/` and `/ssr` — or in v2, the equivalent CSR and SSR renders), navigates to the page, finds the element by `id`, scrolls it into view, verifies visibility.
3. Returns a scoped `Locator` so all assertions run within that demo container.

```ts
// v2 pattern — adapt from v1
export function describeComponent(
  id: string,
  fn: (getContainer: () => Locator) => void,
): void;
export function describeComponent(
  pages: string[],
  id: string,
  fn: (getContainer: () => Locator) => void,
): void;
```

This pattern ensures every component demo is tested in isolation and works in both CSR and SSR contexts. Tests use semantic queries (`getByRole`, `getByLabel`) over CSS selectors.

**Desktop vs. mobile E2E tests:**

- Desktop tests (`*.desktop.e2e.ts`): run in Chromium, Firefox, WebKit. Use `.click()`, keyboard navigation, hover states.
- Mobile tests (`*.mobile.e2e.ts`): run in Pixel 7 (Chromium) and iPhone 15 (WebKit). Use `.tap()`, test touch targets, verify mobile-specific layouts (sidebar → drawer collapse, etc.).

**`@chromium-only` convention (§0.4):** Tests exercising Chromium-only features (anchor positioning, `commandfor`, `scroll-state`) include `@chromium-only` in the test title. Firefox and WebKit projects skip them via `grepInvert`.

**What NOT to E2E test.** Pure CSS rendering that's adequately verified by visual inspection in the demo site (typography spacing, exact color values). Don't test `getComputedStyle` for every CSS property — test structural behavior (does the radius step down? does the grid reflow?) and interactive behavior (does the focus ring appear? does the modal close on ESC?).

**Test count expectation.** By the end of Phase 9, expect roughly: ~20 unit test files in `utils/`, ~10 in `dom/`, ~5 in `solid/`; ~5 CSS E2E files; ~5 DOM E2E files; ~25 Solid component E2E files (desktop); ~10 mobile E2E files; ~5 demo site E2E files. This matches v1's scale (~33 E2E files + unit tests).

### Design language — visual polish to carry forward from v1

v1's components look intentional and polished because of specific, deliberate design choices. Without these, components come out flat and generic. This section captures the key patterns an implementer must carry into v2. Reference v1 source via `git show main:<path>` for exact values.

**Key v1 reference files:**

| File | What to reference |
|---|---|
| `src/lib/styles/variables/color-schemes.css` | Default palette values, light/dark mode colors, gradient overlays |
| `src/lib/styles/variables/composition.css` | Shadow scale, animation durations, spacing scale |
| `src/lib/styles/variables/color-blocks.css` | Color block mixins, dynamic border derivation |
| `src/lib/styles/tools/elements.css` | Button/input base styles, hover/focus/active states, transitions |
| `src/lib/styles/tools/states.css` | Disabled, error, hover patterns |
| `src/lib/styles/tools/transitions.css` | Animation timing, visibility tricks |
| `src/lib/styles/components/button.css` | Button hover shadow, active press, icon button |
| `src/lib/styles/components/modal.css` | Backdrop blur, scroll shadows, fade transitions |
| `src/lib/styles/components/toggle-switch.css` | Track inner shadow, thumb transition, checked color |
| `src/lib/styles/components/tooltip.css` | Arrow rendering, max-width, reduced spacing |

**Palette warmth.** The default palette is NOT black-on-white. v1's defaults:

- Light bg: `hsl(30deg 12% 98.5%)` (warm off-white with a hint of cream)
- Dark bg: `hsl(216deg 16% 8%)` (deep blue-gray, not pure black)
- Primary/link: `hsl(195deg 100% 20%)` (saturated dark teal)
- Body background: subtle radial gradients at low opacity (warm peachy + cool cyan) layered over the solid bg color
- Text: `hsl(216deg 16% 8%)` light / `hsl(30deg 12% 98.5%)` dark (the bg/fg swap)

v2's color system (§7) is more flexible, but the **defaults** must produce this warmth. Generic `white`/`black`/`blue` defaults will make everything look like a Bootstrap clone.

**Interactive state transitions.** Every state change must be animated, not instant:

- One base duration: `--v-duration: 240ms`. Components derive faster (`calc(var(--v-duration) * 0.5)` for hover/active) or slower (`calc(var(--v-duration) * 2)` for extended transitions) from it. No `-sm/-md/-lg` scale.
- Timing: `--v-ease: cubic-bezier(0.4, 0, 0.2, 1)` (Material-style ease-out)
- Properties: `color, background-color, border-color, box-shadow, transform, opacity`
- Respect `prefers-reduced-motion`: zero `--v-duration` and everything follows

**Hover effects (buttons and links):**

```css
/* v1 pattern — the specific values that make hovering feel alive */
filter: contrast(0.95) saturate(1.15);  /* subtle darkening + color pop */
box-shadow: var(--v-shadow-outer);       /* lifts off the page */
```

Active/pressed: remove shadow (`box-shadow: none`) for a "pushed in" feel. This hover → active cycle makes buttons feel physical.

**Focus rings (all focusable elements):**

```css
/* v1 pattern — dual ring for visibility on any background */
box-shadow: 0 0 0 0.125rem var(--v-ring-alt);  /* inner, colored */
outline: 0.125rem solid var(--v-ring);           /* outer, contrasting */
outline-offset: 0.125rem;
```

The dual ring ensures visibility whether the element sits on a light or dark surface. Never rely on a single `outline` — it's invisible on matching backgrounds.

**Input embossing:**

```css
/* v1 pattern — inputs feel recessed, not flat */
box-shadow: var(--v-shadow-inner);  /* inset 0 1px 2px 0 rgb(0 0 0 / 10%) */
```

This subtle inner shadow makes inputs look like they're cut into the surface. Combined with the border and focus ring on focus, inputs have clear visual hierarchy.

**Dynamic borders:**

```css
/* v1 pattern — borders that adapt to any background */
border-color: color-mix(in hsl, var(--v-border-base) 17.5%, var(--v-bg));
/* light mode: --v-border-base is black → subtle dark border */
/* dark mode:  --v-border-base is white → subtle light border */
```

Never hardcode border colors as `#ccc` or `gray`. The `color-mix()` approach means borders look correct on any tinted background (alerts, cards, colored sections).

**Typography weight hierarchy:**

- Labels / nav items: `font-weight: 500` (medium)
- Selected / subtitle: `font-weight: 600` (semi-bold)
- Strong / title: `font-weight: 700` (bold)
- On colored backgrounds (alerts, callouts): bump all weights by one step (500→600, 600→700, 700→800) for readability against the tinted bg

**Component-specific polish checklist:**

| Component | Must-have polish |
|---|---|
| Button | Hover shadow + filter, active press, smooth transitions, tonal variant colors clearly distinct |
| Card | `--v-shadow-outer`, dynamic border, radius from object cascade, flatten in `o-container` |
| Input | Inner shadow, focus dual-ring, error state red border + `aria-invalid`, placeholder at muted color |
| Toggle | Inner shadow on track, smooth thumb slide transition, accent color on checked, thumb uses inverted color |
| Modal | Backdrop `blur(4px)`, fade transition, inner scroll shadows at top/bottom of scrollable content |
| Alert | Weight boost on tinted backgrounds, tonal variants clearly distinct, sufficient contrast |
| Tooltip | Small text (`--v-font-size-caption`), reduced spacing, rotated square arrow matching bg color |
| Menu | Subtle hover bg on items, active/selected item indicator, keyboard focus visible |
| Disclosure | Smooth summary marker rotation, content reveal transition |
| Spinner | Smooth CSS rotation animation, accent color |

### Browser feature gaps and fallbacks

The feature matrix in §0.4 shows three Chromium-only features. Handle each:

| Feature | Fallback strategy | Where in the plan |
|---|---|---|
| **CSS anchor positioning** | Required for `c-tooltip` and `c-popover` positioning. Non-Chromium browsers get un-positioned popovers (they render but don't track their anchor). This is acceptable — the spec (§15) treats anchor positioning as a hard requirement; consumers whose browsers don't support it pick a different library. No polyfill. | Phase 3 (tooltip/popover CSS) |
| **`commandfor`/`command`** | Hard requirement, same as anchor positioning. No shim, no polyfill. Consumers whose browsers don't support it pick a different library. | — |
| **`scroll-state()` container queries** | Graceful degradation only — the auto-hiding nav recipe (§10.4) stays visible when unsupported. No shim. | Phase 9 (demo site nav). |

### Aesthetic spec reference

The [aesthetic spec](./aesthetic-spec.html) is a live-demo document that catalogs 20 visual-mechanics principles v1 embeds that the v2 structural spec was not capturing. Every principle is rendered with v1's actual CSS so the document is its own proof. Open it in a browser to see the effects.

The principles are organized into five sections:

| Section | Principles | Key theme |
|---|---|---|
| **I. Surface & color** | 01–05 | Dynamic borders, body gradient, tooltip/popover/code surface roles, callout weight bump |
| **II. Hover, press, focus** | 06–09 | Filter-based hover, double-ring focus, link double-underline, keyboard/mouse mode |
| **III. Type, weight, stroke** | 10–12 | Weight-floor defaults, icon stroke scaling, heading demotion in `<header>` |
| **IV. Spacing, density, rhythm** | 13–14 | Spacing mixin bundles border/radius, hi-DPI density bump |
| **V. Context-aware chrome** | 15–20 | Card flatten in container, scroll shadows, tab self-theme, disabled-but-clickable submit, empty collapse, default truncation |

The core insight across all 20: **encode the relationship, not the value.** Borders aren't a color — they're 17.5% of the way from the surface toward the ink. Hover isn't a darker shade — it's a contrast filter. The link weight isn't 500 — it's "whatever the floor is." When implementers reach for literal values, the system loses its self-tuning property.

Each principle's additions have been incorporated into the PLAN.md phases above (marked with `*(Aesthetic spec §N)*`). The aesthetic spec HTML remains as the visual reference.

**Naming translation.** The aesthetic spec uses v1 token names. When referencing its CSS snippets, apply these v2 translations:

| Aesthetic spec (v1 names) | v2 equivalent |
|---|---|
| `--v-shadow-sm`, `--v-shadow-md`, `--v-shadow-lg` | `--v-shadow-outer` (one semantic knob; components needing stronger shadows write literal values or scope a redefinition) |
| `--v-shadow-inner` | `--v-shadow-inner` (unchanged) |
| `--v-animation-duration-sm/md/lg` | `--v-duration` (one base knob; derive faster via `calc(var(--v-duration) * 0.5)`, slower via `calc(var(--v-duration) * 2)`) |
| `--v-animation-timing` | `--v-ease` |
| `--v-inner-radius` | `--o-input-box__radius` (v2 uses the object-namespaced knob from the radius cascade §8) |
