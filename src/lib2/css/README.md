# `css` — Janus v2 CSS pseudo-package

Pure CSS. No JavaScript. The default and only hard dependency for a static
site or any framework that brings its own templating. Standalone and forkable
on its own (`depends: []`).

Import the single entry point:

```css
@import '~/lib2/css/index.css';
```

## Layout

```
index.css        Entry point. Declares the @layer order, then imports the rest.
reset.css        Normalizes browser defaults (layer: reset).
tokens/          Root knobs (--v-*) and internal authoring mixins.
  spacing.css      --v-spacing bundle, --v-input-height, hi-DPI density bump.
  radius.css       --v-radius, --v-radius-min, --v-border-width.
  color.css        --v-bg/--v-fg/--v-link/--v-accent/--v-muted, borders, rings.
  typography.css   Fluid (Utopia-style) type scale + semantic font-size tokens.
  shadow.css       --v-shadow-outer/-inner and scroll-edge shadows.
  motion.css       --v-duration / --v-ease (+ prefers-reduced-motion).
  breakpoints.css  Internal v-breakpoint-* / v-container-* query mixins.
base.css         Element-level defaults (layer: base). Consumes --v-* tokens.
```

## Customizing

Consumers theme Janus through, in order of preference (see §5.3):

1. **`--v-*` variable overrides** — on `:root` or any scope.
2. **`v-*` variant classes** — scoped re-themes (colors, surfaces, radius presets).
3. **`t-*` tools** — surgical per-element overrides.
4. **Plain CSS** — your own rules; Janus is fork-and-copy, so they sit alongside.

The mixins under `tokens/` (e.g. `v-spacing`, `v-fluid`) are **internal authoring
tools, not a consumer API** (§5.3). They expand at build time via `postcss-mixins`.
