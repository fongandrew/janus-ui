# Janus v2 — The DOM Layer

Part 6 of the [Janus v2 design spec](./README.md). Covers the framework-agnostic JS layer under `src/lib/dom`.

## 12. The JS layer (`src/lib/dom`)

The JS layer is a toolkit of small, composable behaviors that attach to DOM elements via a single canonical attribute — `data-js` by default, configurable (§12.2.2). Components ship as thin compositions of these behaviors. Consumers can use the same toolkit directly to build custom controls (toolbars, command palettes, navigable lists) without leaving the Janus model.

Two structural pieces underpin everything in this layer:

- **`ca` — the attribute composition helper** (§12.2.1). One way to merge prop objects (data attributes, ARIA, class, etc.) onto an element with explicit conflict semantics. Replaces v1's `callbackAttrs` plus any ad-hoc spread merging.
- **Behaviors** (§12.2.2). Each behavior is a module under `src/lib/dom/handlers/`; the filename is the behavior name. A behavior registers a manifest declaring which DOM events it handles and an optional `mount` hook for setup. Elements opt in by listing one or more behavior names in `data-js="..."`. A single document-level capture-phase listener per event type dispatches to the right behaviors by reading one attribute per ancestor.

Application areas:

- **Form engine** (§12.1) — substantial coherent system for validation and submission. Janus's biggest JS investment, because forms are the most JS-heavy real-world need (285+ call sites in surveyed v1 consumers). Adopts the same `data-js` opt-in convention but keeps its own bespoke dispatcher; the form lifecycle — discover owning form, walk members, ordered validator chain, touched-state machine — doesn't fit the per-event-per-ancestor shape cleanly.
- **Behavior utilities** (§12.2.4) — small composable bits: roving focus, request-close, typeahead, active descendant, etc.
- **Bundling** (§12.4) — for SSR apps, a build step text-scans the SSR output for `data-js` values and generates a client entry that imports only the matching modules.

### 12.1 Form engine

The engine is **one document-level dispatcher plus two registries**. No per-element listeners. No per-render ID generation. Validators register either once at module load (named) or by element identity (closure, via WeakMap). It keeps its own form-specific dispatcher (rather than going through the general one in §12.2.3) because the form lifecycle — discover owning form, walk members, ordered validator chain, touched-state machine — doesn't fit the simple per-event callback shape cleanly. The behaviors it ships (`t-validate`, `t-submit`, etc.) follow the same `data-js` opt-in and filename-as-manifest convention as everything else, so the bundling story is unified.

**Activation.** A form opts in by listing the behavior:

```html
<form data-js="t-validate">
  ...
</form>
```

Field-level constraints use native HTML5 attributes — `required`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `type=email/url/...`. The engine reads `element.validity` and uses `element.validationMessage` as the default error text. No Janus attribute mirrors these.

**Two registries.**

```ts
// 1. Named validators — registered once at module load. Lives for page lifetime.
import { registerValidator } from '~/lib/dom/form';

registerValidator('match-password', (el: HTMLInputElement) => {
  const target = el.form?.elements.namedItem('password') as HTMLInputElement | null;
  return target && el.value !== target.value ? 'Passwords must match' : null;
});
```

```html
<input type="password" required data-validators="match-password">
```

`data-validators` is a sidecar attribute on individual inputs — a space-separated list of named validators to run for this field. Multiple validators per element compose by listing them. (Inputs participating in HTML5-only validation need nothing; the form-level `data-js="t-validate"` opt-in walks all members.)

```ts
// 2. Inline closures — stored in a WeakMap keyed by element identity.
//    No IDs. Element GC cleans up automatically; the returned cleanup() is
//    only needed if you want to remove a validator while the element is alive.
import { addValidator } from '~/lib/dom/form';

const cleanup = addValidator(inputEl, (el) => {
  if (el.value.includes('bob')) return 'No Bobs allowed';
  return null;
});
```

