# Janus v2 — `css/`

The pure-CSS core of Janus. No JavaScript, no framework coupling — a consumer
can copy this directory alone and use it with any (or no) templating system.

## Entry point

Import `index.css`. It declares the cascade layers
(`reset, base, objects, components, variants, tools` — §4 of the design spec)
and pulls in everything else.

## Structure

- `reset.css` — normalize defaults (reset layer)
- `tokens/` — the `--v-*` root knobs and Janus-internal mixins (base layer)
- `base.css` — element-level defaults (base layer)
- `objects/` — `o-*` structural primitives (objects layer)
- `components/` — `c-*` visual chrome (components layer)
- `variants/` — `v-*` scoped re-themes / re-modes (variants layer)
- `tools/` — `t-*` surgical overrides (tools layer)

## Customization

In order of preference: override `--v-*` knobs (on `:root` or any scope),
apply `v-` variant classes, apply `t-` tools, or write your own CSS.
Mixins defined in `tokens/` are Janus-internal authoring tools, not a consumer
API. See `docs/v2/` for the full design spec.
