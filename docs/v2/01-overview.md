# Janus v2 — Overview

Part 1 of the [Janus v2 build plan](./README.md). Covers goals, non-goals, and how the library is packaged.

## 1. Goals

- **CSS-first.** The core library is a CSS package. Markup conventions are documented in plain HTML. JS is a strictly optional second layer.
- **Opinionated knobs over granular utilities.** Consumers compose 1–3 classes per element, not 20. The framework owns sizing, rhythm, and surfaces; consumers pick from a short list of variants.
- **Semantic names, not abstract scales.** No `sm/md/lg/xl` t-shirt sizing for spacing or typography. Spacing variants are consumer-defined (`.v-dense`, `.v-cta`). Font-size tokens name their purpose — `--v-font-size-h1`, `--v-font-size-caption`, `--v-font-size-code` — not their position on a scale. Objects that need their own proportions (`o-menu-item`, `o-caption`) define internal knobs rather than reaching for a global size step. Janus ships the mechanism and the defaults; consumers name the contexts.
- **Small public surface, deep derivation.** A handful of documented CSS custom properties act as "knobs." Everything else is internal and derived via `calc()` / `color-mix()` / etc.
- **Modern browsers only.** Target features that are Baseline 2024–2025: CSS layers, `:has()`, `color-mix()`, `light-dark()`, `1lh`, container queries, `popover`, anchor positioning, `commandfor`. No polyfills for these.
- **Framework-agnostic core.** The CSS pseudo-package has no coupling to Solid or any framework. The Solid pseudo-package wraps it as an optional convenience layer; the DOM pseudo-package provides a vanilla-JS path. Consumers fork whichever combination they need (see §3).

## 2. Non-goals

- Backwards compatibility with v1. The class names, prefixes, file layout, and component APIs are all up for redesign.
- A general-purpose typography or icon system. Consumers bring their own icons and font stack; Janus exposes the knobs to make them fit.
- Theme builders, plugin systems, or runtime style configuration beyond CSS custom properties.
- IE / legacy / no-JS form-validation polyfills.
- A combobox / typeahead component. (See §14.)
- Toast / notifications system. Not used in surveyed consumer apps; if needed later, `[popover]` + a queue pattern is straightforward to build outside Janus.

## 3. Pseudo-package layout

Janus v2 ships as a **fork-and-copy template**, not as published npm packages. Consumers clone the directories they want into their own repo and own the code from there — same model as shadcn/ui. This eliminates the semver and dependency-update overhead a real package would carry, at the cost of a structured update process (see §3.2).

### 3.1 The pseudo-packages

The library is organized into **pseudo-packages**: directories under `src/lib/` that are each independently consumable. A consumer copies only the directories they need. There is a single root `package.json` for development; pseudo-packages do not have their own.

```
src/lib/
  css/        Pure CSS. No JS. Default for static sites and frameworks
              that want to bring their own templating. Standalone.
  utils/      Framework-agnostic JS/TS utilities (data structures, type
              guards, DOM-free helpers). Depended on by dom/ and solid/.
  dom/        Vanilla-JS progressive-enhancement layer. Form validation,
              modal focus management, listbox keyboard nav. Reads
              prefixed data-* attributes (data-t-*, data-c-*) off DOM
              nodes — no framework required. See §4 for the prefix scheme.
              Depends on utils/.
  solid/      Thin Solid wrappers around css/ + dom/. Optional
              convenience layer. Holds Solid-specific utilities
              (signals, resources, etc.) internally in solid/utils/.
              Depends on css/, dom/, utils/.

plugins/      Vite plugins. Not pseudo-packaged as a unit — each file
              is independently copyable. Consumers pull whichever
              they need.
  vite-plugin-purgecss.ts        Removes unused class names from emitted CSS.
  vite-plugin-ssg.ts             Static-site generation for SSR routes.
  vite-plugin-janus-bundle.ts    SSR-driven handler purge for client bundle — §12.4.
```

Pseudo-packages are addressed via tsconfig path aliases (`~/lib/css/*`, `~/lib/dom/*`, etc., matching the existing repo convention). Consumers who fork a pseudo-package keep, rewrite, or rename the alias in their own tsconfig as they prefer.

