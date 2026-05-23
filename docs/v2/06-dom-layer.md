# Janus v2 — The DOM Layer

Part 6 of the [Janus v2 build plan](./README.md). Covers the framework-agnostic JS layer under `src/lib/dom`.

## 12. The JS layer (`src/lib/dom`)

The JS layer is a toolkit of small, composable behaviors that attach to DOM elements via `data-t-*` attributes. Components ship as thin compositions of these behaviors. Consumers can use the same toolkit directly to build custom controls (toolbars, command palettes, navigable lists) without leaving the Janus model.

Three structural pieces underpin everything in this layer:

- **`ca` — the attribute composition helper** (§12.2.1). One way to merge prop objects (data attributes, ARIA, class, etc.) onto an element with explicit conflict semantics. Replaces v1's `callbackAttrs` plus any ad-hoc spread merging.
- **Event callbacks** (§12.2.2). One document-level capture-phase listener per event type reads a single `data-t-on-{event}` attribute per ancestor and dispatches to a callback registered under a `$`-prefixed name. Each callback lives in its own module under `src/lib/dom/handlers/`, filename matches the callback name.
- **Activation-attribute behaviors** (§12.2.3). Stateful per-element behaviors (roving focus, request-close, validators) opt in via a dedicated `data-t-{behavior}` attribute. Each lives in its own module named after the attribute. Same filename-as-manifest convention as event callbacks; same purge story (§12.4).

Application areas:

- **Form engine** (§12.1) — substantial coherent system for validation and submission. Janus's biggest JS investment, because forms are the most JS-heavy real-world need (285+ call sites in surveyed v1 consumers). Uses the activation-attribute pattern.
- **Behavior utilities** (§12.2.5) — small composable bits: roving focus, request-close, typeahead, active descendant, etc. Mix of both patterns depending on whether the behavior is event-driven (callback) or stateful (activation attribute).
- **Bundling** (§12.4) — for SSR apps, a build step text-scans the SSR output for both `$callback-name` strings and activation-attribute names, then generates a client entry that imports only the matching modules.

### 12.1 Form engine

The engine is **one document-level dispatcher plus two registries**. No per-element listeners. No per-render ID generation. Validators register either once at module load (named) or by element identity (closure, via WeakMap). It predates the general event-callback dispatcher (§12.2.4) and keeps its own form-specific dispatcher because the form lifecycle — discover owning form, walk members, ordered validator chain, touched-state machine — doesn't fit the simple per-event callback shape cleanly. The activation attributes (`data-t-validate`, `data-t-submit`, etc.) follow the filename-as-manifest convention (§12.2.3), so the bundling story is unified.

**Activation.** A form opts in with a single boolean attribute:

```html
<form data-t-validate>
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
<input type="password" required data-t-validate="match-password">
```

`data-t-validate` is a space-separated list of names. Multiple validators per element compose by listing them.

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

1. Finds the owning `<form data-t-validate>` (no-op if absent).
2. Walks form members.
3. For each element runs, in order: HTML5 native validity check → named validators from `data-t-validate` → inline validators from the WeakMap.
4. First non-null return wins. The engine writes the message into the element's error destination.

**Error destination.** Boolean marker on any element receiving error text:

```html
<input id="email" aria-describedby="email-err" required>
<span id="email-err" data-t-validate-error></span>
```

The engine walks the input's `aria-describedby`, finds the first element with `data-t-validate-error`, writes the message there and toggles `role="alert"`. The screen-reader wiring is the same DOM relationship the engine uses — no separate back-pointer attribute.

**Group validation.**

```html
<fieldset data-t-validate-group>
  <input name="start-date" type="date" required>
  <input name="end-date" type="date" required data-t-validate="after-start-date">
</fieldset>
```

When a child of a `data-t-validate-group` changes, every other touched child re-validates. Touched-only is the always-on default.

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
<form data-t-validate data-t-submit="signup">
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