**Dispatcher.** A single set of document-level capture-mode listeners (`submit`, `change`, `input`) is installed once at `mount()` time. On each event the dispatcher:

1. Finds the owning `<form data-js~="t-validate">` (no-op if absent).
2. Walks form members.
3. For each element runs, in order: HTML5 native validity check → named validators from `data-validators` → inline validators from the WeakMap.
4. First non-null return wins. The engine writes the message into the element's error destination.

**Error destination.** Marker behavior on any element receiving error text:

```html
<input id="email" aria-describedby="email-err" required>
<span id="email-err" data-js="t-validate-error"></span>
```

The engine walks the input's `aria-describedby`, finds the first element carrying `t-validate-error`, writes the message there and toggles `role="alert"`. The screen-reader wiring is the same DOM relationship the engine uses — no separate back-pointer attribute.

**Group validation.**

```html
<fieldset data-js="t-validate-group">
  <input name="start-date" type="date" required>
  <input name="end-date" type="date" required data-validators="after-start-date">
</fieldset>
```

When a child of a `t-validate-group` fieldset changes, every other touched child re-validates. Touched-only is the always-on default.

**Touch tracking.** An element is "touched" after its first `change` event or after the form has submitted. Untouched fields don't show errors when *other* fields change (avoids premature red text). After a field shows its first error, the engine switches to `input`-event validation on that field for live feedback while the user fixes it.

**Server-fed errors.**

```ts
import { setErrors } from '~/lib/dom/form';
setErrors(formEl, { email: 'Already taken', username: 'Reserved' });
```

Errors keyed by field `name`. Each persists until the user changes that field, at which point the engine clears it and resumes normal validation. Replaces v1's `EXTERNAL_ERROR_ATTR` machinery with one function call.

**Submit handlers — same registry + WeakMap pattern as validators.**

```ts
import { registerSubmitHandler, addSubmitHandler, type SubmitHandler } from '~/lib/dom/form';

// 1. Named — registered once at module load, referenced from markup
registerSubmitHandler('signup', async (data, form) => {
  const res = await fetch('/api/signup', { method: 'POST', body: data });
  if (res.status === 409) return { ok: false, fieldErrors: { email: 'Already in use' } };
  if (!res.ok) return { ok: false, formError: 'Something went wrong' };
  return { ok: true };
});
```

```html
<form data-js="t-validate t-submit" data-submit-handler="signup">
  ...
</form>
```

```ts
// 2. Closures — Solid <Form onSubmit={fn}> uses a ref to stash in WeakMap
const cleanup = addSubmitHandler(formEl, async (data, form) => { /* ... */ });
```

The result type:

```ts
type SubmitResult =
  | { ok: true; reset?: boolean }    // reset defaults to true
  | { ok: false; fieldErrors?: Record<string, string>; formError?: string };

type SubmitHandler = (data: FormData, form: HTMLFormElement) =>
  | SubmitResult
  | Promise<SubmitResult>;
```

The submit dispatcher (same document-level listener set) owns all the choreography: `preventDefault`, run validation, build the `FormData` (see "Disabled-state filtering" below), dispatch to handler if valid, call `setErrors` / `setFormError` on returned errors, reset on `{ ok: true }` unless `reset: false`. The consumer's handler is just business logic.

**Disabled-state filtering.** Before constructing `FormData`, the dispatcher walks the form's elements and excludes any element with `aria-disabled="true"` from submission — same outcome as if the native `disabled` attribute were set, but without removing the element from tab order or screen-reader output. This is the runtime contract that backs the Solid layer's `ariaize()` rule (§13.1): `<Input disabled />` always renders `aria-disabled`, never the native `disabled` attribute, and the form engine guarantees those fields don't reach the handler. Validators also skip `aria-disabled` elements during the per-field check — a disabled field with a `required` violation should not block submit.

A form can use `t-submit` (or `addSubmitHandler`) without `t-validate` (no validation, just async submit choreography) or vice versa.

