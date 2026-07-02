# @janus/solid

Thin Solid wrappers around `css/` + `dom/`. An optional convenience layer: each
component renders the documented class list, maps `disabled` / `invalid` through
`ariaize` (never native `disabled`, §13.1), spreads the rest of its props, and
lets the `dom/` layer's `data-js` behaviors do the work. Depends on `css`,
`dom`, and `utils`.

## Usage

```tsx
import { render } from 'solid-js/web';

import { mount } from '~/lib2/dom';
import '~/lib2/dom/all'; // Pattern A: register every behavior handler
import { Button, Form, Input, LabelledInput, SubmitButton } from '~/lib2/solid';

function SignupForm() {
	return (
		<Form onSubmit={(data) => ({ ok: true })}>
			<LabelledInput label="Email">
				{(inputProps) => <Input {...inputProps} type="email" name="email" required />}
			</LabelledInput>
			<SubmitButton variant="primary">Sign up</SubmitButton>
		</Form>
	);
}

render(() => <SignupForm />, document.getElementById('root')!);
mount(); // wire the dom/ behaviors onto the rendered markup
```

## Design

- **No behavior wiring in components.** Interactivity is activated by `data-js`
  tokens; `dom/`'s `mount()` runs the registered behaviors (§13, rule 2).
- **`ariaize` at the boundary.** `<Input disabled>` renders `aria-disabled`, not
  native `disabled` — controls stay focusable and announced (§13.1).
- **Render-prop labelling.** `useLabelledInput` + the thin `Labelled*` layout
  components own IDs and ARIA wiring; no prop-mod context (§13.2).
- **`utils/` is internal.** Only `mergeRefs` lives there today.