The submit dispatcher (same document-level listener set) owns all the choreography: `preventDefault`, run validation, dispatch to handler if valid, call `setErrors` / `setFormError` on returned errors, reset on `{ ok: true }` unless `reset: false`. The consumer's handler is just business logic.

A form can use `data-t-submit` (or `addSubmitHandler`) without `data-t-validate` (no validation, just async submit choreography) or vice versa.

**Modal-form behaviors.** Three attrs, dispatched by the same document-level listeners. No ref, no per-form setup, no callback registration.

| Attribute | Effect |
|---|---|
| `data-t-reset-on-close` | When the ancestor `<dialog>` fires `close` (or `[popover]` fires `toggle` → `closed`), reset the form. A document-level capture-phase listener handles non-bubbling `close`. |
| `data-t-close-on-success` | On `{ ok: true }` from the submit handler, close the ancestor `<dialog>` / `[popover]` after reset. Dispatcher branch. |

**Speed bump for dirty close.** When a modal contains both a dirty form and a descendant `<dialog data-c-modal-speed-bump>`, the modal's `requestClose` handler (§12.2.5) intercepts the close, opens the speed bump, and only commits the outer close if the speed bump returns `'discard'`. Pure markup pattern — the consumer renders both dialogs and the engine discovers them via DOM:

```html
<dialog class="c-modal">
  <form data-t-validate data-t-reset-on-close data-t-close-on-success data-t-submit="signup">
    ...
  </form>
  <dialog class="c-modal" data-c-modal-speed-bump>
    <form method="dialog">
      <p>You have unsaved changes.</p>
      <button value="cancel">Keep editing</button>
      <button value="discard" class="c-button v-colors-danger">Discard</button>
    </form>
  </dialog>
</dialog>
```

Orchestration: outer modal's `requestClose` runs `isDirty(form)`; if dirty, calls `showModal()` on the speed bump and cancels the original close; listens once for the speed bump's `close` event; if `returnValue === 'discard'`, closes the outer modal.

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

The Solid wrapper sits on top. The DOM layer alone is sufficient for static HTML + progressive enhancement: a `<form data-t-validate>` with HTML5 attributes works without any JS-layer prop wrapping.

### 12.2 Behavior utilities

Four pieces work together: `ca` for composing element attributes (§12.2.1), event callbacks for one-off event-driven actions (§12.2.2), activation-attribute behaviors for stateful per-element setups (§12.2.3), and a single dispatcher tying them together (§12.2.4). All modules live under `src/lib/dom/handlers/` and follow the filename-as-manifest convention so the SSR purge step (§12.4) can include exactly the modules referenced by the rendered output.

#### 12.2.1 `ca` — attribute composition

`ca(...sources)` merges objects of HTML attributes into one object suitable for spreading onto a JSX element (or applying to a raw DOM node). It is the canonical way to combine prop objects produced by handler helpers with the consumer's own props.

```tsx
<button {...ca(openTab(panelId), props)} />
```

Default conflict resolution:

| Attribute pattern | Behavior on duplicate |
|---|---|
| `id`, `role` | throw |
| `data-*` | throw |
| `class`, `aria-labelledby`, `aria-describedby`, `style` | concat (space- or `;`-joined as appropriate) |
| everything else | throw |

Defaults are conservative. Throwing surfaces accidental double-writes loudly instead of letting the last writer silently win — including for data attributes, which the dispatcher (§12.2.4) interprets per-handler and rarely round-trips through space-joined values cleanly.

Producers can pin per-attribute behavior using wrappers, irrespective of the global defaults:

```ts
import { only, concat, override } from '~/lib/dom/compose-attrs';

export function openTab(panelId: string) {
  return {
    role: 'tab',
    'aria-labelledby': concat(panelId),
    'data-t-focus-on-click': only(panelId),
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
  'data-*': 'throw',
  class: 'concat',
  'aria-labelledby': 'concat',
  'aria-describedby': 'concat',
  style: 'concat',
  '...': 'throw',
});
```

`ca` is framework-agnostic. JSX consumers spread the result; for hand-built DOM, a sibling `apply(el, attrs)` helper iterates and calls `setAttribute` / property assignment as appropriate.

