# Changelog — @janus/css

All notable changes to the CSS pseudo-package. Dated entries with `BREAKING` /
`ADDED` / `CHANGED` labels; breaking entries carry a "consumer action required"
line (§3.2).

## Unreleased

- `ADDED` Initial v2 CSS layer: `@layer` order, reset, token layer
  (spacing, radius, color, typography, shadow, breakpoints), and base element
  styles. The type scale is a fluid-capable Utopia scale that ships fixed
  (`--v-font-size-min == --v-font-size-max`).
- `ADDED` Objects layer (§9): `o-box` (+ radius cascade), `o-input-box`,
  `o-square`, `o-dialog`, `o-stack`, `o-group`, `o-row`, `o-grid`,
  `o-container`, `o-split`, `o-centric`, `o-bar`, `o-segmented`, `o-prose`
  (+ `<hgroup>` and nested-list markers), `o-caption`, `o-code`, `o-menu`,
  `o-menu-item`.
- `ADDED` Variants layer (§7, §6.1): `v-colors-*` (tonal + surface-role),
  `v-surface-*`, `v-bleed`, `v-align-*`, `v-text-*`.
- `ADDED` Components layer (§10): `c-button`, `c-card`, `c-input`, `c-alert`,
  `c-checkbox`, `c-radio`, `c-toggle`, `c-select-native`, `c-tag`, `c-badge`,
  `c-avatar`, `c-spinner`, `c-skeleton`, `c-disclosure`, `c-tooltip`,
  `c-table`, `c-tabs`, `c-modal`, `c-drawer`, `c-popover`, `c-menu`,
  `c-styled-select`.
- `ADDED` Tools layer (§11): padding, flex/display, border/radius/shadow,
  alignment, and `t-truncate`. State mixins (`t-hover`, `t-focus-ring`).
- `CHANGED` `--v-border-color` recipe uses a valid `light-dark()` of two
  `color-mix()` branches over `--v-fg` (the `light-dark(<pct>, <pct>)` form is
  not valid CSS). `--v-border-dynamic-base` / `--v-border-dynamic-mix` removed.
