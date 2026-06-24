# Changelog — `css`

All notable changes to the `css` pseudo-package. Dated entries with
`BREAKING` / `ADDED` / `CHANGED` labels; breaking entries carry a one-line
"consumer action required" note for forked copies (see root README, §3.2).

## Unreleased

- `ADDED` — Initial v2 CSS foundation: `@layer` order (reset, base, objects,
  components, variants, tools), `reset.css`, the root token layer
  (`tokens/spacing.css`, `radius.css`, `color.css`, `typography.css`,
  `shadow.css`, `motion.css`, `breakpoints.css`), and `base.css`. The type
  scale is fluid (Utopia-style) with semantic font-size tokens.
- `ADDED` — All structural layout objects (`tokens/../objects/*`): box family
  (`o-box`, `o-text-box`, `o-input-box`, `o-square`), `o-dialog`, layout
  primitives (`o-stack`, `o-group`, `o-row`, `o-grid`, `o-container`,
  `o-split`, `o-centric`), `o-bar`, `o-segmented`, and the typography/menu
  objects (`o-caption`, `o-code`, `o-menu`, `o-menu-item`).