#### 12.2.2 Event callbacks

For one-off event-driven actions — "focus this on click", "close this modal on outside click", "track a button press" — the markup uses a single generic event attribute per event type:

```html
<button data-t-on-click="$t-open-tab">Open</button>
```

`$t-open-tab` is the **callback name**, which is also the filename of its module under `src/lib/dom/handlers/`. The dispatcher reads the attribute once per ancestor on each event (single `getAttribute`) and looks the name up in the registry.

```ts
// src/lib/dom/handlers/$t-open-tab.ts
import { registerCallback } from '~/lib/dom/dispatch';
import { only, concat } from '~/lib/dom/compose-attrs';

registerCallback('$t-open-tab', (el, ev) => {
  const panelId = el.getAttribute('data-c-open-tab__target');
  if (panelId) document.getElementById(panelId)?.focus();
});

export function openTab(panelId: string) {
  return {
    role: 'tab',
    'aria-labelledby': concat(panelId),
    'data-t-on-click': only('$t-open-tab'),
    'data-c-open-tab__target': only(panelId),
  };
}
```

Module does two things:

1. **Registers the callback** at top level via `registerCallback`. Importing the module is a side effect that mounts it into the registry. If never imported, tree-shaking removes it.
2. **Exports producer functions** that return prop objects (using the `ca`-friendly wrappers) for consumers to spread onto markup.

**Naming convention.** Callback names mirror the BEM prefix scheme used for CSS classes (§16):

- `$t-{name}` — **toolkit** callback. Library-provided, behavior-driven, action-named. Single purpose, no BEM modifier. Examples: `$t-open-tab`, `$t-focus-on-click`, `$t-track-event`.
- `$c-{component}__{action}` — **component** callback. Component-internal, namespaced by component, with a BEM-style `__action` suffix. Examples: `$c-modal__close`, `$c-tabs__select`, `$c-styled-select__commit`.
- `$p-{...}` is reserved for project-level callbacks consumers can declare in their own forks, by analogy with the `p-` CSS prefix.

The `$` prefix is the dispatch sigil — it tells the purge scanner (§12.4) which string literals to match as callback names, and visually disambiguates callbacks from the many other literal strings the SSR output contains (class names, IDs, ARIA labels). If the `$` ever causes friction at the filesystem or import-resolution layer, drop or substitute it — the sigil is plumbing, not API. The BEM-prefix portion (`t-` / `c-` / `p-`) is the durable convention regardless of what wraps it.

Per-call payload lives on a sibling `data-c-*` attribute the callback reads. Single dispatch attribute, single registry hit per ancestor per event.

Multiple callbacks for the same event compose by space-separating the value:

```html
<button data-t-on-click="$t-track-event $c-modal__close">...</button>
```

Both fire on click, in source order.

The dispatch attributes are `data-t-on-click`, `data-t-on-keydown`, `data-t-on-input`, `data-t-on-change`, etc. — naming mirrors HTML event handler attributes for familiarity. New event types are added by registering callbacks for them; the dispatcher installs the document-level listener lazily on first registration for that event type.

#### 12.2.3 Activation-attribute behaviors

For stateful per-element behaviors — roving focus, request-close, focus trap, validators — the markup opts in via a dedicated `data-t-{behavior}` attribute rather than a generic event attribute:

```html
<div role="toolbar" data-t-roving-focus="horizontal">
  <button class="c-button">Cut</button>
  ...
</div>
```

The attribute itself names the behavior. Its module under `src/lib/dom/handlers/` is named after the attribute and registers whatever event handling and/or mount-time setup the behavior needs:

```ts
// src/lib/dom/handlers/data-t-roving-focus.ts
import { registerActivation } from '~/lib/dom/dispatch';
import { only } from '~/lib/dom/compose-attrs';

registerActivation('data-t-roving-focus', {
  mount(el, value)       { /* demote non-active items to tabindex="-1" */ },
  keydown(el, value, ev) { /* arrow / Home / End handling */ },
});

export function rovingFocus(opts: { axis: 'horizontal' | 'vertical' | 'both' }) {
  return { 'data-t-roving-focus': only(opts.axis) };
}
```

