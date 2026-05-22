# Janus v2 — The Solid Layer

Part 7 of the [Janus v2 build plan](./README.md). Covers the optional Solid wrappers under `src/lib/solid`.

## 13. Solid layer (`src/lib/solid`)

The Solid wrapper is the thinnest possible mapping from props to DOM plus the JS layer's `data-t-*` activation attributes. Two design rules:

1. **No prop-mod context.** Wrapper-to-leaf wiring uses a render-prop + hook pattern. No upward-merging context, no `(prev) => newValue` prop transforms. Layering across wrappers happens by explicit `attrs(prev, ...)` merges at the consumer's call site.
2. **No component-side behavior wiring.** Behaviors are activated by `data-t-*` attributes (§12). The Solid component renders the attr; `dom/`'s `mount()` registers handlers. Components never call `createValidator` or push callbacks into a registry.

### 13.1 Two shared helpers

```ts
/** Enforced: `disabled` -> `aria-disabled`. Native `disabled` is never emitted
 *  by a Janus component — keeps controls focusable + announced. dom/'s
 *  form engine must filter aria-disabled inputs from submission. */
export function ariaize(p: { disabled?: boolean; required?: boolean; invalid?: boolean }): {
  'aria-disabled'?: true; 'aria-required'?: true; 'aria-invalid'?: true;
};

/** Space-join ARIA token attrs (aria-describedby, aria-labelledby). Skips falsy. */
export function attrs(...parts: (string | false | null | undefined)[]): string | undefined;
```

`ariaize` is **opinionated and non-negotiable at the framework boundary**. `<Input disabled />` renders `<input aria-disabled="true">` — never the native HTML `disabled` attribute. A consumer who genuinely needs native `disabled` drops to a raw `<input>`. Rationale: a Janus-styled disabled control should behave the same way every time; aria-disabled keeps tab order intact and gives screen-reader users a clearer signal than vanishing focus. The SSR / no-JS edge case (a form submitted before `mount()` runs) is accepted — Solid implies JS at runtime, and the static-HTML path is `css/` + raw HTML where the consumer writes their own attributes.

### 13.2 Labelling: `useLabelledInput` hook + thin layout components

`useLabelledInput()` is the workhorse. It takes label-related options and returns flat prop objects the consumer spreads:

```ts
const { labelProps, descriptionProps, errorProps, inputProps, ids } =
  useLabelledInput({ id, description, required, errorMessage });
```

IDs are deterministic — `${inputId}-label`, `-desc`, `-err` — for debuggability and stable hydration. `inputProps` carries `id`, `aria-labelledby`, `aria-describedby` (joining description / error IDs only when each is actually rendered), `aria-required`, `aria-invalid`.

`LabelledInput` / `LabelledInline` / `LabelledInputGroup` are thin opinionated arrangements over the hook. Their `children` prop is a **render-prop** receiving `inputProps`:

```tsx
<LabelledInput label="Email" description="Used for login">
  {(p) => <Input {...p} type="email" name="email" />}
</LabelledInput>
```

When the consumer needs to merge their own ARIA contribution with the wrapper's, the merge is explicit at the call site — no hidden context magic:

```tsx
<LabelledInput label="Email">
  {(p) => (
    <Input {...p} aria-describedby={attrs(p['aria-describedby'], 'global-tip-id')} />
  )}
</LabelledInput>
```

**Deep ARIA contribution across multiple wrapper layers is not supported.** A `<FormSection>` does *not* push aria-describedby into descendant inputs — section-level descriptions belong on the section element (`<section aria-describedby=...>`). If per-input contribution is genuinely needed, the consumer nests render-props by hand.

### 13.3 What this replaces from v1

| v1 mechanism | v2 equivalent |
|---|---|
| `PropModContext` (general prop-transform context) | (deleted) |
| `FormElementPropsContext` + `FormElementPropsProvider` + `useFormElementProps` | (deleted) |
| `mergeFormElementProps` (per-input merge pipeline) | `ariaize()` at the component boundary |
| `createAuto` / `createAutoId` (lazy ID-from-context) | Wrapper owns its IDs; `useLabelledInput` generates them once |
| `onValidate` / `createValidator` / per-render callback registration | `<Input validators="name1 name2" />` (named registry) or `<Input onValidate={fn} />` (closure → WeakMap). One document-level dispatcher; see §12.1 |
| Multiple `Labelled*` components × per-input-type context wiring | One `useLabelledInput` hook + three thin layout components |

### 13.4 Validation props on `<Input>` (and friends)

`<Input>` exposes exactly two validation-related props beyond the native HTML5 attributes (`required`, `pattern`, `minlength`, etc.):

```tsx
interface InputProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** Space-separated names of validators registered via registerValidator(). */
  validators?: string;
  /** Inline closure validator. Stored in dom/'s WeakMap via ref. */
  onValidate?: Validator<HTMLInputElement>;
  // ...native attrs, invalid, onValueInput, etc.
}
```

- `validators` renders directly as `data-t-validate="..."`. The dispatcher looks each name up in the registry (§12.1).
- `onValidate` is attached via a `ref` that calls `addValidator(el, fn)` and returns the cleanup to `onCleanup()`. No event listener is attached to the element — the document-level dispatcher reads from the WeakMap.

**Deliberately not props**: `validationMessage`, `validateMatch`, `validateMinFrom`, `validateMaxFrom`. Custom error messages are returned by the validator function — named or inline. Cross-field comparisons (password match, date ranges, "X must be greater than Y") are written as named validators at module load by the consumer, then referenced via `validators="..."`. The single declarative knob to learn is "register a validator, reference it by name."