**Modal-form behaviors.** Three behaviors, dispatched by the same document-level listeners. No ref, no per-form setup, no callback registration.

| Behavior | Effect |
|---|---|
| `t-reset-on-close` | When the ancestor `<dialog>` fires `close` (or `[popover]` fires `toggle` → `closed`), reset the form. A document-level capture-phase listener handles non-bubbling `close`. |
| `t-close-on-success` | On `{ ok: true }` from the submit handler, close the ancestor `<dialog>` / `[popover]` after reset. Dispatcher branch. |
| `c-modal__speed-bump` | Marks a nested `<dialog>` as the "are you sure?" prompt for its parent modal. The speed-bump module — not the parent modal — owns the orchestration. See below. |

**Speed bump for dirty close.** The consumer renders a nested `<dialog>` carrying the `c-modal__speed-bump` behavior inside the modal. Markup:

```html
<dialog class="c-modal">
  <form
    data-js="t-validate t-submit t-reset-on-close t-close-on-success"
    data-submit-handler="signup"
  >
    ...
  </form>
  <dialog class="c-modal" data-js="c-modal__speed-bump">
    <form method="dialog">
      <p>You have unsaved changes.</p>
      <button value="cancel">Keep editing</button>
      <button value="discard" class="c-button v-colors-danger">Discard</button>
    </form>
  </dialog>
</dialog>
```

Orchestration lives entirely inside `handlers/c-modal__speed-bump.ts` — `c-modal`'s code knows nothing about speed bumps. The module's `mount` handler:

1. Walks up from the speed-bump element to its ancestor `<dialog>` (the parent modal).
2. Registers a `requestClose` hook on the parent modal via the public `onRequestClose(parentModal, fn)` helper (exposed by `handlers/t-request-close.ts`). The hook: walk the parent modal's `<form data-js~="t-validate">` descendants; if any returns `true` from `isDirty(form)`, call `parentModal.querySelector('[data-js~="c-modal__speed-bump"]').showModal()` and return `false` (cancel the parent close). Otherwise return `true` (allow the close).
3. Adds a `close` listener on the speed-bump element itself: if `returnValue === 'discard'`, call `forceClose(parentModal)` — a sibling helper that closes the dialog while bypassing the `requestClose` chain, so the hook from step 2 doesn't re-fire and re-open the speed bump.

Two small additions to the public API to make this work:

- `onRequestClose(el: Element, fn: () => boolean): () => void` — exposed by `handlers/t-request-close.ts`. Lets any handler subscribe to the same hook chain the markup behavior uses. Returns cleanup.
- `forceClose(dialog: HTMLDialogElement): void` — closes the dialog without firing `requestClose`. Equivalent to `dialog.close()` plus a marker the dispatcher reads to skip its chain on this turn.

Net effect: the modal stays generic, and consumers can build other "are you sure?" patterns (form abandonment, destructive-action confirmations) by writing their own behavior modules on the same shape.

**Public API summary:**

```ts
registerValidator(name: string, fn: Validator): void;                    // module-load
addValidator(el: Element, fn: Validator): () => void;                    // WeakMap
registerSubmitHandler(name: string, fn: SubmitHandler): void;            // module-load
addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void;  // WeakMap
setErrors(form: HTMLFormElement, errors: Record<string, string>): void;  // server-fed
setFormError(form: HTMLFormElement, msg: string): void;                  // form-wide
isDirty(form: HTMLFormElement): boolean;                                 // used by speed bump
```

The Solid wrapper sits on top. The DOM layer alone is sufficient for static HTML + progressive enhancement: a `<form data-js="t-validate">` with HTML5 attributes works without any JS-layer prop wrapping.

### 12.2 Behavior utilities

Three pieces work together: `ca` for composing element attributes (§12.2.1), behavior modules that declare what they do via a manifest (§12.2.2), and a single dispatcher tying them together (§12.2.3). All modules live under `src/lib/dom/handlers/` and follow the filename-as-manifest convention so the SSR purge step (§12.4) can include exactly the modules referenced by the rendered output.