Same two responsibilities as event-callback modules: top-level side-effect registration plus exported producers.

Activation attributes are the right pattern when:

- The behavior needs *mount-time setup* (initial `tabindex` demotion, focus-anchor recording).
- The behavior aggregates *multiple events* under one logical concept and you want one declarative opt-in instead of three sibling `data-t-on-*` attributes.
- The behavior is stateful enough that earning its own attribute aids readability.

Otherwise prefer the lighter event-callback pattern (§12.2.2) — fewer moving parts.

In the SPA path, normal tree-shaking handles both patterns: if nothing in the app imports the producer (or the module side-effect), the module never enters the bundle. In the SSR path, the producer isn't called on the client (HTML already carries the attribute), so the bundling step (§12.4) generates a client entry that imports each referenced module purely for its registration side effect.

#### 12.2.4 Dispatch model

The library installs exactly one document-level capture-phase listener per event type used by any registered callback or activation behavior. There is no per-element wiring.

**Event-callback dispatch.** On each event, the dispatcher walks from the event target upward (standard delegation). At each ancestor it does a single `getAttribute('data-t-on-{eventtype}')`, splits the value on whitespace, and invokes each named callback with `(element, event)`. One attribute read per ancestor regardless of how many callbacks are registered globally.

**Activation-attribute dispatch.** `registerActivation(attr, handlers)` adds `attr` to a per-event-type lookup. On the same walk, the dispatcher does one additional `getAttribute(attr)` per activation attribute registered for that event type, and invokes the handler if present. The synthetic `mount` event is fired once by `mount()` and again on `MutationObserver` discovery — it has no document-level listener of its own.

Per-ancestor cost is `O(1 + activation-attrs-registered-for-this-event)`. The activation-attribute count is bounded by what the codebase actually registers (a handful in practice), not by total handlers globally.

**Multi-callback per event** is natural via the space-separated value (`data-t-on-click="$a $b"`). Both fire, in source order.

**No `stopImmediatePropagation`-style cross-handler abort.** Handlers run in declared order; if you need to suppress sibling handlers, restructure the markup so they aren't co-located. A global stop is too easy to misuse for the handful of cases where it would help.

`mount()` is the entry point that primes the system at startup: it walks the DOM once and fires the synthetic `mount` event on every element carrying a registered activation attribute. Subsequent DOM mutations are picked up via `MutationObserver`. After mount, the document-level listeners handle the rest.

This replaces v1's per-render callback ID generation and the global callback registry: callback names are now stable strings tied to module filenames; no IDs are minted at runtime.

#### 12.2.5 Behavior catalogue

Each utility ships as a handler module under `src/lib/dom/handlers/` with one or more exported producers. Imperative entry points are exported alongside for consumers who prefer wiring elements directly.

| Module | Pattern | Producers (sketch) | Purpose |
|---|---|---|---|
| `data-t-roving-focus` | activation | `rovingFocus({ axis, wrap?, homeEnd? })` | Single-tabindex group with arrow-key navigation. `axis: 'horizontal' \| 'vertical' \| 'both'`. Optional wrap-around and Home/End jump-to-edge. Powers tabs, menus, toolbars, listboxes. **Markup ships items at default tab order (no `tabindex="-1"` by hand); the `mount` hook demotes non-active items. No-JS fallback: tab through items individually — degraded but functional.** |
| `data-t-focus-trap` | activation | `focusTrap()` | Constrains Tab/Shift+Tab to descendants. Only needed for non-`<dialog>` overlays — native `<dialog>` traps focus for free. |
| `data-t-restore-focus` | activation | `restoreFocus()` | Records the active element before `el` opens; restores it on close. Pairs with popovers / menus. |
| `data-t-request-close` | activation | `requestClose({ onRequestClose? })` | Intercepts ESC, outside-click, and `commandfor close` invocations. Callback returns a boolean to allow / cancel (e.g. "discard unsaved changes?"). |
| `data-t-typeahead-filter` | activation | `typeaheadFilter({ match })` | Buffers keystrokes (~500ms window) and calls `match(buffer)` to find / focus matching items. |
| `data-t-active-descendant` | activation | `activeDescendant({ items, onActive })` | Manages `aria-activedescendant` based on arrow keys without moving DOM focus. Used by listbox / combobox patterns. |
| `$t-focus-on-click` | event callback | `focusOnClick(targetId)`, `openTab(panelId)` | Smallest illustrative case — focuses a target element on click; reads target from a sibling `data-c-*` attribute. |

