# Janus v2 — Conventions and Success Criteria

Part 8 of the [Janus v2 design spec](./README.md). Covers what was deliberately dropped from v1, browser feature gates, file layout, reference patterns, and the bar for considering v2 complete.

## 14. Explicitly dropped from v1

| Dropped | Why |
|---|---|
| `<SelectTypeahead>` / combobox | Zero call sites across all three surveyed consumers. |
| Standalone `<ListBox>` as a user-facing component | Only used inside `<Select>`. Folded into `c-styled-select`. |
| floating-ui dependency | Replaced by native anchor positioning. |
| Custom focus-trap library | `<dialog>` provides this natively. |
| Text-overflow tooltip machinery | Replaced by `t-truncate` + manual `c-tooltip` when needed. |
| Empty-state object class | Compose with stack + center. |
| v1's general-purpose mixin overuse | Mixins (via `postcss-mixins`) are kept but **used sparingly** — see §5.3. They exist for the irreducibly-bundled-knob case (`v-spacing $size` sets five knobs at once) and for media-/container-query wrappers (`v-breakpoint-*`, `v-container-*`). They are *not* used as a general composition mechanism the way v1 reached for them. |
| v1's behavior callback registry (`data-callback-*` plumbing) | One unified pattern under one dispatcher (§12.2.2–§12.2.3): elements opt into behaviors via tokens in a single canonical `data-js="..."` attribute. Behavior names are stable strings tied to module filenames — no per-render generated IDs. Validators / submit handlers still use a name registry (§12.1). Closures go in a WeakMap. |
| `o-top-nav-layout`, `o-sidebar-layout` (whole-page layouts) | Reframed as compositions of primitives (§10.4). The realistic needs — auto-hiding top nav, sidebar-to-drawer — decompose into recipes over `o-split`, `o-container`, `c-drawer` + CSS scroll-state / container queries. |

## 15. Browser feature gates

The build assumes the following are available without fallback. Verify against the project's target Baseline before starting.

- CSS `@layer`
- CSS custom properties + `calc()` (including `calc(infinity)`)
- `color-mix()`, `light-dark()`
- `oklch()` and the relative-color syntax `oklch(from <color> …)` — used for the `--v-fg` derivation in §5.1
- `1lh` unit
- `:has()`
- Container queries (`@container`, `cqw` units)
- `<dialog>` + `showModal()`
- `popover` attribute + Popover API
- `commandfor` / `command` attributes
- CSS anchor positioning (`anchor-name`, `position-anchor`, `position-try`)
- `scroll-state()` container queries — used by the auto-hiding-nav recipe in §10.4. Optional: the recipe degrades gracefully (nav stays visible) where unsupported.

`commandfor` and anchor positioning are both hard requirements — no shim, no polyfill. Consumers whose target browsers don't support them should pick a different library.

## 16. Naming & file conventions

