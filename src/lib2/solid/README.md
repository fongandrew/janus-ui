# `solid` — Janus v2 Solid wrappers

The thinnest possible mapping from props to DOM plus `dom/`'s `data-js`
behavior tokens. Two rules (§13):

1. **No prop-mod context.** No `(prev) => next` prop-transform context.
   Wrapper-to-leaf wiring is a render-prop + hook (`useLabelledInput`); layering
   a consumer's own ARIA contribution is an explicit `ca(p, ...)` merge at the
   call site. Ordinary read-only `createContext` for narrow state (`FormContext`)
   is fine.
2. **No component-side behavior wiring.** Behaviors activate via `data-js`
   tokens (`~/lib2/dom`). Components render the attribute; `dom/`'s `mount()`
   runs the registered behaviors. Components never push callbacks into a registry.

```tsx
import { Button } from '~/lib2/solid/button';
import { LabelledInput } from '~/lib2/solid/labelled-input';
import { Input } from '~/lib2/solid/input';

<LabelledInput label="Email">{(p) => <Input {...p} type="email" name="email" />}</LabelledInput>;
```

## Layout

```
aria.ts                ariaize() / attrs() -- the framework-boundary helpers (§13.1).
use-labelled-input.ts   The useLabelledInput hook (§13.2).
labelled-input.tsx      LabelledInput / LabelledInline / LabelledInputGroup.
variant.ts              variant/surface prop -> v-colors-*/v-surface-* class mapping.
combine-refs.ts         Combine a component's own ref need with a consumer-supplied ref.
anchor-position.ts      Shared CSS anchor-positioning helper (Tooltip, Popover).
form.tsx                Form, FormGroup, FormError, SubmitButton (§13.5).
modal-form.tsx          ModalForm, ModalSpeedBump (§13.6).

button.tsx, card.tsx, alert.tsx, input.tsx, textarea.tsx, checkbox.tsx,
radio.tsx, toggle.tsx, select-native.tsx, tag.tsx, badge.tsx, avatar.tsx,
spinner.tsx, skeleton.tsx, disclosure.tsx, tooltip.tsx
  Pure-CSS component wrappers (§13.7).

tabs.tsx, modal.tsx, drawer.tsx, popover.tsx, menu.tsx
  Browser-primitive component wrappers, built on `~/lib2/dom/components/*`.

styled-select.tsx       The one composite component with substantial wiring.
password.tsx            Input + show/hide toggle.
```

## Notes

- Component CSS classes match what's actually shipped in `~/lib2/css` (Phase 3),
  not necessarily the two-class sketch in the design doc's catalogue table --
  most components self-compose their object via a CSS mixin (e.g. `c-button`
  already includes `o-input-box`), so the wrapper emits one class. A few
  (`c-menu`, `c-tabs__select`) don't, and the wrapper emits both.
- `Checkbox` / `Radio` / `Toggle` render a real `<label>` wrapping the native
  input, so click-to-toggle needs no JS (a v1 simplification -- v1 used a
  `<div>` plus a `checkboxClick` callback).

See [the design spec](../../../docs/v2/07-solid-layer.md) for the rationale.
