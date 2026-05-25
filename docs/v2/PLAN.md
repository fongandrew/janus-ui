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
3. **`reset.css`** — box-sizing, margin resets, etc. Layer: `reset`.
4. **`tokens/`** — root knobs and mixins:
   - `spacing.css` — `--v-spacing`, the four derived `--v-pad-*` / `--v-gap-*`, and the `v-spacing` mixin (§5.3, §6). This file is the foundation; objects read these knobs.
   - `radius.css` — `--v-radius`, `--v-border-width` (§5.1, §8).
   - `color.css` — `--v-bg`, `--v-fg` (with the OKLCH derivation), `--v-link`, `--v-accent`, `--v-muted`, weight-min knobs (§5.1, §7).
   - `typography.css` — `--v-font-family`, `--v-font-family-mono`, `--v-font-size`, `--v-line-height`, all derived `--v-font-size-*` and `--v-line-height-*` tokens, the `--_font-size-floor` private intermediate (§5.1).
   - `shadow.css` — `--v-shadow-outer`, `--v-shadow-inner` (§5.1).
   - `breakpoints.css` — `v-breakpoint-*` / `v-container-*` mixins (§5.3).
5. **`base.css`** — element-level styles: body, headings, links, form defaults, `code`, `pre`, tables. Layer: `base`. Consumes `--v-*` tokens.

**Done when:** Importing `index.css` in a blank HTML page applies the reset, sets all `--v-*` custom properties on `:root`, and styles basic elements (headings, links, paragraphs). Verify with browser devtools that every primary and secondary knob from §5.1 resolves to a concrete value.

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

**Done when:** A plain HTML page with `index.css` can render: a padded `o-box` with nested `o-input-box` elements showing the radius step-down; an `o-stack` of items; an `o-grid` that reflows responsively; an `o-split` that collapses. The four-level nesting model from §9.1 works visually.

---

## Phase 3: CSS components, variants, and tools

**Goal:** Visual chrome, tonal variants, surface treatments, and the narrow tools layer.

**Dependency:** Phase 2 (components compose objects).

### 3a: Variants (`src/lib/css/variants/`)

Build variants before components — components reference tonal classes:

1. **`colors.css`** — all `v-colors-*` classes (§7). Each re-sets `--v-bg`, `--v-fg`, `--v-link`, `--v-accent`, `--v-muted` for its subtree. Include light-dark branches via `light-dark()` / `color-scheme`.
2. **`surface.css`** — `v-surface-card`, `v-surface-elevated`, `v-surface-sunken`, `v-surface-glass`, `v-surface-gradient` (§7).
3. **`radius.css`** — `v-radius-flat` (§8.2).
4. **`text.css`** — `v-text-display`, `v-text-meta` if needed. Sparingly.

### 3b: Components (`src/lib/css/components/`)

Pure CSS components from §10.1, in rough priority order:

1. **`button.css`** — `c-button`. Layers hover state and `--v-shadow-outer` on `o-input-box`. `c-button--icon` for square mode.
2. **`card.css`** — `c-card`. Surface chrome on `o-box` / `o-text-box`.
3. **`input.css`** — `c-input`. Inner shadow, focus ring, invalid state on `o-input-box`.
4. **`alert.css`** — `c-alert`. Text-mode, toned via `v-colors-*`.
5. **`checkbox.css`**, **`radio.css`** — `c-checkbox`, `c-radio`. Custom-styled native inputs.
6. **`toggle.css`** — `c-toggle`. Pure CSS via `:checked`.
7. **`select-native.css`** — `c-select-native`. Styled chrome around `<select>`.
8. **`tag.css`** — `c-tag`. Composes `o-caption`.
9. **`badge.css`** — `c-badge`. Composes `o-caption`.
10. **`avatar.css`** — `c-avatar`. Square-mode.
11. **`spinner.css`** — `c-spinner`. CSS animation.
12. **`skeleton.css`** — `c-skeleton`. CSS animation.
13. **`disclosure.css`** — `c-disclosure`. `<details><summary>`.
14. **`tooltip.css`** — `c-tooltip`. Anchor positioning, `[popover]`, no JS.

Browser-primitive component chrome (§10.2) — these need CSS only at this phase; JS wiring comes in Phase 5:

15. **`tabs.css`** — `c-tabs`. Tablist chrome.
16. **`modal.css`** — `c-modal`. Centered `<dialog>`, backdrop, focus halo.
17. **`drawer.css`** — `c-drawer`. Edge-anchored `<dialog>` with side variants.
18. **`popover.css`** — `c-popover`. Anchor-positioned `[popover]`.
19. **`menu-component.css`** — `c-menu`. Chrome on `o-menu`.
20. **`styled-select.css`** — `c-styled-select` chrome.

### 3c: Tools (`src/lib/css/tools/`)

The narrow set from §11: `t-px-0`, `t-py-0`, `t-p-0`, `t-px`, `t-py`, `t-p`, `t-flex`, `t-flex-fill`, `t-flex-auto`, `t-flex-none`, `t-flex-wrap`, `t-block`, `t-inline`, `t-inline-block`, `t-hidden`, `t-sr-only`, `t-border`, `t-border-none`, `t-border-inner`, `t-radius-none`, `t-radius-full`, `t-shadow`, `t-shadow-inner`, `t-shadow-outer`, `t-shadow-none`, `t-align-start`, `t-align-center`, `t-align-end`, `t-truncate`.

**Done when:** A plain HTML page can render every component from §10.1 with appropriate tonal variants and surface treatments, using only CSS classes and native HTML. No JS. Buttons, cards, alerts, inputs, toggles, modals (opened via `commandfor`), and tooltips (via `[popover]` + anchor positioning) all render correctly.

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
   - Form behaviors: `t-validate.ts`, `t-submit.ts`, `t-validate-group.ts`, `t-validate-error.ts`, `t-reset-on-close.ts`, `t-close-on-success.ts`
   - Component-internal: `c-modal__close.ts`, `c-modal-speed-bump.ts`, `c-tabs__select.ts`, etc.
8. **`components/`** — thin compositions (§12.3): `tabs.ts`, `modal.ts`, `drawer.ts`, `popover.ts`, `menu.ts`, `styled-select.ts`.
9. **`index.ts`** — public API (no handler side-effects). **`all.ts`** — Pattern A entry that imports every handler.

**Done when:** A plain HTML page with `css/index.css` + a `<script>` that imports `dom/all` + calls `mount()` renders interactive tabs, a modal with ESC-close, a form with validation + submit choreography, and a menu with keyboard nav — all without any framework.

---

## Phase 6: Solid layer (`src/lib/solid/`)

**Goal:** Thin Solid wrappers from §13.

**Dependency:** Phases 1–5 (CSS classes, DOM behaviors).

1. **Scaffold.** `janus.json` (`depends: ["css", "dom", "utils"]`), configs.
2. **`aria.ts`** — `ariaize()` + `attrs()` (§13.1).
3. **`use-labelled-input.ts`** — the hook (§13.2). Test ID generation, `aria-describedby` joining.
4. **`labelled-input.tsx`** — `LabelledInput`, `LabelledInline`, `LabelledInputGroup` (§13.2).
5. **Input components** — `input.tsx`, `button.tsx`, `card.tsx`, etc. Each is a thin prop→attribute mapper + `ca` merge. `<Input>` exposes `validators` and `onValidate` props (§13.4).
6. **Form wrappers** — `Form`, `FormGroup`, `FormError`, `SubmitButton` (§13.5). `FormContext` for cross-portal `form=` targeting.
7. **Modal form** — `ModalForm`, `ModalSpeedBump` (§13.6).
8. **`utils/`** — Solid-specific helpers (signals, resources, etc.) that v1 had in `src/lib/utility/solid/`. Keep internal to `solid/`.

**Done when:** A Solid app can render a `<LabelledInput>` with validation, a `<Form>` with submit handling, and a `<ModalForm>` with speed bump — all wired through the DOM layer's `data-js` dispatch. Hydration works without mismatch.

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

4. **Home** (§20.1) — landing page with explanatory text, visual samples, navigation cards.
5. **Components** (§20.2) — sidebar + `o-grid` of component demos. Sidebar uses `o-split` / `c-drawer` recipe from §10.4.
6. **Typography** (§20.3) — headings, prose, lists, tables, code, with a token reference table.
7. **Colors** (§20.4) — APCA contrast grid (SSR) + color playground (island). Playground has text inputs for `--v-bg`, `--v-link`, `--v-accent`, `--v-muted`; `--v-fg` shown read-only. Scoped preview area with live contrast ratios.
8. **SPA** (§20.5) — SSR shell + hydrated island hosting component demos. Validates the island pattern.

