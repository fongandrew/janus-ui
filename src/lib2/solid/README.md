# `solid` — Janus v2 Solid wrappers

The thinnest possible mapping from props to DOM plus the `data-js` behavior tokens
of `~/lib2/dom` (§13). Depends on `css`, `dom`, and `utils`.

```tsx
import { Button, LabelledInput, Input, Form, SubmitButton } from '~/lib2/solid';
```

## Design rules

1. **No prop-mod context.** Wrapper→leaf wiring uses a render-prop + hook pattern
   (`useLabelledInput`); cross-wrapper layering is explicit `ca(prev, …)` at the call
   site. Read-only contexts (e.g. `FormContext`, carrying an id) are fine.
2. **No component-side behavior wiring.** Components render `data-js` tokens; `dom/`'s
   `mount()` runs the behaviors. Components never push callbacks into a registry —
   validators/submit handlers attach via a single conditional `ref`.

## Boundary helpers (§13.1)

- `ariaize({ disabled, required, invalid })` — `disabled` → `aria-disabled`, never the
  native attribute. Every wrapper that takes `disabled` follows this.
- `attrs(...parts)` — space-join ARIA token strings.

## Labelling (§13.2)

`useLabelledInput()` returns deterministic IDs and flat prop objects. The layout
components take a render-prop `children` receiving `inputProps`. The error slot is
engine-written by default; passing `errorMessage` switches it to consumer-controlled
(adds the `data-external-error` marker).

## Catalogue

One file per component, named exports only — see `index.ts`. Form components mirror
the `~/lib2/dom/form` contract; `ModalForm` / `ModalSpeedBump` compose the modal-form
behaviors with all-on, opt-outable defaults.
