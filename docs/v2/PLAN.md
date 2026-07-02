# Janus v2 — Implementation Plan

This document tells you **what to build and in what order**. For the design rationale and detailed rules, consult the [design spec](./README.md). Section references like "§5.1" point into the spec.

The plan uses a **gradual migration** strategy: v2 code is built in `src/lib2/` alongside the existing v1 code in `src/lib/`. The v1 demo site stays fully functional throughout, serving as both the visual reference and the migration target. Once all pages are migrated, Phase 10 removes v1 and renames `lib2/` → `lib/`.

**Documentation site first.** The shipped site *is* the documentation (§19, [09-demo-site.md](./09-demo-site.md)), and standing it up is the *first* thing we build — not the last. Phase 0 ports the SSG plugin and stands up the SSR site shell with its three-item top nav: **Composition**, **Colors**, **Components** (that order — it is also the build order).

- **Composition** (§20.2) is built first and gets the most iteration. It is one section with a sidebar/ToC documenting the `--v-*` variables, the `o-*` objects, the `t-*` tools, and typography. Phases 1–3 fill it in: tokens → Variables sub-page, objects → Objects sub-page, tools → Tools sub-page, base → Typography sub-page. These pages ship **zero client JS** — they're Solid JSX statically rendered to HTML + `index.css`.
- **Colors** (§20.3) is built second — the APCA contrast grid (the contrast checker that exists today) plus the color playground.
- **Components** (§20.4) is built last, once objects/variants/component CSS exist.

These pages render through the real site machinery from day one, so there is **a human-reviewable artifact for the CSS from the very first phase** — which is exactly where we expect to spend the most iteration. There is no throwaway `test-harness.html`; the doc pages *are* the review surface and the E2E target.

