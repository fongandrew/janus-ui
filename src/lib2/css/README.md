# `css` — Janus v2 CSS foundation

The framework-free core of Janus v2. A single entry point (`index.css`) that
declares the cascade layers, normalizes defaults, establishes every root knob
(`--v-*`), and styles base elements. No JavaScript, no framework.

```css
@import '~/lib2/css/index.css';
```

## Layout

```
index.css        Single entry point. Declares @layer order; imports the rest.
reset.css        Normalize browser defaults (layer: reset).
tokens/          Root knobs (--v-*) and internal authoring mixins.
  spacing.css      --v-spacing bundle + the v-spacing mixin (+ --v-border-width).
  radius.css       --v-radius / --v-radius-min anchors + the always-on radius cascade.
  color.css        --v-bg/--v-fg/--v-link/--v-accent/--v-muted, borders, body bg, rings.
  typography.css   Utopia-style fluid-capable type scale (ships fixed) + weight stack.
  shadow.css       --v-shadow-outer / -inner / scroll-edge shadows.
  breakpoints.css  Internal v-breakpoint-* / v-container-* query mixins.
base.css         Element-level styles (layer: base). Consumes --v-* tokens.
```

## Customizing

Consumers theme Janus through, in order of preference:

1. **Variable overrides** — set `--v-*` knobs on `:root` or any scope.
2. **`v-` variant classes** — scoped re-themes (`v-colors-*`, `v-surface-*`).
3. **`t-` tools** — surgical per-element overrides.
4. **Plain CSS** — Janus is fork-and-copy; your rules sit in the same project.

Mixins (`@define-mixin`) are an **internal authoring tool**, not a consumer API
(§5.3). They expand at build time via `postcss-mixins`.

See [the design spec](../../../docs/v2/README.md) for the rationale.