Typical consumer profiles:

- **Static marketing site** — `src/lib/css/` only.
- **Vanilla-JS app with progressive enhancement** — `src/lib/css/` + `src/lib/utils/` + `src/lib/dom/`.
- **Solid SPA** — all four pseudo-packages.
- **Solid SSR app** — all four pseudo-packages **plus** `plugins/vite-plugin-janus-bundle.ts`. The plugin is required, not optional: it purges unreferenced handlers from the client bundle (see §12.4). `vite-plugin-purgecss.ts` for CSS pruning is independent and optional.

### 3.2 Update mechanism (agent-driven sync)

Without semver, consumers stay current via an **agent-driven sync**. The intended workflow is: a consumer tells their LLM agent "read the Janus repo's README and pull relevant changes for the pseudo-packages I've copied." Four artifacts make that workable.

**Per-pseudo-package `janus.json`** — a small manifest at each pseudo-package root:

```json
{
  "name": "dom",
  "summary": "Vanilla-JS progressive-enhancement layer.",
  "depends": ["utils"]
}
```

Declares dependencies on sibling pseudo-packages. Agents read this first when copying a pseudo-package to determine what else must come with it; the boundary lint rule (§3.3) reads `depends` to validate cross-package imports.

**Per-pseudo-package `CHANGELOG.md`** — dated entries with explicit `BREAKING` / `ADDED` / `CHANGED` labels. For breaking changes, a one-line "consumer action required" line describes the edit a forked copy needs (`rename --v-text-size to --v-font-size`, `c-button no longer reads --c-button-radius — set --o-input-box__radius instead`). The agent uses these lines to translate Janus changes into edits in the consumer's fork. The CHANGELOG is also the sync anchor — its tail in the consumer's fork marks the last point they synced from.

**Root `CHANGELOG.md`** — one line per release pointing at which pseudo-package changelogs to read. Lets an agent quickly scope what's relevant before drilling into per-package entries.

**Root `README.md` "Updating your fork" section** — short, prescriptive instructions written *for the consumer's agent*: for each pseudo-package the consumer has copied, diff their local `CHANGELOG.md` against the one in this repo to find new entries, apply each entry's "consumer action required" line (consulting source files in this repo where the action line is insufficient), then copy the updated `CHANGELOG.md` forward so the next sync starts from the new high-water mark. The intended consumer prompt is approximately "read the Janus README and do what it says for the pseudo-packages I've copied."

We deliberately use plain `README.md` per pseudo-package (and global) rather than `AGENTS.md` / `CLAUDE.md`: README is universal across agents and tools, and the global one is a single discoverable entry point. Consumers can mirror the relevant section into their own `CLAUDE.md` / `AGENTS.md` if their workflow benefits from autoload.

### 3.3 Enforcing pseudo-package boundaries

Cross-pseudo-package imports are enforced by a custom ESLint rule. The alternative — relying on convention — silently drifts: a contributor adds `css/` → `dom/` somewhere innocuous, and now `css/` is no longer forkable in isolation.

The rule:

1. Determines which pseudo-package each file belongs to (by path).
2. Parses imports and identifies any pointing at a different pseudo-package.
3. Rejects imports whose target pseudo-package isn't listed in the source pseudo-package's `janus.json` `depends`.

Runs in CI on every PR. Adding a new cross-pseudo-package dependency requires editing `depends` explicitly, which surfaces the choice for review. Plugins under `plugins/` aren't pseudo-packaged — they're individually copyable files and their cross-imports are reviewed by hand.

### 3.4 Per-pseudo-package configs

Each pseudo-package has its own `tsconfig.json` extending the root config, and (where applicable) its own `eslint.config.js` and `vitest.config.ts`. Each tightens or relaxes rules to match its constraints:

- `css/` has no TypeScript at all; only stylelint applies.
- `utils/` restricts available type libs (no `dom`) and the boundary lint rule (§3.3) keeps cross-package imports honest.
- `dom/` allows DOM types but the boundary rule forbids importing from `solid/`.
- `solid/` allows everything; this is the framework-coupled layer.

The boundary rule is the actual enforcement mechanism for cross-package import rules; tsconfig only gates *types* (e.g. no `dom` lib in `utils/`).