```
src/lib/
  css/
    janus.json                  # depends: []
    CHANGELOG.md
    README.md                   # what this pseudo-package is, how to fork it
    .stylelintrc.js             # CSS-only lint config
    index.css                   # @layer declaration + imports
    reset.css
    base.css
    tokens/
      spacing.css                # --v-spacing + --v-pad-* / --v-gap-* root
                                 #   knobs + the v-spacing mixin (§5.3)
      color.css                  # --v-bg / --v-fg / --v-link / --v-accent /
                                 #   --v-muted + oklch-based --v-fg default
      typography.css
      radius.css
      shadow.css
      breakpoints.css            # v-breakpoint-* / v-container-* mixins
    objects/
      box.css                    # .o-box
      text-box.css               # .o-text-box
      input-box.css              # .o-input-box  (shared base for button/input/textarea)
      dialog.css                 # .o-dialog
      square.css                 # .o-square
      stack.css                  # .o-stack
      row.css                    # .o-row
      group.css
      grid.css
      container.css              # .o-container with --o-container__max
      split.css
      centric.css                # .o-centric
      ...
    components/
      button.css                 # .c-button
      card.css
      modal.css
      ...
    variants/
      colors.css                 # .v-colors-* (tones consumed by c- components)
      surface.css                # .v-surface-* (chrome treatments)
      radius.css                 # .v-radius-flat (cascade-step override — see §8.2)
      text.css                   # .v-text-display / .v-text-meta (role-based, sparingly)
      # No .v-spacing-*, .v-input-size-*, or other t-shirt-scaled variants.
      # Consumers define those in their own CSS as semantic scopes.
      # Font-size tokens are semantic (h1–h3, caption, code), not sm/md/lg.
    tools/
      padding.css
      flex.css
      ...

  utils/
    janus.json                  # depends: []
    CHANGELOG.md
    README.md
    tsconfig.json               # forbids DOM types + framework imports
    eslint.config.js
    vitest.config.ts
    index.ts                    # re-exports
    # framework-agnostic utilities (data structures, type guards, etc.)
    # split into individual files by concern. No DOM, no framework.

  dom/
    janus.json                  # depends: ["utils"]
    CHANGELOG.md
    README.md
    tsconfig.json               # allows DOM types, forbids framework imports
    eslint.config.js
    vitest.config.ts
    config.ts                   # setup() + JS_ATTR constant — §12.2.2
    compose-attrs.ts            # ca / only / concat / override — §12.2.1
    dispatch.ts                 # registerBehavior + the document-level
                                #   dispatcher — §12.2.2, §12.2.3
    mount.ts                    # initial DOM scan + MutationObserver wiring
    form/                       # form engine — §12.1
      index.ts
      validate.ts
      submit.ts
    handlers/                   # one file per behavior name. Filename IS the
                                #   manifest (§12.2.2) — the bundling plugin
                                #   (§12.4) text-scans the SSR output for
                                #   data-js="..." tokens and imports the
                                #   matching modules. Each module top-level-
                                #   calls registerBehavior (side effect) and
                                #   exports producers. Names follow the BEM
                                #   prefix scheme: t-* for toolkit, c-*[__*]
                                #   for component-internal, p-* for project.

      # Toolkit behaviors.
      t-roving-focus.ts
      t-focus-trap.ts
      t-restore-focus.ts
      t-request-close.ts
      t-typeahead-filter.ts
      t-active-descendant.ts
      t-open-tab.ts

      # Form-engine behaviors — same filename-as-manifest convention so the
      # bundling story is uniform across the library.
      t-validate.ts
      t-submit.ts
      t-validate-group.ts
      t-validate-error.ts
      t-reset-on-close.ts
      t-close-on-success.ts

      # Component-internal behaviors.
      c-modal-speed-bump.ts
      c-modal__close.ts
      c-tabs__select.ts
      ...
    components/                 # thin compositions — §12.3
      tabs.ts
      modal.ts
      drawer.ts
      popover.ts
      menu.ts
      styled-select.ts
    index.ts                    # API surface only — no handler side-effects
    all.ts                      # Pattern A entry — side-effect-imports every
                                #   handler module — §12.4

  solid/
    janus.json                  # depends: ["css", "dom", "utils"]
    CHANGELOG.md
    README.md
    tsconfig.json               # full Solid + DOM types
    eslint.config.js
    vitest.config.ts
    utils/                      # Solid-specific helpers (signals, resources,
                                #   etc.) — kept internal to the solid/
                                #   pseudo-package so utils/ stays framework-free
    aria.ts                     # ariaize + attrs — the only cross-cutting helpers
    use-labelled-input.ts       # hook: returns {labelProps, descriptionProps,
                                #                errorProps, inputProps, ids}
    labelled-input.tsx          # LabelledInput / LabelledInline / LabelledInputGroup
    input.tsx
    button.tsx
    card.tsx
    ...
    # No prop-mod-context, no form-element-props, no auto-prop. Validators
    # live in dom/'s registry (§12.1); Solid components just render
    # data-js="t-validate" or ref-attach closures. See §13.

plugins/                        # Individually copyable Vite plugins.
                                # Not pseudo-packaged — each file standalone.
  vite-plugin-purgecss.ts
  vite-plugin-ssg.ts
  vite-plugin-janus-bundle.ts   # SSR-introspection bundling — §12.4

# Root-level files (apply to the whole repo)
CHANGELOG.md                    # one-line summary per release pointing at
                                #   per-pseudo-package CHANGELOGs
README.md                       # includes the "Updating your fork" section
                                #   that drives the agent-driven sync — §3.2
package.json                    # single root package.json — no per-pkg variants
tsconfig.json                   # extends, with path aliases ~/lib/*
eslint.config.js                # extends per-pseudo-package configs; includes
                                #   the boundary-enforcing rule — §3.3
```

One CSS file per object, component, variant. No barrel `.css` files that import many siblings — the entry `index.css` is the single import point.

Every pseudo-package directory under `src/lib/` carries the same four files at its root: `janus.json`, `CHANGELOG.md`, `README.md`, and the configs it needs. This uniformity lets a consumer's agent treat any pseudo-package the same way at sync time — read the manifest, diff the local `CHANGELOG.md` against this repo's to find new entries, apply the changes, and copy the updated `CHANGELOG.md` forward as the next sync's high-water mark.

## 17. Reference patterns to study from v1

The implementing agent should NOT read v1 source as a template, but the following patterns are worth understanding before designing v2:

- The `0.5lh - 0.5em` line-height calibration (in v1's `o-text-box`) — preserved as the text-mode block padding formula in v2's `o-text-box` / `o-input-box` rules (see §6). Block-mode containers use plain `var(--v-spacing)`.
- The contextual variable layer (v1's `@layer variables` declared last) — preserve as the `variants` layer in v2.
- Modal's request-to-close protocol — keep the shape, drop the data-attribute registry.
- The form validation engine — same shape, leaner DOM-only API.

## 18. Success criteria

v2 is considered complete when:

- A static HTML page using only `src/lib/css/` renders a complete UI (buttons, cards, forms, modals via `commandfor`, dropdowns via native select) with no JS at all.
- Adding `src/lib/dom/` enhances forms with validation and modals with focus management — and nothing else changes visually.
- A consumer can copy any single pseudo-package (with its declared `depends`) into a fresh repo and it builds + lints + tests without touching the others. The boundary lint rule (§3.3) is what guarantees this.
- An LLM agent, given only the root `README.md` and the consumer's fork (whose copied `CHANGELOG.md` files mark the last sync point), can produce a coherent diff of "what needs to change in the consumer's fork to pick up the latest Janus" — no human translation step.
- A typical element carries 1–3 classes. The 95th percentile is ≤ 5.
- The `--v-*` knob surface is split into primary (static defaults) and secondary (derived) tiers (§5.1). Primary knobs are the minimal set a consumer needs to define a design; secondary knobs default from primaries and only need overriding to break a specific relationship.
- No `t-` class sets an arbitrary numeric scale (no `t-px-2`, `t-mb-4`, etc.).
- The custom listbox / styled-select component has ≤ 1 consumer use case in mind (font picker) and is documented as such.