#### 12.2.1 `ca` — attribute composition

`ca(...sources)` merges objects of HTML attributes into one object suitable for spreading onto a JSX element (or applying to a raw DOM node). It is the canonical way to combine prop objects produced by handler helpers with the consumer's own props.

```tsx
<button {...ca(openTab(panelId), props)} />
```

Default conflict resolution:

| Attribute pattern | Behavior on duplicate |
|---|---|
| `id`, `role` | throw |
| `data-js` | concat (space-joined) |
| `data-*` | throw |
| `class`, `aria-labelledby`, `aria-describedby`, `style` | concat (space- or `;`-joined as appropriate) |
| everything else | throw |

Defaults are conservative. `data-js` concats because composing multiple behaviors on one element is the common case (§12.2.2). Other data attributes default to `throw` so accidental double-writes surface loudly instead of letting the last writer silently win — sidecar params (`data-validators`, `data-submit-handler`, etc.) interpreted per-behavior rarely round-trip through space-joined values cleanly.

Producers can pin per-attribute behavior using wrappers, irrespective of the global defaults:

```ts
import { only, concat, override } from '~/lib/dom/compose-attrs';

export function openTab(panelId: string) {
  return {
    role: 'tab',
    'aria-labelledby': concat(panelId),
    'data-js': concat('t-open-tab'),
    'data-target': only(panelId),
  };
}
```

- `only(x)` — must be the sole contribution for this attribute. A second `only(x)` with the same value is idempotent; any other wrapper, any other value, throws.
- `concat(x)` — joins with other `concat` contributions. Throws if combined with `only` or `override`.
- `override(x)` — wins regardless of source order. Two `override`s throw.

**Any wrapper mismatch throws.** Same-wrapper-same-value is the only no-op case. The default rules in the table above only apply when both sides are unwrapped strings.

`ca` itself is created via a factory so consumers can supply a different default map for their own attribute namespaces. The library exports a configured default; most consumers never need to construct their own.

```ts
import { CombineAttrs } from '~/lib/dom/compose-attrs';

export const ca = new CombineAttrs({
  id: 'throw',
  role: 'throw',
  'data-js': 'concat',
  'data-*': 'throw',
  class: 'concat',
  'aria-labelledby': 'concat',
  'aria-describedby': 'concat',
  style: 'concat',
  '...': 'throw',
});
```

`ca` is framework-agnostic. JSX consumers spread the result; for hand-built DOM, a sibling `apply(el, attrs)` helper iterates and calls `setAttribute` / property assignment as appropriate.

#### 12.2.2 Behaviors

A behavior is a module under `src/lib/dom/handlers/`. The filename is the behavior name. The module registers a manifest declaring which DOM events it handles plus an optional `mount` hook for setup. Elements opt in by listing one or more behavior names in the canonical `data-js` attribute:

```html
<div role="toolbar" data-js="t-roving-focus" aria-orientation="horizontal">
  <button class="c-button">Cut</button>
  ...
</div>

<dialog data-js="c-modal t-request-close">...</dialog>

<button data-js="t-open-tab" data-target="panel-3">Open</button>
```

**Naming convention.** Behavior names mirror the BEM prefix scheme used for CSS classes (§16):

- `t-{name}` — **toolkit** behavior. Library-provided, behavior-driven, single-purpose. Examples: `t-roving-focus`, `t-request-close`, `t-open-tab`, `t-track-event`.
- `c-{component}` / `c-{component}__{action}` — **component** behavior. Component-internal, namespaced by component, optionally with a BEM-style `__action` suffix. Examples: `c-modal`, `c-tabs`, `c-modal__close`, `c-styled-select__commit`.
- `p-{...}` — reserved for project-level behaviors consumers declare in their own forks, by analogy with the `p-` CSS prefix.