**Graceful degradation principle.** Markup must remain functional with JS disabled. Behavior utilities *enhance* the no-JS baseline; they don't establish it. Specifically: never render no-JS-unreachable state into the initial HTML (e.g. don't ship `tabindex="-1"` on items that the JS arrow-key handler is supposed to reach). Mount-time JS demotes / rewires as needed.

**Declarative usage example.**

```html
<div role="toolbar" data-t-roving-focus="horizontal">
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
import { rovingFocus } from '~/lib/dom/handlers/data-t-roving-focus';

<div {...ca(rovingFocus({ axis: 'horizontal' }), { role: 'toolbar' })}>
  <button class="c-button">Cut</button>
  ...
</div>
```

### 12.3 How components compose utilities

Janus's own components are thin wrappers over the toolkit:

```
c-tabs          = data-t-roving-focus (horizontal) + aria-selected sync
c-modal         = native <dialog> + data-t-request-close
c-drawer        = native <dialog> + o-dialog chrome + edge-anchored CSS + data-t-request-close
c-popover       = [popover] + data-t-request-close
c-menu          = [popover] + data-t-roving-focus (vertical) + data-t-typeahead-filter
c-styled-select = [popover] + data-t-roving-focus + data-t-active-descendant
                  + data-t-typeahead-filter + form engine
```

A consumer building a custom toolbar, command palette, or any list-with-keyboard-nav reaches for the same producers directly. There is no "private" JS in Janus components that consumers can't replicate.

### 12.4 Bundling patterns

`src/lib/dom` ships two ways to get handlers into the client. Pick one per app.

The default entry (`~/lib/dom`) exports the API surface (`mount`, `ca`, `registerCallback`, `registerActivation`, `registerValidator`, `registerSubmitHandler`, etc.) and **does not** side-effect-import any handlers. Pulling handlers in is a separate step, satisfied by exactly one of the patterns below.

**Pattern A — static HTML + everything bundle.** Side-effect-import the catchall `~/lib/dom/all` entry, which pulls in every handler module. The dispatcher routes events through registered callbacks and activation attributes as usual. No build tooling required.

```html
<script type="module">
  import '~/lib/dom/all';
  import { mount } from '~/lib/dom';
  mount();
</script>
```

Right for static sites, CMS pages, demos, prototypes — anywhere a bundler isn't in play. Ships more JS than strictly needed, but the base bundle is small enough that this is rarely a concern.

**Pattern B — SSR-driven purge.** For apps with separate SSR and client builds, `plugins/vite-plugin-janus-bundle.ts` produces a per-app client bundle containing exactly the handler modules referenced by the SSR pass.

The mechanism is a text scan of the SSR build's emitted output — PurgeCSS-style — rather than module-graph introspection. Two complementary scans cover the two handler patterns:

