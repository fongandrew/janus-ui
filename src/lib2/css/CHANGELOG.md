# Changelog — `css`

## Unreleased

### Added

- Initial v2 CSS foundation (PLAN Phase 1):
  - `index.css` entry point declaring the `@layer` order
    (`reset, base, objects, components, variants, tools`).
  - `reset.css` — normalized defaults, including the transparent default border.
  - `tokens/` — every root knob (`--v-*`): the spacing bundle, the two radius
    anchors plus the always-on radius cascade, the color/border/ring system, the
    Utopia-style fluid-capable type scale (ships fixed at 15px) and font-weight
    stack, the shadow knobs, and the breakpoint/container query mixins.
  - `base.css` — element-level styles consuming the tokens.
