# Changelog — @janus/css

All notable changes to the CSS pseudo-package. Dated entries with `BREAKING` /
`ADDED` / `CHANGED` labels; breaking entries carry a "consumer action required"
line (§3.2).

## Unreleased

- `ADDED` Initial v2 CSS layer: `@layer` order, reset, token layer
  (spacing, radius, color, typography, shadow, breakpoints), and base element
  styles. The type scale is a fluid-capable Utopia scale that ships fixed
  (`--v-font-size-min == --v-font-size-max`).