1. Run the SSR build first.
2. **Scan for activation attributes.** Match every literal `data-t-*` / `data-c-*` attribute name. Exclude the generic event-dispatch attributes (`data-t-on-click`, `data-t-on-keydown`, …) — those route to event callbacks, not to a handler module per attribute. Each remaining match corresponds to one file: `handlers/data-t-{name}.ts` or `handlers/data-c-{name}.ts`.
3. **Scan for callback names.** Match every `$`-prefixed literal appearing as a `data-t-on-*` attribute value. Conservative pattern: the scan keys off the leading `$` to bound the candidate set. Each match corresponds to one file: `handlers/$xyz.ts`.
4. Look each result up against `src/lib/dom/handlers/`. The **filename-as-manifest** convention from §12.2.2 / §12.2.3 is the only mapping.
5. Generate a client entry that statically imports only the matching modules:

   ```ts
   // generated: virtual:janus-handlers (or written to a real file)
   // Activation attributes scanned from attribute names:
   import '~/lib/dom/handlers/data-t-roving-focus';
   import '~/lib/dom/handlers/data-t-request-close';
   import '~/lib/dom/handlers/data-t-validate';
   // Event callbacks scanned from data-t-on-* values:
   import '~/lib/dom/handlers/$c-modal__close';
   import '~/lib/dom/handlers/$t-open-tab';
   // ...exactly the modules referenced in the SSR output
   ```

6. The client build consumes that entry; normal tree-shaking removes everything not referenced — including unused producers from imported files.

Each handler module's top-level `registerCallback` / `registerActivation` call mounts the dispatcher entry as a side effect of being imported. The generated entry is just imports, no function calls.

```ts
// client entry
import 'virtual:janus-handlers';   // Pattern B's equivalent of ~/lib/dom/all
import { mount } from '~/lib/dom';
mount();
```

**Why text scanning instead of module-graph introspection.** Both approaches encode "what the SSR build references." Text scanning has two practical advantages:

- **Bundler-portable.** Scanning a directory of emitted files is something any build pipeline can do — Vite isn't structurally required (though we ship a Vite plugin first). The same purge step can be ported to Rollup / esbuild / Turbopack / a standalone CLI without rewriting.
- **Robust to indirection.** A producer like `openTab(id)` emits literal attribute strings into the rendered HTML regardless of where the producer was imported from. Text scanning picks it up no matter the source-side topology; module-graph introspection requires every behavior-using path to import the right thing.

The cost is one hard rule: **activation attribute names and callback names always appear as literal strings in source code.** No `data-t-${dynamic}` attribute construction; no `'$' + name` callback-name concatenation. Producers that need dynamic dispatch should pick from a small allowlist of literals.

**Dev mode.** `vite dev` doesn't run the SSR-build step against emitted files. Default: treat dev as Pattern A — ship the everything bundle. Simple, fast HMR, no surprise dev-vs-prod behavior divergence (only bundle composition differs, which is a prod-build concern). For teams that want strict parity, a second plugin mode walks Vite's `server.moduleGraph` on the SSR side and regenerates the virtual entry from there; invalidate on SSR module updates and Vite's HMR cascades the client.

**Form-engine inclusion.** The dispatcher and `registerValidator` / `registerSubmitHandler` APIs sit under `~/lib/dom/form`. The form engine's activation attributes (`data-t-validate`, `data-t-submit`, `data-t-validate-group`, `data-t-validate-error`, `data-t-reset-on-close`, `data-t-close-on-success`) are filename-as-manifest entries under `handlers/` — they land in the client iff some SSR-time code path emits the attribute, exactly like any other activation behavior (§12.2.3). Validator and submit-handler bodies live in consumer code and tree-shake by normal means; the plugin doesn't enumerate handler names.

**Multi-bundle / lazy-loading direction.** The text-scan mechanism extends naturally; only the codegen that turns the scan results into the generated entry changes.

- **Per-route splitting.** When the SSR build emits one entry chunk per route, the plugin scans per chunk and generates one client entry per route. Behaviors used only on `/settings` aren't bundled into `/marketing`. Behaviors common to multiple routes hoist via Rollup's `manualChunks` — the same problem-and-solution as any other code split.
- **Per-handler dynamic loading.** Generate `loaders[name] = () => import('...')` instead of static imports, keyed on the activation attribute or callback name. The dispatcher resolves and registers on first match. Wins when individual handlers are large (`c-styled-select` is the obvious candidate) or rarely used; loses first-interaction latency on cheap handlers. A `lazy: ['styled-select']` allowlist makes the choice granular without forcing it on every handler.
