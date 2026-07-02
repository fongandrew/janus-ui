# Janus v2 — `solid/`

Thin Solid wrappers around `css/` + `dom/` (design spec §13). Every
component is a prop→attribute mapper: it renders the documented CSS class
list, the right ARIA attributes (via `ariaize()` — `disabled` always becomes
`aria-disabled`, never native `disabled`), and the `data-js` behavior tokens
the DOM layer's `mount()` dispatch activates. No component-side behavior
wiring, no prop-mod context.

## Usage

```tsx
import '~/lib2/css/index.css';
import '~/lib2/dom/all'; // or the generated Pattern B entry

import { mount } from '~/lib2/dom';
import { Form, Input, LabelledInput, SubmitButton } from '~/lib2/solid';

// after render:
mount();

<Form onSubmit={async (data) => ({ ok: true })}>
	<LabelledInput label="Email" description="Used for login">
		{(p) => <Input {...p} name="email" type="email" required />}
	</LabelledInput>
	<SubmitButton variant="primary">Save</SubmitButton>
</Form>;
```

- `aria.ts` — `ariaize()` + `attrs()` at the framework boundary (§13.1)
- `use-labelled-input.ts` — the labelling hook; deterministic ids (§13.2)
- `labelled-input.tsx` — `LabelledInput` / `LabelledInline` /
  `LabelledInputGroup`, render-prop layouts over the hook
- `form.tsx` / `modal-form.tsx` — the form wrappers (§13.5–13.6)
- one file per component (§13.7) — `button.tsx`, `modal.tsx`, `menu.tsx`, …
- `test-app/` — the client-rendered demo app (`/v2-solid.html`) that the
  colocated `*.e2e.ts` suites target

Depends on `css/`, `dom/`, and `utils/`.
