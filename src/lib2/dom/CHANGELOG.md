# Changelog — @janus/dom

## Unreleased

- `ADDED` Initial v2 DOM layer: `config` (`setup` / `jsAttr`), `compose-attrs`
  (`ca`, `only`, `concat`, `override`, `CombineAttrs`), `dispatch`
  (`registerBehavior` + document-level capture dispatcher), `mount` (scan +
  MutationObserver), the form engine (`registerValidator`, `addValidator`,
  `registerSubmitHandler`, `addSubmitHandler`, `setErrors`, `setFormError`,
  `isDirty`), the behavior handlers (`t-roving-focus`, `t-request-close`,
  `t-restore-focus`, `t-focus-trap`, `t-typeahead-filter`, `t-active-descendant`,
  `t-open-tab`, `t-kb-nav`, `t-empty`, `t-scroll-shadow`, `c-tabs__select`,
  `c-modal__close`, `c-modal__speed-bump`, the form markers), the component
  compositions (`tabs`, `modal`, `drawer`, `popover`, `menu`, `styled-select`),
  the public `index` entry, and the Pattern A `all` entry.