The prefix is the dispatch sigil — it tells the purge scanner (§12.4) which value tokens to map back to handler files. The filename matches the name byte-for-byte: `handlers/t-roving-focus.ts`, `handlers/c-modal__close.ts`. All characters used here are valid POSIX and Windows filenames and supported by every bundler Janus targets (Vite, Rollup, esbuild); no escape or substitution is needed.

**Module shape.** Each module does two things:

1. **Registers a manifest** at top level via `registerBehavior`. Importing the module is a side effect that mounts the behavior into the dispatcher. If never imported, tree-shaking removes it.
2. **Exports producer functions** that return prop objects (using the `ca`-friendly wrappers) for consumers to spread onto markup.

```ts
// src/lib/dom/handlers/t-open-tab.ts — event-only, smallest case
import { registerBehavior } from '~/lib/dom/dispatch';
import { only, concat } from '~/lib/dom/compose-attrs';

registerBehavior('t-open-tab', {
  click(el, ev) {
    const panelId = el.getAttribute('data-target');
    if (panelId) document.getElementById(panelId)?.focus();
  },
});

export function openTab(panelId: string) {
  return {
    role: 'tab',
    'aria-labelledby': concat(panelId),
    'data-js': concat('t-open-tab'),
    'data-target': only(panelId),
  };
}
```

```ts
// src/lib/dom/handlers/t-roving-focus.ts — mount + event hooks
import { registerBehavior } from '~/lib/dom/dispatch';
import { concat, only } from '~/lib/dom/compose-attrs';

registerBehavior('t-roving-focus', {
  mount(el)       { /* demote non-active items to tabindex="-1" */ },
  keydown(el, ev) { /* arrow / Home / End handling */ },
});

export function rovingFocus(opts: { axis: 'horizontal' | 'vertical' | 'both' }) {
  return {
    'data-js': concat('t-roving-focus'),
    'aria-orientation': only(opts.axis),
  };
}
```

The manifest declares only the lifecycle hooks the behavior needs. Most behaviors are event-only; a few also need mount-time setup. Use a `mount` hook when the behavior needs to do something *before* the first user event — initial `tabindex` demotion, focus-anchor recording, subtree wiring. Otherwise leave it out.

New event types are added by registering behaviors that include them in the manifest; the dispatcher installs the document-level listener lazily on first registration for that event type (§12.2.3).

**Multiple behaviors per element.** The `data-js` value is space-separated; behaviors compose by listing both names. When two behaviors register for the same event, both fire in source order:

```html
<button data-js="t-track-event c-modal__close">Save</button>
```

**Per-call parameters.** When a behavior needs an element-specific parameter (a target id, a label, the active tab index), the producer emits an additional attribute on the same element — no inline syntax in the `data-js` value. Use a native attribute when one fits naturally (`aria-orientation` for axis, `aria-labelledby` / `for` for references); otherwise use a `data-*` attribute the behavior documents. The dispatcher only reads `data-js`; sidecar attributes are invisible to the SSR purge and free-named per behavior.

**Configuration.** The canonical attribute name and other library-wide settings come from `~/lib/dom/config`. The default is `data-js`. Consumers whose markup namespace would conflict can override before `mount()`:

```ts
import { setup } from '~/lib/dom';
setup({ attr: 'data-foo' });  // before mount()
```

Producers emit the configured attribute name by importing the constant rather than hardcoding the string, so an override propagates uniformly across producers and dispatcher.

**Bundling.** In the SPA path, normal tree-shaking handles behaviors: if nothing in the app imports the producer (or the module side-effect), the module never enters the bundle. In the SSR path, the producer isn't called on the client (HTML already carries the attribute), so the bundling step (§12.4) generates a client entry that imports each referenced module purely for its registration side effect.

#### 12.2.3 Dispatch model

The library installs exactly one document-level capture-phase listener per event type that some registered behavior declares in its manifest. There is no per-element wiring.