If pain emerges around parameterized built-ins, the path is to add them as pre-registered named validators that read parameters from a sibling `data-*` attribute — keeping the engine's dispatcher unchanged.

### 13.5 Form wrappers

The Solid form components mirror the `~/lib/dom/form` contract — each is ~5–20 LOC of attribute rendering plus a single conditional ref for the closure case.

```tsx
export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSubmit?: SubmitHandler;
  /** Name of a submit handler registered via registerSubmitHandler(). */
  submitHandler?: string;
}

export function Form(props: FormProps) {
  const [v, rest] = splitProps(props, ['onSubmit', 'submitHandler']);
  const id = props.id ?? createUniqueId();
  return (
    <FormContext.Provider value={{ id }}>
      <form
        {...rest}
        id={id}
        data-t-validate
        data-t-submit={v.submitHandler}
        noValidate
        ref={(el) => { if (v.onSubmit) onCleanup(addSubmitHandler(el, v.onSubmit)); }}
      />
    </FormContext.Provider>
  );
}
```

The ref attaches *only* when a closure is passed. Consumers using `submitHandler="name"` go through the pure attribute path with zero refs.

`FormContext` carries the form's `id` only — the single allowed Solid context per §13.1. It lets `<SubmitButton>` (and similar) render outside the `<form>` (modal footers, portals) while still targeting it via the `form={id}` attribute.

Other form components are pure attribute renderers:

```tsx
// Cross-field validation grouping
export function FormGroup(props: ComponentProps<'div'>) {
  return <div {...props} data-t-validate-group />;
}

// Form-wide error display. setFormError() finds it by data-t-form-error
export function FormError(props: ComponentProps<'div'>) {
  return (
    <div {...props}
      data-t-validate-error data-t-form-error
      role="alert" aria-atomic="true"
      class={cx('c-alert v-colors-danger', props.class)} />
  );
}

// Submit button — reads form id from context for portal/footer placement
export function SubmitButton(props: ButtonProps) {
  const ctx = useContext(FormContext);
  return <Button {...props} type="submit" form={ctx?.id ?? props.form} />;
}
```

### 13.6 Modal form

The three modal-form behaviors from §12.1 (`data-t-reset-on-close`, `data-t-close-on-success`, plus the speed-bump pattern via `data-c-modal-speed-bump`) compose into a single Solid wrapper. Defaults are opinionated — all on, individually opt-outable.

```tsx
export interface ModalFormProps extends FormProps {
  closeOnSuccess?: boolean;     // default true
  resetOnClose?: boolean;       // default true
}

export function ModalForm(props: ModalFormProps) {
  const [v, rest] = splitProps(props, ['closeOnSuccess', 'resetOnClose']);
  return (
    <Form
      {...rest}
      data-t-close-on-success={v.closeOnSuccess !== false ? '' : undefined}
      data-t-reset-on-close={v.resetOnClose !== false ? '' : undefined}
    />
  );
}
```

`<ModalSpeedBump>` is a thin wrapper around a nested `<dialog>` carrying the `data-c-modal-speed-bump` marker. The parent modal's `requestClose` dispatcher auto-discovers it via DOM — no `speedBumpId` prop, no ref:

```tsx
export interface ModalSpeedBumpProps {
  message?: JSX.Element;
  keepLabel?: JSX.Element;
  discardLabel?: JSX.Element;
}

export function ModalSpeedBump(props: ModalSpeedBumpProps) {
  return (
    <dialog class="c-modal c-modal-speed-bump" data-c-modal-speed-bump>
      <form method="dialog" class="o-stack">
        <p>{props.message ?? 'You have unsaved changes.'}</p>
        <div class="o-row">
          <button value="cancel" class="c-button">
            {props.keepLabel ?? 'Keep editing'}
          </button>
          <button value="discard" class="c-button v-colors-danger">
            {props.discardLabel ?? 'Discard'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
```

Consumer composition:

```tsx
<Modal id="signup-modal">
  <ModalForm onSubmit={handleSignup}>
    {/* fields */}
    <SubmitButton>Sign up</SubmitButton>
  </ModalForm>
  <ModalSpeedBump />
</Modal>
```

The wiring between the form, the modal, and the speed bump is **entirely DOM-driven** — the engine queries for the right ancestors / descendants at the moment they're needed. No `speedBumpId`, no callback registration, no ref dance.

What v1 drops:

| v1 | v2 |
|---|---|
| `modalFormCloseOnSuccess` (callbackAttrs registration) | `data-t-close-on-success` attribute |
| `modalFormResetOnClose` (custom afterHide callback machinery) | `data-t-reset-on-close` + capture-phase `close` listener |
| `modalFormMaybeShowSpeedBump` + explicit `speedBumpId` wiring | `data-c-modal-speed-bump` marker + DOM-discovered orchestration |
| `ModalFormContent` wrapper that splits modal vs. form props | `<Modal>` + `<ModalForm>` composed directly |

### 13.7 Porting target

The render-prop + hook shape ports mechanically:

- **React**: `createUniqueId` → `useId`; identical render-prop signature.
- **Vue 3**: render-prop becomes a scoped slot.
- **Svelte 5**: render-prop becomes a snippet prop.
- **No framework**: consumers write IDs in HTML and use `css/` + `dom/` directly.

No Solid-specific reactive primitive (signals, `splitProps`, etc.) leaks into the public API of `src/lib/solid/` beyond the prop accessors themselves. A future `src/lib/react/` pseudo-package would be near-1:1.