**Done when:** `npm run build` produces a multi-page static site. Every page works with JS disabled (SSR). The colors playground and SPA island hydrate correctly. The config modal's knob inputs visibly affect the page and persist across reloads. Reset clears everything.

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

Three layers, introduced as each phase produces testable surface:

**Unit tests (Vitest).** For `utils/` and `dom/` — pure logic that doesn't need a real browser.

| Phase | What to unit test |
|---|---|
| Phase 4 (utils) | Every ported utility — these are pure functions, unit tests are straightforward. Port v1 tests alongside the code. |
| Phase 5 (dom) | `compose-attrs` (`ca`, `only`, `concat`, `override` — conflict semantics, wrapper mismatches, the full merge matrix). Form engine validators and submit handlers (registry, WeakMap path, touched-state machine, disabled-state filtering). Dispatcher registration and lookup. |
| Phase 6 (solid) | `ariaize()`, `attrs()`, `useLabelledInput` ID generation and `aria-describedby` joining. |

Colocate unit tests with source (`*.test.ts`). Run via `npm run test:unit`.

**E2E tests (Playwright).** For anything involving real browser rendering, CSS computation, or multi-element interaction. This is the primary verification layer for components.

| Phase | What to E2E test | Browser scope |
|---|---|---|
| Phase 3 (CSS components) | Write a minimal HTML test harness that loads `css/index.css` and renders each component. Tests verify: correct computed styles (padding, radius, colors), variant class application, hover/focus states, responsive reflow (`o-grid`, `o-split`). | Cross-browser for core layout. `@chromium-only` for anchor-positioned tooltips. |
| Phase 5 (dom) | Interactive behaviors: tab key navigation in `t-roving-focus`, ESC/outside-click in `t-request-close`, form validation flow (submit → error display → fix → resubmit), typeahead in menus. Modal/popover open via `commandfor`, anchor-positioned tooltip placement. | `@chromium-only` — `commandfor` and anchor positioning are hard requirements, so the full interactive suite only runs in Chromium. Cross-browser tests cover keyboard nav and form flows (open modals programmatically in test setup to bypass `commandfor`). |
| Phase 6 (solid) | Solid component rendering: `<LabelledInput>` renders correct ARIA, `<Form>` wires validation, `<ModalForm>` speed bump flow. Hydration: SSR output matches client hydration (no mismatch warnings). | Cross-browser. |
| Phase 9 (demo site) | Page-level smoke tests: each page loads, nav works, config modal opens and persists knob changes, colors playground updates contrast ratios, SPA island hydrates. | Cross-browser for nav/modal. `@chromium-only` for anchor-positioned elements. |

Colocate E2E tests with source (`*.desktop.e2e.ts`, `*.mobile.e2e.ts`). Run via `npm run test:e2e`. Use the `@chromium-only` tag convention from §0.4 for Chromium-gated features.

**What NOT to E2E test.** Pure CSS rendering that's adequately verified by visual inspection in the demo site (typography spacing, color values). The demo site itself is the "test" for visual correctness — E2E tests verify *behavior*, not pixel-level appearance.

### Browser feature gaps and fallbacks

The feature matrix in §0.4 shows three Chromium-only features. Handle each:

| Feature | Fallback strategy | Where in the plan |
|---|---|---|
| **CSS anchor positioning** | Required for `c-tooltip` and `c-popover` positioning. Non-Chromium browsers get un-positioned popovers (they render but don't track their anchor). This is acceptable — the spec (§15) treats anchor positioning as a hard requirement; consumers whose browsers don't support it pick a different library. No polyfill. | Phase 3 (tooltip/popover CSS) |
| **`commandfor`/`command`** | Hard requirement, same as anchor positioning. No shim, no polyfill. Consumers whose browsers don't support it pick a different library. | — |
| **`scroll-state()` container queries** | Graceful degradation only — the auto-hiding nav recipe (§10.4) stays visible when unsupported. No shim. | Phase 9 (demo site nav). |
