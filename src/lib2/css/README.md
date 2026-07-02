# @janus/css

The Janus v2 CSS pseudo-package. Pure CSS — no JS, no framework coupling. This
is the default for static sites and for frameworks that bring their own
templating. Standalone (`depends: []`).

## Usage

Import the single entry point:

```css
@import '~/lib2/css/index.css';
```

It declares the `@layer` order and pulls in the reset, tokens, base element
styles, objects, components, variants, and tools.

## Layers (§4)

```
@layer reset, base, objects, components, variants, tools;
```

- **reset** — normalize defaults (box-sizing, margins, the transparent-border reserve).
- **base** — element-level typography, links, form defaults, code surfaces.
- **objects** (`o-`) — structural / layout primitives.
- **components** (`c-`) — opinionated widgets that compose objects.
- **variants** (`v-`) — scoped re-themes / re-modes (knob setters + mode flips).
- **tools** (`t-`) — surgical overrides that always win.
- _(unlayered)_ `p-` — the consuming project's own classes.

## Customizing

In order of preference (§5.3): override `--v-*` knobs, apply a `v-` variant,
apply a `t-` tool, or write your own CSS. The internal mixins (`v-spacing`,
`v-font-weight`, `v-font-step`, the breakpoint helpers) are authoring tools, not
a consumer API.

## Knobs

The primary knobs are documented on the site's **Composition › Variables** page,
which is generated from this package. Two anchors drive the radius cascade
(`--v-radius`, `--v-radius-min`); one lever drives spacing (`--v-spacing`); the
type scale is a fluid-capable Utopia scale that ships fixed.
