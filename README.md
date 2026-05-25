# Janus UI v2

A CSS-first UI design system with layered SolidJS integration.

See [docs/v2/README.md](docs/v2/README.md) for the full design spec and [docs/v2/PLAN.md](docs/v2/PLAN.md) for the implementation plan.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run test       # unit tests
npm run test:e2e   # E2E tests (Chromium)
```

## Architecture

Janus v2 is organized as four pseudo-packages under `src/lib/`:

| Package | Purpose | Dependencies |
|---|---|---|
| `css/` | Tokens, reset, objects, components, variants, tools — pure CSS | none |
| `utils/` | Framework-agnostic JS/TS utilities (no DOM) | none |
| `dom/` | Declarative behavior system via `data-js` attributes | `utils/` |
| `solid/` | Thin SolidJS component wrappers | `css/`, `dom/`, `utils/` |

Each layer can be consumed independently. A plain HTML page needs only `css/` + optionally `dom/`. A SolidJS app uses all four.

## Styling conventions

CSS classes use BEM with prefixes: `t-` (tools), `o-` (objects), `c-` (components), `v-` (variants), `p-` (project-specific).

Custom properties use `--v-` for root knobs, `--o-` for object-scoped, `--c-` for component-scoped.
