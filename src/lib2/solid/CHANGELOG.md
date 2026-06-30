# Changelog — `solid`

## Unreleased

### Added

- Initial v2 Solid layer (PLAN Phase 6):
  - Framework-boundary helpers: `aria.ts` (`ariaize`/`attrs`),
    `use-labelled-input.ts` + `labelled-input.tsx` (`LabelledInput`,
    `LabelledInline`, `LabelledInputGroup`).
  - The full component catalogue (§13.7): pure-CSS wrappers (Button,
    Card family, Alert, Input, Textarea, Checkbox, Radio/RadioGroup,
    Toggle, SelectNative, Tag, Badge, Avatar, Spinner, Skeleton,
    Disclosure, Tooltip), browser-primitive wrappers (Tabs family, Modal,
    Drawer, Popover, Menu/MenuItem) built directly on `dom/components/*`,
    and the composite StyledSelect.
  - Form wrappers (§13.5–13.6): Form, FormGroup, FormError, SubmitButton,
    ModalForm, ModalSpeedBump.
  - Password (Input + show/hide toggle).
  - Shared helpers: `variant.ts`, `combine-refs.ts`, `anchor-position.ts`.
- Not yet ported: a dedicated `solid/test-app/` E2E harness and the full
  per-component E2E suite from PLAN 6.T (hydration, keyboard nav,
  form-validation flows) -- the component implementations are covered by
  unit tests for the framework-boundary helpers; broader interactive
  coverage is left for a follow-up pass.