**Get the CSS up fast; author the site in Solid from the start.** The site is written as **Solid JSX rendered to static HTML at build time (SSG)** — there is no interim raw-HTML page format, and nothing in this plan should be read as "write HTML some other way first." That does *not* mean the component layer must exist before the CSS: when a doc page needs a card, write the ~5-line **render-only** wrapper (`Card` → `class="c-card o-box"` + prop pass-through) in `src/lib2/solid/` and move on — do **not** give it behavior, `data-js`, or a finished prop API now (that's Phases 5–6). Site-only chrome that isn't library material (the ToC, demo-card frames) is `p-` classes in the site's own CSS (§4). The interactive parts of the site (behavioral component demos, the colors playground island, the theme workbench §21) are layered on in Phase 9. The library itself remains framework-agnostic (a consumer can use `css/` alone); the *site* commits to Solid.

The plan is phased. Each phase has a "done when" check. Phases are sequential unless noted otherwise. Within a phase, the order of items is a suggested priority — not a hard requirement.

---

## Phase 0: Repo setup & documentation-site shell

**Goal:** A `v2` branch with `src/lib2/` scaffolded alongside the existing `src/lib/`, the v1 demo site still deployable, dual path aliases configured, **and a working SSR documentation-site shell that the CSS phases render their reference pages into.**

### 0.1 Create the branch

```
git checkout -b v2
```

All v2 work happens here. `main` stays untouched as a baseline. v1 source stays in the working tree during migration — read v1 files directly (e.g. `src/lib/utility/throttle.ts`), no `git show` needed.

### 0.2 Scaffold `src/lib2/`

Create the v2 pseudo-package directory structure alongside v1:

```
src/lib2/
  css/
  utils/
  dom/
  solid/
```

No v1 files are deleted. The existing `src/lib/` (styles, components, utility, dom) remains untouched and the v1 demo site stays fully functional throughout the migration.

### 0.3 Adjust root configs

In the same commit or a follow-up:

- **`vite.config.ts`** — add `resolve.alias` entries for `~/lib2/css/*`, `~/lib2/utils/*`, `~/lib2/dom/*`, `~/lib2/solid/*` alongside the existing `~/lib/*` aliases. Both coexist during migration. Add the v2 documentation-site entry points to `rollupOptions.input` as they come online (the shell in step 0.5, the Variables/Objects/Tools pages in Phases 1–3). There is no `test-harness.html` — the doc pages serve that role.
- **`tsconfig.json`** — add path aliases: `~/lib2/css/*`, `~/lib2/utils/*`, `~/lib2/dom/*`, `~/lib2/solid/*`. Keep existing `~/lib/*` aliases.
- **`package.json`** — no dependency changes yet. v1 deps stay until the components that use them are migrated. Bump `@playwright/test` (see §0.4). Scripts will be updated incrementally as pseudo-packages are built.

### 0.4 Browser targets and Playwright

v2's CSS features (§15) have uneven browser support. This affects the build target, Playwright config, and how E2E tests are structured.

**Feature support matrix (as of mid-2025):**

| Feature | Chromium | Firefox | WebKit/Safari |
|---|---|---|---|
| CSS anchor positioning | 125+ | No | No |
| `commandfor` / `command` | 135+ | **144+** | **26.2+** |
| `scroll-state()` container queries | 133+ | No | No |
| `oklch(from …)` relative color | 119+ | 128+ | 18+ |
| `light-dark()` | 123+ | 120+ | 17.5+ |
| Popover API | 114+ | 125+ | 17+ |
| `<dialog>` | all | all | all |
| `:has()`, container queries, `@layer` | all | all | all |

**Minimum supported browsers: Chrome 135+, Firefox 144+, Safari 26.2+** (§15). At these versions `commandfor` is **cross-browser**, so the zero-JS modal path works in all three engines and `commandfor` tests are *not* tagged `@chromium-only`. The genuinely Chromium-leading features at these minimums are **anchor positioning** and **`scroll-state()`** — those stay `@chromium-only`.

**Playwright version.** Bump `@playwright/test` to a version shipping Chromium 135+ (for anchor positioning / `scroll-state`; `commandfor` is cross-browser at the §15 minimums). v1 pins `^1.51.1` which ships Chromium 134 — too old. Check the [Playwright releases](https://github.com/microsoft/playwright/releases) for the first version bundling Chromium ≥135 and pin there. After bumping, run `npx playwright install` to pull the new browser binaries.

**Vite build target.** Bump toward the §15 minimums — `['safari26', 'ios26', 'chrome135', 'firefox144']`. The target controls JS/CSS *syntax* transforms, not feature availability, so the exact values are not load-bearing for behavior; CSS features like anchor positioning that older browsers don't support degrade gracefully (the browser ignores the unknown properties). No change needed unless the target list drifts.

**Playwright project structure.** Restructure the Playwright config to separate tests into tiers by browser support:

```ts
// playwright.config.ts — project structure sketch
projects: [
  // Tier 1: Chromium-only features (anchor positioning, scroll-state)
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

### 0.5 Documentation-site shell

The site is the review surface for everything that follows, so it comes first. Stand up a minimal SSR shell that CSS doc pages can be dropped into. This pulls forward two things that v1 already has — port, don't rewrite.

1. **Port `vite-plugin-ssg.ts`** from v1 into `plugins/` (this is the one plugin that moves out of Phase 7, because the doc site needs SSR from the start). Wire it into `vite.config.ts`. The remaining plugins (`purgecss`, `janus-bundle`) stay in Phase 7.
2. **Create the v2 site root.** A small set of files under `src/lib2-site/` (kept separate from the library pseudo-packages — it's an *application* that consumes them, and it must not pollute the `css`/`utils`/`dom`/`solid` boundary checks):
   - A **page-authoring pattern**: each page is a **Solid JSX module rendered to static HTML** by the SSG plugin — no hydration, no `data-js`, zero client JS in the output (§19). Pages compose the library's Solid wrappers (see next point) plus plain elements carrying v2 classes. Establish the convention here with the Home page as the first example. This also means scaffolding `src/lib2/solid/` now with its configs (the directory already exists from step 0.2) — it grows render-only wrappers from Phase 1 onward.
   - **Render-only Solid wrappers, on demand.** When shell or doc-page markup wants a library component, add a thin wrapper to `src/lib2/solid/` that just applies the documented class list (`Card` → `c-card o-box`) and spreads props. No behavior, no signals, no `data-js` — those arrive in Phases 5–6. This exercises the "the JSX component applies the right classes" contract (§4.1) from the first page.
   - **`p-` classes for site-only chrome.** Anything that is doc-site design rather than library material (the ToC arrangement, demo-card framing) is a `p-` class in the site's own unlayered CSS (§4). If the shell keeps wanting a style that feels like library material, that's a signal to prioritize that CSS class (see step ordering in Phases 1–3), not to hand-roll a `p-` one-off.
   - A **top nav shell** (SSR, no JS) with exactly three links — **Composition**, **Colors**, **Components** — plus an (inert until Phase 9) **theme-workbench trigger** (§21). The site title links to Home. Three is the ceiling; don't add per-page nav items — each section owns its internal sidebar/ToC. The Composition and Components links can point at stub pages until Phases 1–3 fill them.
   - A **shared page layout** (head, nav, `o-container` main, footer) and a **Composition sidebar/ToC** scaffold so every doc page is consistent.
3. **Home page (placeholder).** Enough to prove the shell renders and deploys: headline, one paragraph, nav cards (which fill in as pages land). Full Home content is finished in Phase 9 (§20.1).
4. **Entry points.** Add the shell + Home HTML entry point to `vite.config.ts` `rollupOptions.input`. Phases 1–3 add one entry per doc page.

`index.css` does not exist yet (Phase 1 builds it) — the shell can import an empty placeholder `src/lib2/css/index.css` so the build resolves, and the pages will light up the moment Phase 1 populates it.

### 0.6 Verify

```
git status          # only new directories + config edits, no deletions
npm install         # no broken deps
npx playwright install  # pull new browser binaries
npx tsc --noEmit    # clean — v1 still compiles
npm run build       # v1 site AND the v2 doc-site shell both build
```

**Done when:** The `v2` branch has `src/lib2/` scaffolded with empty pseudo-package directories, root configs have dual aliases (`~/lib/*` and `~/lib2/*`), `npm install` succeeds, `npx playwright install` completes with Chromium ≥135, the v1 demo site still builds and runs, **and the v2 documentation-site shell builds and serves an (as-yet unstyled) Home page through `vite-plugin-ssg` with a working top nav.** The shell is the empty frame that Phases 1–3 hang CSS reference pages on.

---

## Phase 1: CSS foundation (`src/lib2/css/`)

**Goal:** A working `index.css` that declares layers, resets defaults, and establishes all root knobs.

Build in this order — each step depends on the previous:

1. **Scaffold.** Create `src/lib2/css/` with `janus.json` (`depends: []`), `README.md`, `CHANGELOG.md`.
2. **`index.css`** — the single entry point. Declare the `@layer` order (§4): `reset, base, objects, components, variants, tools` (components sit **above** objects so a component can do minor overrides of the objects it composes — §4.1). Import everything else from here.
3. **`reset.css`** — box-sizing, margin resets, etc. Layer: `reset`. Must include `* { border-color: transparent }` — v1 reserves border space on every interactive element so the box doesn't shift on focus or invalid state. Without the transparent default, borders appear as visible lines before they're needed. *(Aesthetic spec §reset)*
4. **`tokens/`** — root knobs and (internal) mixins. Mixins defined here are Janus-internal authoring tools, **not** a consumer API (§5.3): consumers theme via `--v-*` overrides, `v-`/`t-` classes, or their own CSS.
   - `spacing.css` — `--v-spacing` (default `1rem`) and the **six derived rhythm tokens with the workbench multiples baked in** (§5.1, §6.2): `--v-pad-block` / `--v-pad-inline` (×1.25), `--v-gap-block` (×1), `--v-gap-inline` (×0.5, cluster), `--v-gap-section` (×1.5), `--v-gap-tight` (×0.25); plus `--v-control-inset` (§6.1) and `--v-input-height` (default **`2rem`** — the workbench default). The internal `v-spacing` mixin (§5.3, §6) bundles all six **plus `--v-border-width`** — denser layouts want thinner borders, not just smaller padding. *(Aesthetic spec §13)* The mixin does **not** touch radius anchors (§6.3). Also add the hi-DPI density bump — it moves both *font anchors* together (§5.4), keeping them collapsed under the default fixed config (so text stays fixed, just larger): `@media (resolution >= 200dpi) { :root { --v-input-height: 2.75rem; --v-font-size-min: 1rem; --v-font-size-max: 1rem; --v-spacing: 1rem; } }` — phone screens need larger touch targets and body text. *(Aesthetic spec §14)*
   - `radius.css` — the **max** `--v-radius` (the assumed window/frame corner — the anchor; default **`2.5rem`**) and the **min** `--v-radius-min` (the floor; default **`0.375rem`**) — the workbench's stepped/concentric defaults — plus `--v-border-width` (§5.1, §8). Also the **always-on radius cascade** (no preset classes): the `:root`-level rules that assign the per-layer `--o-*__radius` by stepping **inward** from the max toward the min, floored (§8.2), including the **one-level nested-box step** (each box writes `--o-box__radius-inner`; a box in a box reads it — §5.2, §8.2; the box-scoped rules live with the objects in Phase 2). The look is tuned by the two root values alone (flat = `min == max`). The frame radius drives the cascade whether or not it's painted.
   - `color.css` — `--v-bg`, `--v-fg` (with the OKLCH derivation), `--v-link`, `--v-accent`, `--v-muted`, weight-min knobs (§5.1, §7). **Additional tokens to add:**
     - `--v-border-dynamic-base: light-dark(black, white)`, `--v-border-dynamic-mix: light-dark(17.5%, 50%)`, `--v-border-color: color-mix(in hsl, var(--v-border-dynamic-base) var(--v-border-dynamic-mix), var(--v-bg))` — one recipe places every border at a fixed perceptual distance from any surface. *(Aesthetic spec §01)*
     - `--v-body-bg` — a gradient stack: two low-opacity radial gradients (warm peach + cool teal) over `var(--v-bg)`, with `background-attachment: fixed`. This prevents flat-looking pages. *(Aesthetic spec §02)*
     - `--v-ring: var(--v-accent)` (crisp outline) + `--v-ring-alt: color-mix(in hsl, var(--v-accent) 35%, transparent)` (soft halo) — split from a single `--v-accent` ring. `--v-shadow-focus: 0 0 0 0.125rem var(--v-ring-alt)` — the inner layer of the focus ring. *(Aesthetic spec §07)*
     - **Set weight-min defaults to 500**, not `inherit`: `--v-link-weight-min: 500`, `--v-accent-weight-min: 500`, `--v-muted-weight-min: 500`. The shipping palette needs actual values; `inherit` means no contrast compensation. *(Aesthetic spec §10)*
     - **Surface + control tokens** (§5.1, §7.0 — workbench values): `--v-card-bg: light-dark(hsl(0deg 0% 100%), hsl(216deg 16% 12%))` (raised surface), `--v-input-bg: light-dark(hsl(0deg 0% 100%), hsl(216deg 16% 10%))` (recessed control well), `--v-backdrop: light-dark(hsl(216deg 16% 8% / 50%), hsl(216deg 16% 2% / 60%))` (modal backdrop tint), and `--v-border-color-strong: color-mix(in hsl, var(--v-fg) 28%, var(--v-bg))` — controls need a visibly stronger border than cards or their edges (and the spacing measured to them) stop being legible. *(workbench)*
   - `typography.css` — the Utopia-style type scale (§5.4), **fluid-capable but shipped fixed**: the default collapses the size anchors so body text is a fixed 15px (app-appropriate; fluid type is an opt-in for marketing/content, §6.7). Declare the primary knobs `--v-font-family`, `--v-font-family-mono`, the size anchors `--v-font-size-min` (default `0.9375rem`) / `--v-font-size-max` (default `0.9375rem` — **equal by default, i.e. collapsed → fixed 15px; spacing stays on the 16px grid**), the per-anchor ratios `--v-font-ratio-min` (default `1.2`) / `--v-font-ratio-max` (default `1.2` — equal too, so the ramp is a single fixed ratio by default; a consumer opting into fluid type spreads both pairs), the shared viewport anchors `--v-viewport-min` (default `20rem`) / `--v-viewport-max` (default `80rem`), and `--v-line-height`. Define the internal `v-fluid $min, $max` clamp primitive and the `v-font-step $n` wrapper (§5.3–5.4), then use them to emit the resolved secondary tokens: `--v-font-size` (step 0) plus every semantic `--v-font-size-*` (h1=+3, h2=+2, h3=+1, h4–h6=0, caption=−1, code=−1) as floored `clamp()`s, and the `--v-line-height-*` tokens (still `calc(1em + 0.5 * var(--v-spacing))` — *additive* leading, which keeps inter-line space constant across sizes, §5.1; the `<hgroup>` object reuses this form). Also emit the **prose rhythm** tokens the `o-prose` flow consumes — multiples of the *line*, not of `--v-spacing` (§6.2), workbench defaults: `--o-prose__gap: calc(1 * var(--v-line-height) * 1em)`, `--o-prose__heading-gap: calc(1 * var(--v-line-height) * 1em)` (space above a heading), `--o-hgroup__leading: calc(0.5 * var(--v-spacing))` — and the cascading `--v-list-rhythm` (default grouped = `calc(0.5 * var(--o-prose__gap))`; continuous = `calc(var(--v-line-height) * 1em - 1cap)`). Carry the `--_font-size-floor` private intermediate (now `min(13px, calc(var(--v-font-size-min) - 1px))`) to floor each clamp's min side. CSS has no `pow()`, so precompute the per-step ratio powers as constants (or generate them at build time from the four primary knobs, mirroring `utopia-core`); step indices appear *only* inside this file, never in the public surface. **Add the font-weight stack:** `--v-font-weight-normal: 400`, `--v-font-weight-label: 500`, `--v-font-weight-subtitle: 600`, `--v-font-weight-strong: 600`, `--v-font-weight-title: 700`. These are semantic weight tokens that components and base styles consume. Tinted-surface variants bump the entire stack by ~100 (§ aesthetic spec §05).
   - `shadow.css` — `--v-shadow-outer`, `--v-shadow-inner` (§5.1). **Also add:** `--v-shadow-inner-top: inset 0 6px 6px -4px rgb(0 0 0 / 15%)`, `--v-shadow-inner-bottom: inset 0 -6px 6px -4px rgb(0 0 0 / 15%)` — scroll-edge shadows for modal/drawer scrollable content. *(Aesthetic spec §16)*
   - `breakpoints.css` — internal `v-breakpoint-*` / `v-container-*` mixins (§5.3).
5. **`base.css`** — element-level styles. Layer: `base`. Consumes `--v-*` tokens. Beyond the basics (body, headings, links, form defaults, `code`, `pre`, minimal table defaults — the data-table treatment with control-height rows is `c-table`, Phase 3), base.css carries several important v1 conventions:
   - **Text-box trim** follows *edges*, not element types (§6). `base.css` owns the **padded-text-box** cases: `text-box: trim-both cap alphabetic` on `<pre>`, `blockquote` callouts, and table cells, so their perimeter padding reads uniform. The **container-scoped** cases — `o-prose` and `o-stack` trimming their immediate text children via a selector list, and `<hgroup>` outer-edge-only trim — live with those objects (Phase 2). Never trim inline text, and never rely on trim for control centering: trim has **no effect on flex/grid containers** (v1's flex buttons would silently ignore it), which is exactly why controls center via `o-input-box` height math and why the trim selector is a named-element list, not `> *` (§6). Firefox lacks trim (§15); accepted degradation is slightly loose first/last-line leading. *(see §6, workbench)*
   - **Body**: `background: var(--v-body-bg); background-attachment: fixed;` *(Aesthetic spec §02)*
   - **Links** (`a:where([href])`): `color: var(--v-link); font-weight: var(--v-link-weight-min, inherit); text-underline-offset: 0.25rem`. **Focus**: `a:focus-visible { outline: none; text-decoration-style: double; }` — inline links use a double underline on focus, not a box outline that disrupts the reading line. *(Aesthetic spec §08)*
   - **Heading demotion in `<header>`**: `header h1, h2 { font-size: var(--v-font-size-h2); }`, `header h2, h3 { font-size: var(--v-font-size-h3); }`, etc. This lets card titles use semantically correct heading levels (h2 for the card section) while rendering at an appropriate visual size (h3-scale inside the card header). *(Aesthetic spec §12)*
   - **Text truncation is opt-in, NOT a base-layer default (§11.1).** Do **not** port v1's global `a, b, em, h1–h6, p, span, strong { overflow-x: hidden; text-overflow: ellipsis }` rule — §11.1 rejects it on purpose: it inverts the common case (most text should wrap), and `overflow-x: hidden` forces `overflow-y` to compute to `auto`, spawning the stray scroll container that was the original v1 bug. `base.css` leaves text wrapping normally. Truncation is the single opt-in `t-truncate` tool (`overflow-x: clip` + `min-width: 0` + `white-space: nowrap`, §11.1), applied per-element by the component/consumer that wants it. There is no `t-wrap` (nothing to opt out of). *(supersedes Aesthetic spec §20, which documents the v1 opt-out behavior — see §11.1 for why v2 flips it)*
   - **Icon stroke scaling**: `.lucide, .icon { stroke-width: clamp(2, var(--v-font-weight) / 200, 3); }` — icon stroke thickens with surrounding text weight (weight 400 → 2, 500 → 2.5, 600 → 3). **This reads the tracked `--v-font-weight` custom property, not the CSS `font-weight` property** — CSS can't read inherited `font-weight` back into a variable. So every rule that sets `font-weight` from the weight stack (§5.1) must set `--v-font-weight` to the same number in tandem: base element styles, the weight-token utilities, and the tinted-surface weight bump (`v-colors-callout` etc.) all do this. `--v-font-weight` defaults to `400` at `:root`. Document the "set them together" contract wherever the weight stack is defined so the icon ramp (and the weight-floor fallback) have a value to read. *(Aesthetic spec §11)*
   - **Code surfaces**: `code` gets tinted-paper bg (`v-colors-code`); `pre` gets always-dark surface (`v-colors-pre`), even in light mode. *(Aesthetic spec §04)*
   - **List indent**: `ul, ol { padding-inline-start: 1em }` — the one base list rule, carried verbatim from the Slip Switch consumer fork. The `em` unit is the point: it **compounds per nesting level** so deep lists indent proportionally to their own (possibly smaller) text. This is the *base* behavior for any list; the richer marker-cycling lives in `o-prose` (Phase 2, folded from Slip Switch's editor CSS). Markers are otherwise left to the UA default. *(workbench: `docs/v2/spacing-workbench.html`)*

### 1.S Documentation page (the review artifact)

Instead of a throwaway test harness, build the first **Composition** sub-pages (§20.2) into the Phase 0 site shell. These are Solid-authored, statically rendered pages whose output is plain HTML + `index.css` (zero client JS — §19), and they are the **primary human-review surface for the token layer** — this is where the CSS iteration happens.

1. **Variables sub-page** (§20.2.1) — one section per token group (spacing, radius/border, color, typography, shadow, motion). Each section pairs a reference table (knob name, default, resolved value, description, derivation) with a live render (spacing ruler, radius row, color swatches, shadow tiles, type ramp). This page documents every primary and secondary knob from §5.1 and is how a reviewer confirms the palette reads "warm and intentional" rather than browser-default. **Zero client JS in this phase** — the static reference + render is the artifact; the theme-workbench affordances (§20.2.1, §21) arrive later (Phase 9) and are never a prerequisite for the page to render or document its knobs.
2. **Typography sub-page** (§20.2.4) — exercises every base-layer element: headings h1–h6, paragraphs, links (including `:focus` double-underline), `<code>`, `<pre>`, a `<table>`, form defaults. This is the visual proof that `base.css` and the reset apply correctly. (The fluid-type **width-draggable preview frame** of §20.2.4 is likewise a Phase 9 enhancement layered on the static type ramp.)

Register both under the Composition sidebar/ToC. They serve as the E2E target for all CSS-layer tests through Phase 3 (no separate harness).

### 1.T Tests

E2E tests target the Variables and Base/Typography doc pages from 1.S.

Write `src/lib2/css/tokens.desktop.e2e.ts`:

- Verify every primary knob (`--v-spacing`, `--v-radius`, `--v-radius-min`, `--v-border-width`, `--v-input-height`, `--v-font-family`, `--v-font-family-mono`, `--v-font-size-min`, `--v-font-size-max`, `--v-font-ratio-min`, `--v-font-ratio-max`, `--v-viewport-min`, `--v-viewport-max`, `--v-line-height`, `--v-bg`, `--v-link`, `--v-accent`, `--v-muted`, `--v-shadow-outer`, `--v-shadow-inner`) resolves to a non-empty concrete value via `getComputedStyle`.
- Verify secondary knobs (`--v-font-size` (the resolved fluid base), `--v-pad-block`, `--v-pad-inline`, `--v-gap-block`, `--v-gap-inline`, `--v-gap-section`, `--v-gap-tight`, `--v-control-inset`, `--v-fg`, `--v-card-bg`, `--v-input-bg`, `--v-backdrop`, `--v-border-color`, `--v-border-color-strong`, `--v-list-rhythm`, `--v-font-size-h1` through `-h6`, `-caption`, `-code`) all resolve to concrete `clamp()`/length/color values.
- Verify the derived multiples hold at default: `--v-pad-block` = 1.25 × `--v-spacing`, `--v-gap-section` = 1.5 ×, `--v-gap-tight` = 0.25 ×, `--v-gap-inline` = 0.5 ×.
- **Verify type is fixed by default** (§5.4): with the shipped collapsed anchors, the computed `font-size` of `body` and `h1` is **identical at a narrow viewport (≈`--v-viewport-min`) and a wide one (≈`--v-viewport-max`)** — body resolves to ~15px (`0.9375rem`) at both. Then **verify the fluid path is wired correctly** by overriding the anchors apart (e.g. `--v-font-size-min: 1rem; --v-font-size-max: 1.25rem` with `--v-font-ratio-max > --v-font-ratio-min`): now `body`/`h1` sit near the `*-min` anchor when narrow and near the (strictly larger) `*-max` anchor when wide, and the heading→body *ratio* is larger at the wide viewport (dual-ratio behavior). Confirm no token's narrow-viewport size falls below the readability floor in either mode.
- Verify light/dark mode switching: set `data-v-color-scheme="dark"` on `<html>`, confirm `--v-bg` and `--v-fg` change.
- Verify base element styling: headings have decreasing font sizes, links have `--v-link` color, body has `--v-bg` background.

### 1.D Design notes

The default color palette should carry v1's warmth, not generic black-on-white. Reference `src/lib/styles/variables/color-schemes.css` for exact values:

- **Light mode `--v-bg`**: warm off-white (v1 used `hsl(30deg 12% 98.5%)`), not pure `#fff`
- **Dark mode `--v-bg`**: deep blue-gray (v1 used `hsl(216deg 16% 8%)`), not pure `#000`
- **Body background**: subtle radial gradient overlays (warm peachy at ~15% opacity + cool cyan at ~7% opacity) over the solid `--v-bg`. This creates visual depth without distraction.
- **`--v-link`**: a saturated cyan/teal (v1 used `hsl(195deg 100% 20%)`)
- **Dynamic border color**: derived via `color-mix()` from `--v-bg` — `color-mix(in hsl, black 17.5%, var(--v-bg))` in light mode, `color-mix(in hsl, white 50%, var(--v-bg))` in dark mode. Not a flat gray.
- **Shadows**: two semantic root knobs, not a t-shirt scale. `--v-shadow-outer` default should be a multi-layer shadow (`0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%)`) for realistic depth. `--v-shadow-inner` default: `inset 0 1px 2px 0 rgb(0 0 0 / 10%)` for embossed inputs. Components needing stronger shadows (modals, elevated surfaces) write larger values directly or scope a redefinition. Reference `src/lib/styles/variables/composition.css`.

**Done when:** The **Variables page** renders in the doc site, applying the reset, setting all `--v-*` custom properties on `:root`, and styling basic elements (headings, links, paragraphs). Every primary and secondary knob from §5.1 resolves to a concrete value (verify in the page's reference tables / via devtools). The Base/Typography render looks warm and intentional — not a browser default with custom properties bolted on. **This is the first reviewable CSS artifact; expect to iterate here before moving on.**

---

## Phase 2: CSS objects (`src/lib2/css/objects/`)

**Goal:** All structural / layout primitives from §9.

**Dependency:** Phase 1 (tokens must exist for `var(--v-*)` references to resolve).

Build the box family first — components layer on these:

1. **`box.css`** — `o-box` with `--o-box__pad-block`, `--o-box__pad-inline`; reads its own `--o-box__radius` with a `var(--v-radius-min)` fallback. Carries the box-scoped cascade rules (§8.2): each box writes the stepped `--o-input-box__radius` for its controls **and** `--o-box__radius-inner` for a box nested inside it; a `.o-box .o-box` reads the inner knob and steps its own controls once more (one supported nested level — deeper nesting bottoms out at the floor, §5.2).
2. **`prose.css`** — `o-prose` (§9.5; built right after `o-box` because **there is no `o-text-box`** — prose in a box is the composition `o-box` + `o-prose`, §6): block-flow running-text container with **boundary-owned** vertical rhythm (margin on the lower element; body↔body & heading→content = `--o-prose__gap`, default 1 line; content→heading = `--o-prose__heading-gap`, default 1 line in the heading's em) and which opts its immediate text children into `text-box-trim` via the §6 selector list. Plus the **`<hgroup>`** base styling — additive leading (`--o-hgroup__leading`, default `calc(0.5 * var(--v-spacing))`) and outer-edge-only trim (`trim-start`/`trim-end`) so title+subtitle read continuous (§6.2). The prose gaps are line-based, not `--v-spacing`-based. List rhythm rides the cascading `--v-list-rhythm` (`li + li { margin-block-start: var(--v-list-rhythm) }`; grouped default, continuous opt-in — §5.1).
   - **Nested-list marker cycling** (folded from Slip Switch's editor CSS, `…/popup/tiptap-editor.css`). The base rule (Phase 1) only indents; `o-prose` adds depth-cycled markers for both list types, each repeating every 3 levels:
     - **`ul`** — native `list-style-type` cycles disc → circle → square → (repeat); `padding-inline-start: calc(1em + var(--v-gap-inline))`.
     - **`ol`** — `list-style: none` + a **custom counter marker** (`li::before { content: counter(item, <style>) "." }`) so markers are **tabular-figure, right-aligned, and hang flush** with the list edge. The counter *style* cycles decimal → lower-alpha → lower-roman → (repeat). The marker box width = the list's left padding (`--_ol-pad`, default `max(1em, 1ch) + gap`) and a matching **negative `margin-inline-start`** pulls it into that padding (negative margin moves flow, so the `li` text stays flush at the content edge — do **not** use `transform`, which leaves the marker's inline width in flow and gaps the text; the editor gets away with `transform` only because ProseMirror wraps each `li`'s content in a block `<p>`). Widen `--_ol-pad` with digit count via `:has(> li:nth-child(10|100|1000))` (port the per-style alpha/roman breakpoints from the source too). *(workbench: `docs/v2/spacing-workbench.html`)*
3. **`input-box.css`** — `o-input-box` with `--v-input-height`, text-mode padding (inline padding = `--v-control-inset`, §6.1). Reads its own `--o-input-box__radius` with fallback to `--v-radius-min` (§8). Shared base for buttons, inputs, textareas, native selects.
4. **`square.css`** — `o-square`, `aspect-ratio: 1`, reads `--v-radius` directly.
5. **`dialog.css`** — `o-dialog` with `--o-dialog__radius` (fallback `--v-radius`), `--o-dialog__offset` (§8, §9.4). Does not redefine descendant radii — presets do. **The dialog frame is itself the scroll container and is `background: transparent`** — the color + rounded corners come from the *surfaces* inside it (header rounds the top, body rounds the bottom and fills), not from a solid background on the frame. This is load-bearing for overscroll (see `modal.css`, Phase 3): a solid background on the scroll element paints past the radius during the rubber-band; a transparent one can't.

Then layout objects (no internal dependencies between these):

6. **`stack.css`** — `o-stack` with `--o-stack__gap` (default `var(--v-gap-block)`). Also trims its immediate text children via the §6 selector list (a heading directly in a card stack aligns optically; flex children like buttons are deliberately not on the list). Document the gap roles (§6.2): section stack → `var(--v-gap-section)`, in-card → `var(--v-pad-block)` (set by `c-card`), form field → `var(--v-gap-tight)`.
7. **`group.css`** — `o-group` with `--o-group__gap`.
8. **`row.css`** — `o-row` with `--o-row__gap`.
9. **`grid.css`** — `o-grid` with `--o-grid__min`, `--o-grid__gap-block`, `--o-grid__gap-inline` (both gaps default `var(--v-gap-section)` — grid cells are section-level peers, §6.2). Plus `o-grid--fit` modifier (§9.3.1).
10. **`container.css`** — `o-container` with `--o-container__max` and `--o-container__gutter` (exposed so children can break out full-bleed — §6.1, §9.3). Owns the **top-level section flow** (§6.2): direct children separated by `var(--v-gap-section)` via margin on the lower element, with the workbench's heading-led exception — a prose section whose first child is a heading takes the heading's `--o-prose__heading-gap` as its lead-in instead of the flat section gap (margin-collapse through the unpadded prose section makes this work). Also a **query container** (`container-type: inline-size`, shared `frame` container-name with `o-dialog`) so one `@container frame` rule full-bleeds its boxes when it's narrow — the same rule that full-bleeds a dialog's boxes (see `modal.css`); full-bleed fires only on frames carrying the `v-bleed` variant (§6.1; the rule itself lives in `variants/bleed.css`, Phase 3a).
11. **`split.css`** — `o-split`. `:has()` + container query, no media queries.
12. **`centric.css`** — `o-centric`.
13. **`bar.css`** — `o-bar` (header/toolbar strip, §9.7). One **symmetric** padding knob `--o-bar__pad` with three mode values (asymmetric bar padding reads wrong on filled buttons — workbench): text (default) = `var(--v-spacing)`; contains-input (`o-bar--contains`) = `calc(var(--v-spacing) - max(0px, (var(--v-input-height) - 1lh) / 2))` — the control's *text* sits `--v-spacing` from the edge, fixing the too-tall-header bug; input (`o-bar--input`) = `0`. Plus `min-height: var(--v-input-height)`, sticky + translucent card-tone bg + `backdrop-filter: blur()` + bottom border for the page-header role, and the one-row overflow contract: leading cluster `flex: 1 1 auto; min-width: 0` (truncates), trailing cluster `flex: none`, clusters never wrap. Frame corners are occupied by a circular icon button, not padded around (§8.5, §9.7).
14. **`segmented.css`** — `o-segmented` (shared-border cells / settings groups) with `--o-segmented__divider` (§9.8). Group pad 0; cells carry padding; dividers replace gaps; only first/last cells round outer corners.

Then typography and menu objects (`o-prose` itself moved up to step 2 — it's part of the core box story now):

15. **`caption.css`** — `o-caption` with `--o-caption__font-size` (§9.5).
16. **`code.css`** — `o-code` with `--o-code__font-size` (§9.5).
17. **`menu.css`** — `o-menu` with padding knobs (§9.6).
18. **`menu-item.css`** — `o-menu-item` with height and font-size knobs (§9.6).

### 2.S Documentation page

Build the **Objects sub-page** (§20.2.2, under Composition) into the site — one demo card per object (including `o-bar`, `o-prose`, and `o-segmented`), each showing a live render (neutral placeholder content so structure is the focus), the object's `--o-<name>__*` knobs with defaults, and a copyable markup snippet. Must render: the four-level nesting (`o-dialog` > `o-box` > `o-input-box`) **plus a box-in-box** (the `--o-box__radius-inner` step) at a couple of `--v-radius` / `--v-radius-min` settings (§8) so the stepped (large range) vs. flat (`min == max`) corners are visible and the computed radius is annotated at each tier; `o-bar` in its three height modes with the same control in each; `o-prose` rhythm (bare heading vs. `<hgroup>`, grouped vs. continuous list rhythm with wrapped bullets, nested-list marker cycling); the inline text-inset modes side by side (§6.1) — a form field's label/description and a prose block at `v-align-edge` (flush), the straight-edge default, and `v-align-text` (inner-text line), with a code block breaking out of the prose; `o-grid` / `o-split` reflow at multiple widths plus the `v-bleed` full-bleed opt-in on a narrow frame; and an `o-segmented` settings group. Add it to the Composition sidebar/ToC. This is the review artifact for the object layer and the E2E target. (Now that `o-box` / `o-grid` etc. exist, firm up the site shell's render-only wrappers with them.)

### 2.T Tests

E2E tests target the Objects page from 2.S.

Write `src/lib2/css/objects.desktop.e2e.ts`:

- **Radius cascade** (§8): render `o-dialog` > `o-box` > `o-input-box` and verify radius steps **inward** — frame = `--v-radius` (max), then each level = `max(--v-radius-min, parent − pad/inset)`, so dialog > box > control and a control nested in a box rounds *less* than one sitting directly in the dialog (depth, not type). Verify a **box nested in a box** rounds one pad-step less than its parent (`--o-box__radius-inner`) and a control inside it steps once more; a third-level box shares the second level's radius. Confirm no layer falls below `--v-radius-min` (never sharp), and that `dialog radius = window − --o-dialog__offset`. Set `--v-radius-min == --v-radius` and verify every corner is identical (flat).
- **Bar height modes** (§9.7): render `o-bar` in text / contains / input modes with the same input; verify the bar's total height in contains mode puts the control's *text* `--v-spacing` from the bar edge, and input mode is exactly `--v-input-height` tall.
- **Section flow** (§6.2): direct children of `o-container` are separated by `--v-gap-section`; a prose section leading with a heading gets the heading's space-above instead.
- **Inline text insets** (§6.1): a control / box border-box sits on the container edge in every mode (it never moves). A field label defaults to the **straight edge** — inset by the control's `--o-input-box__radius`; `v-align-edge` pulls it to `0`, `v-align-text` to `--v-control-inset`. Prose that's a **direct child of a container with boxes** insets by `--v-pad-inline` (a dialog: `--o-box__radius`), grows its block padding to match when it's the container's first/last child, and lets a sibling code block break back out; the same prose **inside a box** sits flush (no compounding with box padding). (Behavioral check, not pixel-exact.)
- **Spacing**: verify `o-box` padding matches `--v-pad-block` / `--v-pad-inline`. Verify prose in a box (`o-box` + `o-prose`) reads with uniform block padding (text-box-trim handles optical alignment — no lh-compensation subtraction, no separate text-box object).
- **Layout reflow**: `o-grid` — set viewport to 1200px, verify multi-column; set viewport to 400px, verify single-column. `o-split` — same pattern, verify it collapses to stacked at narrow width.
- **Stack/group gaps**: verify `o-stack` children have vertical spacing, `o-group` has horizontal spacing.

**Done when:** The **Objects page** renders: a padded `o-box` with nested `o-input-box` elements showing the preset-driven radii stepping *inward* from the frame (outer corners largest, inner ones bottoming out at the floor — never sharp); an `o-stack` of items; an `o-prose` block with boundary-owned heading/paragraph rhythm and an `<hgroup>`; an `o-grid` that reflows responsively; an `o-split` that collapses; an `o-segmented` settings group; and the inline text-inset modes (§6.1) — field labels and prose insetting to meet their boxes, with a prose code block breaking out. The four-level nesting model from §9.1 works visually and is reviewable on the page.

---

## Phase 3: CSS components, variants, and tools

**Goal:** Visual chrome, tonal variants, surface treatments, and the narrow tools layer.

**Dependency:** Phase 2 (components compose objects).

### 3a: Variants and state mixins (`src/lib2/css/variants/`, `src/lib2/css/tools/`)

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
2a. **`bleed.css`** — `v-bleed` (§6.1): the shared `@container frame (max-width: 30rem)` rule that full-bleeds the boxes/grid/prose inside an opted-in frame (page container or dialog). A *mode* variant, not a knob setter — sanctioned by the §4 variant discipline (its rules target library classes in its subtree; it has no look of its own).
3. **Radius — no variant classes.** There is no `variants/radius.css`. The radius cascade is **always on** in `tokens/radius.css` (Phase 1, §8.2); the look is set by the two root values (`--v-radius` / `--v-radius-min`) — flat is `min == max`, no preset class — so "concentric / uniform / flat" are points in one parameter space, not modes (§8.4). Whether the page frame is *painted* is a per-frame choice (§8.1). Frame-level bars/dialogs occupy their corners with a round control rather than padding content out (§8.5).
4. **`align.css`** — the inline text-inset model (§6.1). Because boxes don't nest, it covers exactly two situations: **field** label/description → the control's straight edge (`--o-field__inset`, default `var(--o-input-box__radius)`, wherever a field sits), and **prose in a container that holds boxes** → the cards beside it (`o-container:has(boxes) > o-prose` gets `--o-prose__inset`, default `var(--v-pad-inline)`; a dialog uses `var(--o-box__radius)`; flush once inside a box, and block-padding grows to match at the container's first/last child). `v-align-edge` / `v-align-text` set the inset to `0` / the inner-text pad for a subtree. Block-box children of inset prose break out by the negated inset.
5. **`text.css`** — `v-text-display`, `v-text-meta` if needed. Sparingly.

**State mixins** (`tools/states.css`): *(Aesthetic spec §06, §07)*

6. **`states.css`** — defines the two core interaction mixins that all interactive components use:
   - **`t-hover` mixin**: `filter: contrast(0.95) saturate(1.15);` — one filter that works on every button, link, badge, and tone. No per-palette hover-color knobs. The filter subtly darkens while making colors pop. **Do not port v1's `will-change: filter` inside the `:hover` rule.** v1 declares `will-change` only once the element is already hovered, which is too late to do its job — `will-change` is a hint the browser needs *before* the change begins, so applying it in the hover state is semantically wrong (it happens to nudge Safari onto the GPU, but only as a side effect). If a GPU-promotion hint is actually needed for a Safari filter glitch, apply it on the base (non-hover) selector or use an explicit `transform: translateZ(0)`/`backface-visibility` on the base rule instead, and verify it's still required in v2 before adding it at all.
   - **`t-focus-ring` mixin**: `box-shadow: var(--v-shadow-focus); outline: 2px solid var(--v-ring); outline-offset: 2px;` — stacks a soft halo (`--v-ring-alt` via `--v-shadow-focus`) under a crisp outline (`--v-ring`). Both are needed — outline alone is invisible against busy layouts, halo alone is fuzzy.
   - Components consume these: `c-button:hover { @mixin t-hover; box-shadow: var(--v-shadow-outer); }`, `c-button:active { box-shadow: none; }`, `c-button:focus-visible { @mixin t-focus-ring; }`.

### 3b: Components (`src/lib2/css/components/`)

Pure CSS components from §10.1, in rough priority order:

1. **`button.css`** — `c-button`. Layers `@mixin t-hover` + `box-shadow: var(--v-shadow-outer)` on hover, `box-shadow: none` on active. `@mixin t-focus-ring` on `:focus-visible`. `c-button--icon` for square mode. All transitions via `var(--v-duration) var(--v-ease)`.
2. **`card.css`** — `c-card`. Surface chrome on `o-box` (bg `var(--v-card-bg)`, dynamic border, `--v-shadow-outer`; prose content goes in an `o-prose` child — §6). Sets `--o-stack__gap: var(--v-pad-block)` for a direct-child stack — in-card rhythm defaults to the card's own padding (§6.2, workbench). **Conditional shadow**: cards inside `o-container` on wide viewports lose `--v-shadow-outer`; cards inside `:modal` / `:popover-open` always show it. *(Aesthetic spec §15)* Also: `:has(:invalid, [aria-invalid="true"]) [type="submit"]` renders at `opacity: 0.5` but keeps `pointer-events: unset` — the disabled-looking submit must remain clickable so the form engine can dispatch focus to the first invalid field. *(Aesthetic spec §18)*
3. **`input.css`** — `c-input`. Bg `var(--v-input-bg)`, border `var(--v-border-color-strong)` (§7.0 — controls need legible edges), inner shadow (`--v-shadow-inner`), `@mixin t-focus-ring`, invalid-state border (`var(--v-danger-text)`).
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
14a. **`table.css`** — `c-table` (§10.1, new). Data-table chrome with **control-height rows, decoupled from controls**: `--c-table__row-height` defaults to `var(--v-input-height)` (the v1 look — table rows read like control rows) but is its own knob so data tables densify independently of form controls. Cell metrics use the control recipe, *not* trim: block padding `calc((var(--c-table__row-height) - 1lh) / 2)`, inline padding `var(--v-control-inset)` — identical behavior with or without `text-box-trim` support, so an inline-editable cell never misaligns against its input (§6, §10.1). Cells also take `trim-both` where supported (padded-box rule) as an optical refinement. Row dividers `var(--v-border-color)`; header cells `--v-font-weight-label`.

Browser-primitive component chrome (§10.2) — these need CSS only at this phase; JS wiring comes in Phase 5:

15. **`tabs.css`** — `c-tabs`. Tablist chrome. **Selected-tab indicator**: uses `color-mix(in hsl, var(--v-border-dynamic-base) var(--v-border-dynamic-mix), var(--v-accent))` for the border color — same `color-mix` recipe as dynamic borders but mixing against the active tone. Use `inset box-shadow` for the underline so neighboring tabs don't shift on selection. The indicator self-themes: a tab strip inside `v-colors-success` picks up the success tone. *(Aesthetic spec §17)*
16. **`modal.css`** — `c-modal`. Centered `<dialog>`, backdrop (`var(--v-backdrop)` tint + `backdrop-filter: blur(4px)`), `@mixin t-focus-ring`. **Scroll-edge shadows**: scrollable modal content gets `--v-shadow-inner-top` when not scrolled to top and `--v-shadow-inner-bottom` when not scrolled to bottom, driven by `data-scroll-top` / `data-scroll-bottom` attributes set by a DOM handler. *(Aesthetic spec §16)*

    **Scroll structure & the scroll-away header** (folded from the Mind-the-Gap fork; the model is its `.c-modal__view` — see `docs/v2/spacing-workbench.html`). The modal card **is** the scroll container and is **`background: transparent`**; the visible surfaces tile it and carry the rounding:
    - **Header** (`c-modal__header`) — `flex: none`, rounds the **top** corners, scrolls away with the content (it is *not* sticky). Only the close **X** stays pinned (its own `position: sticky; top: 0` element with a negative `margin-block-end` that cancels its height so the header still starts flush at the top; the X overlays the header's top-right corner). The header reserves `padding-right` for the X (a real button / tap target, unlike the small decorative leading mark, which is an inline ~`0.7em` glyph nudging the title clear of the corner curve — not a button).
    - **Body** (`c-modal__body`) — `flex: 1 0 auto` (grows so there's never an unfilled gap below the content), rounds the **bottom** corners, holds content + footer.
    - **Why transparent:** a solid background on the scroll element paints **past the radius during the overscroll rubber-band** (square corners / a visible band); a separate solid frame behind it just relocates the problem and leaks behind a two-tone glass header. Transparent scroller + self-rounding surfaces is the only thing that holds. Keep the bounce — `overscroll-behavior: contain` (never `none`) — and lock the page behind with `body:has(:modal) { overflow: hidden }`. Any `backdrop-filter` surface that reaches a rounded edge (glass header, sticky footer bar) must round **its own** outer corners — a compositing layer escapes the ancestor clip.

    **Header treatment — plain (default) / glass (opt-in variant).** Plain = card-tone surface (same tone as the body, so their flush seam is invisible). Glass = tinted two-tone surface (`v-colors-highlight` + glass blur). **Seam padding:** the header↔body gap must total *one* pad unit for plain and *two* for glass (two-tone needs the breathing room). Implement by zeroing the header's `padding-bottom` by default (seam = the body's `padding-top` alone = one pad) and restoring `padding-bottom: var(--v-pad)` only under glass (seam = header pad + body pad = two). Do **not** add the extra space as body `padding-top` (that double-counts) or as a margin gap between surfaces (a transparent gap would show the backdrop between them).

    **Footer stickiness — opt-in, three modes** (not per-button — per-button was tried and reads badly with more than the submit): `none` (footer scrolls in flow, the default), `submit` (only the primary `[type=submit]` pins bottom-right via a sticky float mirror — its in-footer slot goes `visibility: hidden`; secondary actions scroll away), and `bar` (the whole footer pins as a glass action bar that breaks out to the dialog edges, top border + edge shadow, rounds its own bottom corners). Pairs with the `:has(:invalid) [type=submit]` disabled-but-clickable treatment (§10 / Aesthetic spec §18). **Width presets** (`--c-modal__width`, ship a few named defaults set *on the component*, not as global utilities): a comfortable default (~40rem), a container-width variant (`var(--o-container__max)` — matches the page reading width), and a narrow/mobile variant (~22rem). **Full-bleed boxes — one behavior for every frame.** Both the page region (`o-container`) and a dialog are `container-type: inline-size` **query containers sharing one container-name** (e.g. `frame`), so a *single* `@container frame (max-width: …)` rule makes the boxes inside *either* go full-bleed when their frame is narrow: the box **breaks out** of the frame's gutter to span its edges and drops its radius / side borders / shadow, and the frame's prose realigns to the box's inner text (§6.1, with its own block boxes bleeding too). Breakout (not gutter-collapse) is what keeps the dialog header clear of the frame's corner curve. Because it keys off each frame's *own* width, the page full-bleeds on a narrow viewport and a dialog full-bleeds when *it* is narrow (its Narrow width preset triggers it even on a wide screen) — one mechanism, no special-casing. Full-bleed is **opt-in per frame** via the `v-bleed` variant on the frame element — a subtree re-mode, exactly what the variants layer is for under the relaxed §4 discipline (§6.1 — the workbench treats it as a mode, and blanket-breaking every card out is too opinionated as a default); the breakpoint is a fixed length in the `@container` condition (container queries can't read custom properties), so changing it is a consumer-CSS override. (This is the *contents* adapting — making a dialog **frame** itself fill the window is just `--o-dialog__offset → 0`.) `c-card`'s full-bleed collapse (§10) and `c-drawer` are the same mechanism on their frames.
17. **`drawer.css`** — `c-drawer`. Edge-anchored `<dialog>` with side variants.
18. **`popover.css`** — `c-popover`. Anchor-positioned `[popover]`. Applies `v-colors-popover` (matches surrounding chrome).
19. **`menu-component.css`** — `c-menu`. Chrome on `o-menu`. Menu item highlight is conditional on keyboard/mouse mode: `body:not([data-v-kb-nav]) .o-menu-item:hover` vs `body[data-v-kb-nav] .o-menu-item[data-active]` both apply `v-colors-highlight` (presence flag, §12.2.4). *(Aesthetic spec §09)*
20. **`styled-select.css`** — `c-styled-select` chrome.

### 3c: Tools (`src/lib2/css/tools/`)

The narrow set from §11: `t-px-0`, `t-py-0`, `t-p-0`, `t-px`, `t-py`, `t-p`, `t-flex`, `t-flex-fill`, `t-flex-auto`, `t-flex-none`, `t-flex-wrap`, `t-block`, `t-inline`, `t-inline-block`, `t-hidden`, `t-sr-only`, `t-border`, `t-border-none`, `t-border-inner`, `t-radius-none`, `t-radius-full`, `t-shadow`, `t-shadow-inner`, `t-shadow-outer`, `t-shadow-none`, `t-align-start`, `t-align-center`, `t-align-end` (flex/grid `align-items`), `t-text-start`, `t-text-center`, `t-text-end` (`text-align` — a separate trio from box alignment, §11), `t-truncate`.

### 3.S Documentation pages

Three zero-client-JS pages, built in the site's section order — **Composition, then Colors, then Components**:

1. **Tools sub-page** (§20.2.3, under Composition) — one row per `t-*` tool with a one-line description and a before/after live render (including the box-alignment vs. text-alignment trios side by side). Fits on one screen. This completes the **Composition** section (Variables + Objects + Tools + Typography all now documented).
2. **Colors page — contrast grid** (§20.3) — once `variants/colors.css` exists (step 3a), build the SSR APCA contrast grid: a grid of `v-colors-*` variant boxes with APCA Lc scores and pass/fail indicators (the contrast checker carried forward from v1). The interactive color playground island is added later (Phase 9); this phase ships the static grid.
3. **CSS component gallery** (§20.4, Components) — a static version of the Components page rendering every component from §10.1 (including `c-table`) in its major states (default, hover-simulated via class, focus, disabled, invalid) plus variant demonstrations (each `v-colors-*` and `v-surface-*` applied to buttons, cards, alerts). Authored like every other page — Solid JSX, statically rendered, **no `data-js`, no hydration** — using the render-only wrappers, which by now cover most of §10.1. It is the review artifact for the component *CSS* and the E2E target for this phase. In Phase 9 this page gains the real interactivity; the static render remains as the zero-JS reference output.

By the end of Phase 3 all three site sections exist and the site documents the entire CSS layer — variables, objects, tools, typography (Composition), colors, and components — with zero framework code. **This is the milestone where the CSS structure is fully "up and running for review."**

### 3.T Tests

E2E tests target the Tools page and CSS component gallery from 3.S.

Write `src/lib2/css/components.desktop.e2e.ts`:

- **Buttons**: verify `c-button` has correct padding (from `o-input-box`), border-radius, hover shadow. Test `c-button--icon` is square. Test tonal variants (`v-colors-primary`, `v-colors-danger`) change background/text color.
- **Cards**: verify `c-card` has shadow, border, correct radius. Test `v-surface-card` vs `v-surface-elevated` shadow difference.
- **Inputs**: verify `c-input` has inner shadow, correct height (`--v-input-height`). Simulate `:focus` and verify focus ring appears. Test `:invalid` / `aria-invalid` state styling.
- **Checkboxes/Radios**: verify custom styling replaces browser defaults. Test `:checked` state.
- **Toggle**: verify unchecked/checked visual states. Track width and thumb position.
- **Alerts**: verify tonal coloring with `v-colors-success`, `v-colors-danger`, `v-colors-warn`.
- **Tables**: verify a single-line `c-table` row is `--c-table__row-height` tall (default = `--v-input-height`); override `--c-table__row-height` in a scope and confirm inputs on the same page are unaffected (decoupling). Verify a multi-line cell grows past the minimum.
- **Tooltips** `@chromium-only`: verify anchor positioning places tooltip near its anchor. Verify popover shows/hides.

Write `src/lib2/css/components.mobile.e2e.ts`:

- Verify touch-target sizing: buttons and inputs meet minimum 44px tap target.
- Verify card shadows are suppressed inside containers on mobile (if this pattern carries forward).

### 3.D Design notes

Each component needs visual polish beyond just "applies the right CSS class." Reference v1 files via `src/lib/styles/components/<name>.css` and `src/lib/styles/tools/elements.css` for patterns to carry forward:

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

**Done when:** The **CSS component gallery** renders every component from §10.1 with appropriate tonal variants and surface treatments, using only CSS classes and native HTML. No JS. Buttons, cards, alerts, inputs, toggles, modals (opened via `commandfor`), and tooltips (via `[popover]` + anchor positioning) all render correctly. The Tools page renders all `t-*` utilities. Components should look polished — hover a button and see a shadow appear with a smooth transition, focus an input and see a clear ring, toggle a switch and see the thumb slide.

---

## Phase 4: Utils (`src/lib2/utils/`)

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

## Phase 5: DOM layer (`src/lib2/dom/`)

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
   - `t-kb-nav.ts` — **new** *(Aesthetic spec §09)*. Sets the presence flag `body[data-v-kb-nav]` (no value) on first Tab/arrow-key, removes it on first mousedown. This single flag drives the CSS conditional (`[data-v-kb-nav]` / `:not([data-v-kb-nav])`) for menu hover vs. active-descendant highlighting, ensuring mouse users see hover highlights while keyboard users see active-descendant highlights — never both simultaneously.
   - `t-empty.ts` — **new** *(Aesthetic spec §19)*. Sets `data-t-empty` attribute on containers whose children render no visible content. Drives the empty-alert/error-message collapse in CSS (`.c-alert:has([data-t-empty]) { display: none }`).
   - `t-scroll-shadow.ts` — **new** *(Aesthetic spec §16)*. Observes scroll position of modal/drawer content areas. Sets `data-scroll-top` when scrolled to top, `data-scroll-bottom` when scrolled to bottom. CSS uses these to show/hide `--v-shadow-inner-top` / `--v-shadow-inner-bottom`.
   - Form behaviors: `t-validate.ts`, `t-submit.ts`, `t-validate-group.ts`, `t-validate-error.ts`, `t-reset-on-close.ts`, `t-close-on-success.ts`
   - Component-internal: `c-modal__close.ts`, `c-modal__speed-bump.ts`, `c-tabs__select.ts`, etc.
8. **`components/`** — thin compositions (§12.3): `tabs.ts`, `modal.ts`, `drawer.ts`, `popover.ts`, `menu.ts`, `styled-select.ts`.
9. **`index.ts`** — public API (no handler side-effects). **`all.ts`** — Pattern A entry that imports every handler.

### 5.T Tests

**Unit tests (Vitest)** — colocated as `*.test.ts`:

- **`compose-attrs.test.ts`**: the full merge matrix. Test `ca()` with: `id`/`role` conflict throws; `data-js` concats with space; `data-*` conflict throws; `class` concats; ARIA attrs concat; nested `concat()`/`override()` wrappers. Test `only()` filtering. Test mismatched wrapper types (e.g. `concat` vs `override` on same key).
- **`validate.test.ts`**: registry path (`registerValidator` + lookup by name), WeakMap path (`addValidator` + lookup by element ref), touched-state machine (untouched → touched on blur, dirty on input), validation dispatch (returns error string, clears on fix), group validation.
- **`submit.test.ts`**: registry path, closure path, disabled-state filtering (`aria-disabled` inputs excluded from FormData), submit choreography (validate → collect → handler → success/error), `setErrors` / `setFormError` server-fed error flow.
- **`dispatch.test.ts`**: `registerBehavior` creates listener on first registration, walks `data-js` ancestor chain, multiple behaviors on one element via space-separated tokens.

**E2E tests (Playwright)** — add an **interactive "DOM behaviors" page** to the documentation site: raw markup carrying `data-js` tokens, with a `<script>` that imports `dom/all` and calls `mount()`. It renders tabs, a modal, a form, and a menu. This is the **one deliberate raw-HTML page** in the Solid-authored site — its whole point is to demonstrate (and E2E-test) the vanilla-JS consumer path with no framework in the loop; it is a permanent demo, not an interim format. Consistent with the no-throwaway-harness approach used for the CSS layer.

- **`tabs.desktop.e2e.ts`**: arrow key navigation between tabs, Home/End, `aria-selected` toggles, panel visibility toggles.
- **`modal.desktop.e2e.ts`**: open via `commandfor` `@chromium-only`, ESC closes, outside-click closes, focus trap keeps focus inside, focus restores on close.
- **`menu.desktop.e2e.ts`**: open menu, arrow key navigation, typeahead letter-jump, Enter selects, ESC closes.
- **`form-validation.desktop.e2e.ts`**: submit empty form → errors appear on touched fields, fix one field → its error clears, submit again → remaining errors shown, successful submit → handler called.
- **`form-validation.mobile.e2e.ts`**: same flows using `.tap()` instead of `.click()`, verify touch-friendly error display.

**Done when:** The **DOM behaviors page** (`css/index.css` + a `<script>` importing `dom/all` and calling `mount()`) renders interactive tabs, a modal with ESC-close, a form with validation + submit choreography, and a menu with keyboard nav — all without any framework.

---

## Phase 6: Solid layer (`src/lib2/solid/`)

**Goal:** Complete the Solid wrappers from §13. Note this phase does not *start* the pseudo-package — `src/lib2/solid/` has been accumulating **render-only** wrappers (class list + prop spread, no behavior) since Phase 0, because the doc site is authored in Solid JSX from day one. This phase upgrades those wrappers to their full contracts: real prop APIs, `ariaize`, `ca()` merging, `data-js` behavior tokens, validation wiring.

**Dependency:** Phases 1–5 (CSS classes, DOM behaviors).

1. **Scaffold** (whatever remains from Phase 0): `janus.json` (`depends: ["css", "dom", "utils"]`), configs.
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
   | `table.tsx` | `Table` | `c-table` | Thin `<table>` wrapper (§10.1). Prop: `rowHeight` (sets `--c-table__row-height` inline; default inherits the knob). |
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

**E2E tests (Playwright)** — these test Solid-rendered components, not raw HTML. Create a Solid test app (`src/lib2/solid/test-app/`) that renders each component with representative props. This app doubles as a development playground during the build and as the E2E target.

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

**Goal:** The remaining Vite plugins from §3.1. (`vite-plugin-ssg.ts` was already ported in Phase 0.5 — the doc site needs SSR from the start — so it is not repeated here.)

1. **`vite-plugin-purgecss.ts`** — adapt from v1. Removes unused CSS classes from emitted output.
2. **`vite-plugin-janus-bundle.ts`** — **new** (§12.4). Text-scans SSR output for `data-js` tokens, generates a client entry importing only the matching handler modules. This depends on the filename-as-manifest convention from Phase 5 being stable.

**Done when:** A build with all three plugins (`ssg` from Phase 0, plus `purgecss` and `janus-bundle` from this phase) produces a production bundle where: unused CSS is stripped, SSR pages are pre-rendered, and the client JS contains only the handler modules referenced in the SSR output.

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

## Phase 9: Documentation site — interactivity & completion

**Goal:** Finish the documentation site. The SSR shell (Phase 0) and the zero-client-JS CSS-reference pages — Variables, Objects, Tools, the CSS component gallery, Typography, the Colors contrast grid (Phases 1–3) — **already exist, Solid-authored, and have been the review surface throughout.** This phase layers on everything that needed the DOM layer and the completed component APIs (Phases 5–6): the interactive component demos, the **theme workbench** (§21), the scoped mode toggles (§20.6), the colors playground island, the SPA island, and finished Home content. It also migrates any remaining v1 pages off `~/lib/`.

**Dependency:** All previous phases — the interactive parts exercise the full stack.

**Migration strategy:** The v1 demo site is still running at this point. Migrate it page by page — each page switches its imports from `~/lib/` to `~/lib2/` and adopts v2 class names and component APIs. After each page migrates, visually compare it against the v1 version (still accessible by temporarily reverting that page's imports, or by checking out `main`). A page is "done" when it looks at least as good as v1.

### 9a: Site shell — wire up interactivity

The shell, top nav, and SSR architecture were built in Phase 0; the doc pages were added in Phases 1–3. What remains is the interactivity that depends on the DOM/Solid layers:

1. **Theme workbench** (§21) — the productionized descendant of `docs/v2/spacing-workbench.html`, replacing v1's prefs modal and the old config-modal concept. A **drawer, not a modal** (the page stays visible — the page *is* the preview). Contents per §21.2: presets (Compact / Default / Spacious); carried-forward prefs (color scheme, animations, font family); **sliders** for the Rhythm group (`--v-spacing`, `--v-input-height`, the derived multiples expressed ×spacing), the Type group (anchor pairs with a link/unlink toggle — linked = fixed type, unlinked = fluid opt-in; ratios; line-height; viewport anchors), and the Radius group (max/min sliders + Stepped/Near-uniform/Flat chips, `--o-dialog__offset`); an **Advanced `<details>` expando** with plain text fields for every root knob (`calc()`/`var()` capable — the old config-modal path); a live resolved-token readout; **Copy `:root` CSS**; **Reset**. Slider input writes to `document.documentElement.style` immediately; persist via `ui-style-prefs`. This is the live-editing counterpart to the static **Variables sub-page** (§20.2.1), whose per-token "open in workbench" affordances deep-link here.
2. Activate the previously-inert workbench trigger in the nav, and wire the **scoped mode toggles** on Objects/Components demo cards (§20.6 tier 2–3: bar height modes, list rhythm, insets, full-bleed, dialog header/footer modes) — segmented controls flipping the class/attr/knob on that one demo render, with the markup snippet updating.

### 9b: Pages

3. **Home** (§20.1) — finish the placeholder from Phase 0 into the full landing page: explanatory text, visual samples, navigation cards. The visual samples should show off the design system's polish: a card with surface treatment and shadow, a row of tonal buttons, a form snippet with labeled inputs. Not a wall of text.
4. **Components** (§20.4) — upgrade the Phase 3 static gallery into the full interactive Components page: sidebar + `o-grid` of component demos, now that the wrappers carry their full APIs and `data-js` wiring. Sidebar uses `o-split` / `c-drawer` recipe from §10.4. **Each component from §10 gets its own demo card.** See the component demo catalogue below. Because the gallery was Solid-authored from the start, this is an upgrade of the same page, not a rewrite.
5. **Composition** (§20.2 — Variables, Objects, Tools, Typography) — already built (Phases 1–3) and already Solid-authored. In this phase: ensure cross-links from Home, confirm the theme workbench's live knobs visibly drive the Variables sub-page, add the per-row **"open in workbench"** affordances (§20.2.1), wire the Objects page's **scoped mode toggles** (item 2 above), and add the **width-draggable type frame** to Typography (§20.2.4 — the fluid opt-in demo; it must set the fluid anchors inside its own scope since the site default is fixed).
6. **Colors** (§20.3) — the APCA contrast grid (SSR) already exists from Phase 3; add the color playground **island**. Playground has text inputs for `--v-bg`, `--v-link`, `--v-accent`, `--v-muted`; `--v-fg` shown read-only. Scoped preview area with live contrast ratios.
7. **SPA** (§20.5) — SSR shell + hydrated island hosting component demos. Validates the island pattern. (Not a top-nav item — reachable from Components or the footer.)

### 9c: Component demo catalogue

Every component gets a demo card on the Components page. Each demo card uses the `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` pattern. Each card has a unique `id` for sidebar anchor linking and E2E test scoping. Reference v1's demo files (`src/demos/<name>-demo.tsx`) for content structure — adapt for v2 class names and patterns.

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
| **Tables** | `tables-demo` | Data table with header, dividers, single-line rows at `--c-table__row-height`, one multi-line cell (grows past minimum), an inline-editable cell (input inside a cell — heights align, §10.1). Scoped row-height override demonstrating decoupling from `--v-input-height`. |
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
- Theme workbench opens from the nav trigger as a drawer; slider and advanced-field inputs are present; values persist across reloads.
- Knob changes visibly affect the page (e.g., drag `--v-spacing` → verify padding changes on a card; drag `--v-radius` → verify the stepped radii move).
- Copy `:root` CSS emits only the overridden knobs. Reset button clears all knob overrides.
- A scoped mode toggle (e.g. bar height mode on the Objects page) changes only its own demo render and updates its markup snippet.
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

**Done when:** `npm run build` produces a multi-page static site. Every page works with JS disabled (SSR). The colors playground and SPA island hydrate correctly. The theme workbench's sliders visibly re-theme the whole site (including the Variables page) and persist across reloads; Copy-`:root`-CSS round-trips; Reset clears everything. Scoped mode toggles work on the Objects and Components demo cards. All E2E tests pass. Every component from §10 has a visible, interactive demo on the Components page, **and the site documents the full public surface — every `--v-*` knob (Variables), every `o-*` object (Objects), every `t-*` tool (Tools), with live examples — structured by the three-tier customization story (§20.6).**

---

## Cross-cutting notes

### Gradual migration principles

This plan uses a **strangler fig** approach: v2 code grows in `src/lib2/` while v1 code in `src/lib/` stays fully functional. Key principles:

1. **The demo site must look correct at every commit.** If a migration step makes something look worse, fix it before moving on. v1 is the visual baseline — not a spec document, but the actual running site you can compare against side-by-side.
2. **Migrate bottom-up.** CSS tokens → objects → components → Solid wrappers → demo pages. Each layer can be validated independently before the layer above consumes it.
3. **One file dies when its replacement is proven.** Don't delete `src/lib/styles/components/button.css` until `src/lib2/css/components/button.css` renders identically (or better) in the demo site. Phase 10 handles any stragglers.
4. **Dual aliases coexist.** `~/lib/*` (v1) and `~/lib2/*` (v2) both work. During migration, a single file can import from both — e.g., a demo page might use v2 buttons but v1 modals while modals are still being ported.
5. **v1 is the reference, not `git show`.** Read v1 source directly from `src/lib/`. No need to reconstruct design decisions from memory or documentation — the working code is right there.

### What to port from v1 vs. rewrite

v1 source lives alongside v2 in the working tree during migration. Read v1 files directly from `src/lib/`, `src/demos/`, etc. Specific things worth porting:
- `vite-plugin-purgecss.ts`, `vite-plugin-ssg.ts` — adapt, don't rewrite.
- Pure utilities headed for `utils/` — port directly, strip DOM deps. Key candidates listed in Phase 4.
- Demo component structure — adapt for v2 class names and patterns.
- APCA contrast computation in `colors.tsx` — reuse `apca-w3` / `colorparsley` integration.
- `ui-style-prefs.ts` infrastructure — reuse for the knob persistence in the theme workbench (§21).
- `docs/v2/spacing-workbench.html` — the prototype behind the theme workbench (§21) and the rhythm/radius/dialog decisions folded into §6–§10; keep as a working reference.

### Testing strategy

Testing is not an afterthought — it's built into every phase. Each phase above has a `*.T Tests` subsection specifying exactly what to test and where test files go. This section covers the cross-cutting patterns and conventions.

**Three test layers:**

1. **Unit tests (Vitest)** — for `utils/` and `dom/` pure logic. Colocate as `*.test.ts` next to source. Run via `npm run test:unit`.
2. **E2E tests (Playwright)** — the primary verification layer for anything involving rendering, CSS computation, or multi-element interaction. Colocate as `*.desktop.e2e.ts` / `*.mobile.e2e.ts`. Run via `npm run test:e2e`.
3. **Documentation site as visual test** — the doc pages are the "test" for visual correctness. E2E tests verify behavior; the pages verify appearance. Because the site is stood up in Phase 0, this layer exists from the very first CSS commit.

**No test harnesses — the doc pages are the target.** Unlike a typical build, there are no throwaway `test-harness.html` files. The SSR doc site exists from Phase 0, so CSS and DOM tests run against the real documentation pages:

- The **Variables** and **Base/Typography** pages (Phase 1) are the target for token/base E2E tests.
- The **Objects** page (Phase 2) is the target for object E2E tests.
- The **Tools** page and **CSS component gallery** (Phase 3) are the target for component-CSS E2E tests.
- The **DOM behaviors** page (Phase 5) — raw markup + `dom/all` — is the target for interaction E2E tests.

All are real, registered pages in the site (entry points in `vite.config.ts`), reviewable by a human at any time, not just fixtures.

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

**What NOT to E2E test.** Pure CSS rendering that's adequately verified by visual inspection in the demo site (typography spacing, exact color values). Don't test `getComputedStyle` for every CSS property — test structural behavior (do the preset radii apply concentrically? does the grid reflow?) and interactive behavior (does the focus ring appear? does the modal close on ESC?).

**Test count expectation.** By the end of Phase 9, expect roughly: ~20 unit test files in `utils/`, ~10 in `dom/`, ~5 in `solid/`; ~5 CSS E2E files; ~5 DOM E2E files; ~25 Solid component E2E files (desktop); ~10 mobile E2E files; ~5 demo site E2E files. This matches v1's scale (~33 E2E files + unit tests).

### Design language — visual polish to carry forward from v1

v1's components look intentional and polished because of specific, deliberate design choices. Without these, components come out flat and generic. This section captures the key patterns an implementer must carry into v2. Reference v1 source directly in `src/lib/` for exact values.

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
| Card | `--v-shadow-outer`, dynamic border, radius from `--o-box__radius` (preset-assigned), flatten + full-bleed collapse in `o-container` |
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
| `--v-inner-radius` | `--o-input-box__radius` (v2 uses the object-namespaced knob, assigned by the radius cascade — §8) |

---

## Phase 10: Cleanup — `lib2/` → `lib/`

**Goal:** Remove v1 code and finalize the directory rename.

**Dependency:** Phase 9 complete. The demo site runs entirely on v2 code from `src/lib2/`. No file in the project imports from `~/lib/` (the v1 aliases).

1. **Verify no v1 imports remain.** `grep -r "~/lib/" src/` should return nothing (only `~/lib2/` imports). The v1 demo pages, test files, and components should all have been migrated or removed during Phase 9.

2. **Delete v1 source.** Remove everything v2 replaces:

   | Path | Why safe to delete |
   |---|---|
   | `src/lib/` | The v1 library — fully replaced by `src/lib2/` |
   | `src/demos/` | v1 demo components — replaced by v2 demo pages |
   | v1 pages in `src/` (`app.tsx`, `components.tsx`, `colors.tsx`, `typography.tsx`, `ssr.tsx`, `prefs-modal.tsx`, `ssr-callbacks.ts`) and their E2E tests | Replaced by v2 demo site |
   | v1 entry points at root (`colors.html`, `typography.html`, `ssr.html`) | Replaced by v2 entry points |
   | `scripts/` | v1 utility scripts (`check-apca.ts`) |
   | `types/` | v1 type shims — recreate in `lib2/` if needed |

3. **Rename `src/lib2/` → `src/lib/`.** One commit. Rename the documentation-site app `src/lib2-site/` → `src/site/` (it is the v2 site that replaced the deleted v1 pages; it stays, just loses the `2`).

4. **Update all aliases and imports.**
   - `vite.config.ts` — change `~/lib2/*` aliases to `~/lib/*`, remove the old v1 `~/lib/*` aliases.
   - `tsconfig.json` — same.
   - Find-and-replace all `~/lib2/` imports in source to `~/lib/`.
   - Update any `rollupOptions.input` paths (including the documentation-site entry points).

5. **Clean up dependencies.** Remove v1-only deps from `package.json` (`@floating-ui/dom`, `lucide-solid`, etc.).

6. **Update `README.md`** — replace v1 content with the full v2 README including the "Updating your fork" section (§3.2).

### 10.V Verify

```
npm install         # no broken deps after removal
npx tsc --noEmit    # no stale references
npm run lint        # clean
npm run test        # unit tests pass
npm run test:e2e    # E2E tests pass
npm run build       # production build succeeds
```

**Done when:** `src/lib/` contains only v2 code, no `src/lib2/` exists, all imports use `~/lib/`, the full test suite passes, and the demo site builds and runs with the same visual quality as v1.