On each event, the dispatcher walks from the event target upward (standard delegation). At each ancestor it does a single `getAttribute('data-js')`, splits the value on whitespace, and for each token looks up the registered manifest and invokes its handler for the current event type if one is registered. Tokens with no registered behavior, or behaviors that don't declare this event type, are skipped.

Per-ancestor cost is `O(1)` attribute reads plus `O(tokens-on-this-element)` Map lookups. In practice the token count is at most a small handful. Crucially, the cost does **not** scale with the number of behaviors registered globally — only with what this specific element opts into.

**Mount.** The synthetic `mount` event has no document-level listener; the runtime invokes `mount` handlers directly. It fires:

- Once at startup when `mount()` walks the DOM and dispatches `mount` to every element whose `data-js` tokens include a behavior with a `mount` hook.
- Again on `MutationObserver` discovery as new nodes are added.

**Multi-behavior** is natural via space-separated tokens. Handlers run in declared (source) order. There is no `stopImmediatePropagation`-style cross-handler abort — if you need to suppress sibling handlers, restructure the markup so they aren't co-located. A global stop is too easy to misuse for the handful of cases where it would help.

`mount()` is the entry point that primes the system at startup: it walks the DOM once, fires the synthetic `mount` event where needed, and installs the `MutationObserver`. After mount, the document-level listeners handle the rest.

This replaces v1's per-render callback ID generation and the global callback registry: behavior names are stable strings tied to module filenames; no IDs are minted at runtime.

#### 12.2.4 Behavior catalogue

Each utility ships as a handler module under `src/lib/dom/handlers/` with one or more exported producers. Imperative entry points are exported alongside for consumers who prefer wiring elements directly.

| Behavior | Producers (sketch) | Purpose |
|---|---|---|
| `t-roving-focus` | `rovingFocus({ axis, wrap?, homeEnd? })` | Single-tabindex group with arrow-key navigation. `axis: 'horizontal' \| 'vertical' \| 'both'`. Optional wrap-around and Home/End jump-to-edge. Powers tabs, menus, toolbars, listboxes. Reads `aria-orientation` for axis. **Markup ships items at default tab order (no `tabindex="-1"` by hand); the `mount` hook demotes non-active items. No-JS fallback: tab through items individually — degraded but functional.** |
| `t-focus-trap` | `focusTrap()` | Constrains Tab/Shift+Tab to descendants. Only needed for non-`<dialog>` overlays — native `<dialog>` traps focus for free. |
| `t-restore-focus` | `restoreFocus()` | Records the active element before `el` opens; restores it on close. Pairs with popovers / menus. |
| `t-request-close` | `requestClose({ onRequestClose? })` | Intercepts ESC, outside-click, and `commandfor close` invocations. Callback returns a boolean to allow / cancel (e.g. "discard unsaved changes?"). Also exports `onRequestClose(el, fn)` (subscribe a programmatic hook to the same chain) and `forceClose(dialog)` (close while bypassing the chain — the recursion guard the speed bump in §12.1 relies on). |
| `t-typeahead-filter` | `typeaheadFilter({ match })` | Buffers keystrokes (~500ms window) and calls `match(buffer)` to find / focus matching items. |
| `t-active-descendant` | `activeDescendant({ items, onActive })` | Manages `aria-activedescendant` based on arrow keys without moving DOM focus. Used by listbox / combobox patterns. |
| `t-open-tab` | `openTab(panelId)` | Smallest illustrative case — focuses a target element on click; reads target id from sibling `data-target`. |
| `t-kb-nav` | *(page-level, no producer)* | Sets the **presence flag** `body[data-v-kb-nav]` (no value) on first Tab / arrow-key, removes it on first mousedown. This single flag drives CSS conditionals via `[data-v-kb-nav]` / `:not([data-v-kb-nav])`: menu item hover highlights in mouse mode, active-descendant highlights in keyboard mode. Registered once at mount time. |
| `t-empty` | *(auto-observing)* | Sets `data-t-empty` attribute on containers whose children render no visible content (empty text, no element children). Drives CSS empty-collapse rules: `.c-alert:has([data-t-empty]) { display: none }`, `.c-error-message:empty { display: none }`. Prevents dead vertical space in forms. |
| `t-scroll-shadow` | `scrollShadow()` | Observes scroll position of an element. Sets `data-scroll-top` when scrolled to the top edge, `data-scroll-bottom` when at the bottom. CSS uses these to show/hide `--v-shadow-inner-top` / `--v-shadow-inner-bottom`. Used by modal/drawer scrollable content. |

