# Janus v2 — The DOM Layer

Part 6 of the [Janus v2 build plan](./README.md). Covers the framework-agnostic JS layer under `src/lib/dom`.

## 12. The JS layer (`src/lib/dom`)

The JS layer is a toolkit of small, composable behaviors that attach to DOM elements. Components ship as thin compositions of these utilities. Consumers can use the same utilities directly to build custom controls (toolbars, command palettes, navigable lists) without leaving the Janus model.

Two parts:

- **Form engine** (§12.1) — substantial coherent system for validation and submission. Janus's biggest JS investment, because forms are the most JS-heavy real-world need (285+ call sites in surveyed v1 consumers).
- **Behavior utilities** (§12.2) — small composable bits: roving focus, request-close, typeahead, active descendant, etc.

### 12.1 Form engine

The engine is **one document-level dispatcher plus two registries**. No per-element listeners. No per-render ID generation. Validators register either once at module load (named) or by element identity (closure, via WeakMap).

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

**Speed bump for dirty close.** When a modal contains both a dirty form and a descendant `<dialog data-c-modal-speed-bump>`, the modal's `requestClose` handler (§12.2) intercepts the close, opens the speed bump, and only commits the outer close if the speed bump returns `'discard'`. Pure markup pattern — the consumer renders both dialogs and the engine discovers them via DOM:

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

Each utility does one job, attaches to an element, returns a `cleanup()` function, and is idempotent. They can be used imperatively or via `data-t-*` attributes scanned by a single `mount()` call (§4 discipline).

**Graceful degradation principle.** Markup must remain functional with JS disabled. Behavior utilities *enhance* the no-JS baseline; they don't establish it. Specifically: never render no-JS-unreachable state into the initial HTML (e.g. don't ship `tabindex="-1"` on items that the JS arrow-key handler is supposed to reach). Mount-time JS demotes / rewires as needed.

| Utility | Imperative API | Purpose |
|---|---|---|
| `rovingFocus` | `rovingFocus(el, { axis, wrap?, homeEnd? })` | Single-tabindex group with arrow-key navigation. `axis: 'horizontal' \| 'vertical' \| 'both'`. Optional wrap-around and Home/End jump-to-edge. Powers tabs, menus, toolbars, listboxes. **Markup ships items at default tab order (no `tabindex="-1"` written by hand); `mount()` demotes non-active items at runtime. No-JS fallback: tab through items individually — degraded but functional.** |
| `focusTrap` | `focusTrap(el)` | Constrains Tab/Shift+Tab to descendants of `el`. Only needed for non-`<dialog>` overlays — native `<dialog>` traps focus for free. |
| `restoreFocus` | `restoreFocus(el)` | Records the active element before `el` opens; restores it on close. Pairs with popovers / menus. |
| `requestClose` | `requestClose(el, { onRequestClose? })` | Intercepts ESC, outside-click, and `commandfor close` invocations. Callback returns boolean to allow/cancel close (e.g. "discard unsaved changes?"). |
| `typeaheadFilter` | `typeaheadFilter(el, { match })` | Buffers keystrokes (~500ms window) and calls `match(buffer)` to find / focus matching items. |
| `activeDescendant` | `activeDescendant(el, { items, onActive })` | Manages `aria-activedescendant` based on arrow keys without moving DOM focus. Used by listbox / combobox patterns. |
| `anchorShim` | `anchorShim(el, { anchor })` | JS fallback for CSS anchor positioning. Only needed if §15 indicates the browser lacks native support. |

**Module shape.** Each utility ships in its own file (`src/lib/dom/behaviors/roving-focus.ts`, etc.) as a function-with-property — callable as the imperative API, with its `data-t-*` attribute name on `.attr`:

```ts
// src/lib/dom/behaviors/roving-focus.ts
export function rovingFocus(el: HTMLElement, opts: RovingFocusOptions) { /* ... */ }
rovingFocus.attr = 'data-t-roving-focus';
```

The dual role is load-bearing for the SSR-introspection bundling pattern (§12.4): SSR-time code that renders a behavior's attribute imports the module and reads `.attr` to compose the data attribute — that read pins the module into the SSR bundle's import graph, where the build plugin can discover it. For framework-agnostic consumption a tiny helper does the spread:

```ts
// src/lib/dom/data-attr.ts
export function dataAttr(b: { attr: string }, value: string | true = true) {
  return { [b.attr]: value === true ? '' : value };
}
```

```tsx
<div role="toolbar" {...dataAttr(rovingFocus, 'horizontal')}>
```

The Solid wrappers (§13) import behaviors directly inside their component bodies, so consumers using `<Tabs>` etc. get the import-graph pinning for free without ever touching `.attr`.

**Declarative mode.** A single `mount()` call scans the DOM for prefixed activation attributes (`data-t-*` for toolkit utilities, `data-c-*` for component-specific hooks) and wires up behaviors:

```html
<div role="toolbar" data-t-roving-focus="horizontal">
  <button class="c-button">Cut</button>
  <button class="c-button">Copy</button>
  <button class="c-button">Paste</button>
</div>
```

```ts
import { mount } from '~/lib/dom'
mount() // scans document and wires
```

### 12.3 How components compose utilities

Janus's own components are thin wrappers over the toolkit:

```
c-tabs          = rovingFocus(horizontal) + aria-selected sync
c-modal         = native <dialog> + requestClose
c-drawer        = native <dialog> + o-dialog chrome + edge-anchored CSS + requestClose
c-popover       = [popover] + (anchorShim?) + requestClose
c-menu          = [popover] + rovingFocus(vertical) + typeaheadFilter
c-styled-select = [popover] + rovingFocus + activeDescendant + typeaheadFilter + form engine
```

A consumer building a custom toolbar, command palette, or any list-with-keyboard-nav reaches for the same utilities directly. There is no "private" JS in Janus components that consumers can't replicate.

### 12.4 Bundling patterns

`src/lib/dom` ships two ways to get behaviors into the client. Pick one per app.

The default entry (`~/lib/dom`) exports the API surface (`mount`, `dataAttr`, `registerValidator`, `registerSubmitHandler`, etc.) and **does not** side-effect-import any behaviors. Pulling behaviors in is a separate step, satisfied by exactly one of the patterns below.

**Pattern A — static HTML + everything bundle.** Side-effect-import the catchall `~/lib/dom/all` entry, which pulls in every behavior + component utility. `mount()` then discovers them by scanning attributes. No build tooling required.

```html
<script type="module">
  import '~/lib/dom/all';
  import { mount } from '~/lib/dom';
  mount();
</script>
```

Right for static sites, CMS pages, demos, prototypes — anywhere a bundler isn't in play. Ships more JS than strictly needed, but the base bundle is small enough that this is rarely a concern.

**Pattern B — SSR-introspection bundle.** For apps with separate SSR and client builds, `plugins/vite-plugin-janus-bundle.ts` produces a per-app client bundle containing exactly the behaviors the SSR pass referenced. The mechanism rests on §12.2's module shape: SSR-time code reads `behavior.attr` to compose data attributes (via Solid wrappers, or `dataAttr()` for custom controls). That read pins the behavior module in the SSR build's import graph; tree-shaking can't eliminate it.

The plugin attaches to the SSR build, walks the post-tree-shake `bundle`, and writes a manifest:

```ts
// plugins/vite-plugin-janus-bundle.ts (SSR-side, sketch)
generateBundle(_opts, bundle) {
  const used = new Set<string>();
  for (const chunk of Object.values(bundle)) {
    if (chunk.type !== 'chunk') continue;
    for (const id of chunk.moduleIds) {
      const m = id.match(/lib\/dom\/(behaviors|components)\/([a-z-]+)/);
      if (m) used.add(`${m[1]}/${m[2]}`);
    }
  }
  this.emitFile({
    type: 'asset',
    fileName: '.janus/manifest.json',
    source: JSON.stringify([...used].sort()),
  });
}
```

The same plugin, configured on the client build, reads the manifest and serves a virtual module:

```ts
// virtual:janus-dom (generated from manifest.json)
import '~/lib/dom/behaviors/roving-focus';
import '~/lib/dom/behaviors/request-close';
// ...exactly the modules the SSR bundle referenced
```

Client entry:

```ts
import 'virtual:janus-dom';   // Pattern B's equivalent of ~/lib/dom/all
import { mount } from '~/lib/dom';
mount();
```

Each behavior module self-registers as a side effect — the same registration `~/lib/dom/all` relies on. The client therefore contains exactly the set of behaviors any SSR-rendered template could plausibly produce.

**Why not source scanning.** The SSR build's import graph already encodes exactly what gets rendered. Source-scanning for `data-t-*` literals would dual-maintain the convention (filename ↔ attribute name) and miss dynamic cases (`dataAttr(someBehavior)` where `someBehavior` is runtime-chosen). Module-graph introspection is precise without that overhead.

**Dev mode.** `vite dev` doesn't run the SSR-build step against a static `bundle` object. Default: treat dev as Pattern A — ship the everything bundle. Simple, fast HMR, no surprise dev-vs-prod *behavior* divergence (only bundle composition differs, which is a prod-build concern). For teams that want strict parity, a second plugin mode walks Vite's `server.moduleGraph` on the SSR side and regenerates the virtual module from there; invalidate on SSR module updates and Vite's HMR cascades the client.

**Form-engine inclusion.** The dispatcher and `registerValidator` / `registerSubmitHandler` APIs sit under `~/lib/dom/form`. They land in the client iff some SSR-time code path imports them (Solid's `<Form>` / `<Input>` do automatically; pure-DOM consumers `import { registerValidator } from '~/lib/dom/form'` at module load). Validator and submit-handler bodies themselves live in consumer code and tree-shake by normal means — the plugin doesn't enumerate names.

**Multi-bundle / lazy-loading direction.** The manifest mechanism extends naturally; only the codegen that turns it into the virtual module's contents changes.

- **Per-route splitting.** When the SSR build emits one entry chunk per route, the plugin writes one manifest per chunk and the client virtual module becomes per-route. Behaviors used only on `/settings` aren't bundled into `/marketing`. Behaviors common to multiple routes hoist via Rollup's `manualChunks` — the same problem-and-solution as any other code split.
- **Per-behavior dynamic loading.** Generate `loaders[attr] = () => import(...)` instead of static imports. `mount()` resolves each scanned attribute lazily. Wins when individual behaviors are large (`c-styled-select` is the obvious candidate) or rarely used; loses first-interaction latency on cheap behaviors. A `lazy: ['styled-select']` allowlist makes the choice granular without forcing it on every behavior.
