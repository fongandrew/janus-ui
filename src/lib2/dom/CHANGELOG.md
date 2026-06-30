# Changelog — `dom`

## Unreleased

### Added

- Initial v2 DOM behavior layer (PLAN Phase 5):
  - Core dispatch primitives: `config.ts`, `compose-attrs.ts` (`ca`/`only`/
    `concat`/`override`/`CombineAttrs`), `dispatch.ts` (`registerBehavior` +
    the one-listener-per-event-type document dispatcher), `mount.ts`.
  - `multi-view.ts` + `document-setup.ts`, ported from v1's window/document
    abstraction, so the dispatcher's listeners install per-document rather
    than hardcoding the bare `window`/`document` globals.
  - The form engine (`form/validate.ts`, `form/submit.ts`): named + WeakMap
    validator and submit-handler registries, the touched-state machine,
    group validation, server-fed errors (`setErrors`/`setFormError`),
    disabled-state `FormData` filtering, and the full submit choreography.
  - The behavior catalogue under `handlers/`: `t-roving-focus`,
    `t-focus-trap`, `t-restore-focus`, `t-request-close` (+
    `onRequestClose`/`forceClose`), `t-typeahead-filter`,
    `t-active-descendant`, `t-open-tab`, `t-kb-nav`, `t-empty`,
    `t-scroll-shadow`, the form-engine marker modules, `c-tabs__select`, and
    `c-modal__speed-bump`'s full dirty-check orchestration.
  - Thin component compositions under `components/`: `tabs`, `modal`,
    `drawer`, `popover`, `menu`, `styled-select`.
  - `index.ts` (no handler side effects) and `all.ts` (Pattern A: every
    handler, for static-HTML / no-bundler consumers).