**Graceful degradation principle.** Markup must remain functional with JS disabled. Behaviors *enhance* the no-JS baseline; they don't establish it. Specifically: never render no-JS-unreachable state into the initial HTML (e.g. don't ship `tabindex="-1"` on items that the JS arrow-key handler is supposed to reach). Mount-time JS demotes / rewires as needed.

**Declarative usage example.**

```html
<div role="toolbar" data-js="t-roving-focus" aria-orientation="horizontal">
  <button class="c-button">Cut</button>
  <button class="c-button">Copy</button>
  <button class="c-button">Paste</button>
</div>
```

```ts
import { mount } from '~/lib/dom'
mount() // initial scan + MutationObserver wiring; then steady-state
```

Producer-driven usage (JSX):

```tsx
import { rovingFocus } from '~/lib/dom/handlers/t-roving-focus';

<div {...ca(rovingFocus({ axis: 'horizontal' }), { role: 'toolbar' })}>
  <button class="c-button">Cut</button>
  ...
</div>
```

### 12.3 How components compose utilities

Janus's own components are thin wrappers over the toolkit:

```
c-tabs          = t-roving-focus (horizontal) + aria-selected sync
c-modal         = native <dialog> + t-request-close
c-drawer        = native <dialog> + o-dialog chrome + edge-anchored CSS + t-request-close
c-popover       = [popover] + t-request-close
c-menu          = [popover] + t-roving-focus (vertical) + t-typeahead-filter
c-styled-select = [popover] + t-roving-focus + t-active-descendant
                  + t-typeahead-filter + form engine
```

A consumer building a custom toolbar, command palette, or any list-with-keyboard-nav reaches for the same producers directly. There is no "private" JS in Janus components that consumers can't replicate.

### 12.4 Bundling patterns

`src/lib/dom` ships two ways to get handlers into the client. Pick one per app.

The default entry (`~/lib/dom`) exports the API surface (`mount`, `setup`, `ca`, `registerBehavior`, `registerValidator`, `registerSubmitHandler`, etc.) and **does not** side-effect-import any handlers. Pulling handlers in is a separate step, satisfied by exactly one of the patterns below.

**Pattern A — static HTML + everything bundle.** Side-effect-import the catchall `~/lib/dom/all` entry, which pulls in every handler module. The dispatcher routes events through registered behaviors as usual. No build tooling required.

```html
<script type="module">
  import '~/lib/dom/all';
  import { mount } from '~/lib/dom';
  mount();
</script>
```

Right for static sites, CMS pages, demos, prototypes — anywhere a bundler isn't in play. Ships more JS than strictly needed, but the base bundle is small enough that this is rarely a concern.

**Pattern B — SSR-driven purge.** For apps with separate SSR and client builds, `plugins/vite-plugin-janus-bundle.ts` produces a per-app client bundle containing exactly the handler modules referenced by the SSR pass.

The mechanism is a text scan of the SSR build's emitted output — PurgeCSS-style — rather than module-graph introspection. One scan covers everything:

1. Run the SSR build first.
2. **Scan `data-js` attribute values.** Match every literal `data-js="..."` (or the configured attribute, if overridden via `setup`) and split the value on whitespace. Each token is a behavior name with a `t-`, `c-`, or `p-` prefix.
3. Look each token up against `src/lib/dom/handlers/`. The **filename-as-manifest** convention from §12.2.2 is the only mapping: token `t-roving-focus` → file `handlers/t-roving-focus.ts`.
4. Generate a client entry that statically imports only the matching modules:

   ```ts
   // generated: virtual:janus-handlers (or written to a real file)
   import '~/lib/dom/handlers/t-roving-focus';
   import '~/lib/dom/handlers/t-request-close';
   import '~/lib/dom/handlers/t-validate';
   import '~/lib/dom/handlers/c-modal__close';
   import '~/lib/dom/handlers/t-open-tab';
   // ...exactly the modules referenced in the SSR output
   ```

5. The client build consumes that entry; normal tree-shaking removes everything not referenced — including unused producers from imported files.

Each handler module's top-level `registerBehavior` call mounts the dispatcher entry as a side effect of being imported. The generated entry is just imports, no function calls.

```ts
// client entry
import 'virtual:janus-handlers';   // Pattern B's equivalent of ~/lib/dom/all
import { mount } from '~/lib/dom';
mount();
```

Sidecar attributes (`data-target`, `data-validators`, `data-submit-handler`, etc.) are invisible to this scan — they carry behavior parameters, not behavior identifiers, and don't map to handler modules.

**Why text scanning instead of module-graph introspection.** Both approaches encode "what the SSR build references." Text scanning has two practical advantages:

- **Bundler-portable.** Scanning a directory of emitted files is something any build pipeline can do — Vite isn't structurally required (though we ship a Vite plugin first). The same purge step can be ported to Rollup / esbuild / Turbopack / a standalone CLI without rewriting.
- **Robust to indirection.** A producer like `openTab(id)` emits literal `data-js` tokens into the rendered HTML regardless of where the producer was imported from. Text scanning picks it up no matter the source-side topology; module-graph introspection requires every behavior-using path to import the right thing.

The cost is one hard rule: **behavior names always appear as literal strings in source code.** No `data-js="t-${dynamic}"` construction; no `'t-' + name` concatenation. Producers that need dynamic dispatch should pick from a small allowlist of literals.

**Dev mode.** `vite dev` doesn't run the SSR-build step against emitted files. Default: treat dev as Pattern A — ship the everything bundle. Simple, fast HMR, no surprise dev-vs-prod behavior divergence (only bundle composition differs, which is a prod-build concern). For teams that want strict parity, a second plugin mode walks Vite's `server.moduleGraph` on the SSR side and regenerates the virtual entry from there; invalidate on SSR module updates and Vite's HMR cascades the client.

**Form-engine inclusion.** The dispatcher and `registerValidator` / `registerSubmitHandler` APIs sit under `~/lib/dom/form`. The form engine's behaviors (`t-validate`, `t-submit`, `t-validate-group`, `t-validate-error`, `t-reset-on-close`, `t-close-on-success`) are filename-as-manifest entries under `handlers/` — they land in the client iff some SSR-time code path emits the matching `data-js` token, exactly like any other behavior (§12.2.2). Validator and submit-handler bodies live in consumer code and tree-shake by normal means; the plugin doesn't enumerate handler names.

**Multi-bundle / lazy-loading direction.** The text-scan mechanism extends naturally; only the codegen that turns the scan results into the generated entry changes.

- **Per-route splitting.** When the SSR build emits one entry chunk per route, the plugin scans per chunk and generates one client entry per route. Behaviors used only on `/settings` aren't bundled into `/marketing`. Behaviors common to multiple routes hoist via Rollup's `manualChunks` — the same problem-and-solution as any other code split.
- **Per-behavior dynamic loading.** Generate `loaders[name] = () => import('...')` instead of static imports, keyed on the behavior name. The dispatcher resolves and registers on first match. Wins when individual handlers are large (`c-styled-select` is the obvious candidate) or rarely used; loses first-interaction latency on cheap handlers. A `lazy: ['c-styled-select']` allowlist makes the choice granular without forcing it on every handler.
