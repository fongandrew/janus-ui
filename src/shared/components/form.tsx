import { type JSX, splitProps, useContext } from 'solid-js';
import { isServer } from 'solid-js/web';

import { FORM_CONTROL_ATTR } from '~/shared/components/form-element-control';
import { errorValidationMap } from '~/shared/components/merge-form-control-props';
import { RefContext } from '~/shared/components/ref-context';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

/** RefProvider symbol for form elements */
export const FORM_REF = Symbol('form');

/** Same as form data but the names are typed */
export interface TypedFormData<TNames> {
	append(key: TNames, value: string | Blob): void;
	append(key: TNames, value: Blob, filename?: string): void;
	delete(key: TNames): void;
	get(key: TNames): FormDataEntryValue | null;
	getAll(key: TNames): FormDataEntryValue[];
	has(key: TNames): boolean;
	set(key: TNames, value: string | Blob): void;
	set(key: TNames, value: Blob, filename?: string): void;
}

export interface FormProps<TNames extends string>
	extends Omit<JSX.FormHTMLAttributes<HTMLFormElement>, 'onReset' | 'onSubmit'> {
	/** Require callback ref if any */
	ref?: (element: HTMLFormElement) => void;
	/** This prop is unused but just used to infer and type-check form names */
	names: Record<string, TNames>;
	/** Default reset handler */
	onReset?: (event: Event) => void | Promise<void>;
	/** Default submit handler */
	onSubmit?: (event: SubmitEvent & { data: TypedFormData<TNames> }) => void | Promise<void>;
}

/**
 * Get all controls in the form. This is not the same as form.elements since it only gets
 * form controls identified with our special attribute. It may include pseudo-form elements
 * like our ListBox element and will exclude any associated <input type="hidden"> elements.
 */
function getControls(form: HTMLFormElement) {
	return form.querySelectorAll(`[${FORM_CONTROL_ATTR}]`) as Iterable<HTMLElement>;
}

export function Form<TNames extends string>(props: FormProps<TNames>) {
	const [local, rest] = splitProps(props, ['ref', 'names', 'onReset', 'onSubmit']);
	const getRefs = useContext(RefContext);

	const handleReset = async (event: Event) => {
		const form = event.target as HTMLFormElement;

		// Reset touched state in all controls in form
		const controls = getControls(form);
		for (const control of controls) {
			errorValidationMap.get(control)?.setTouched(false);
			errorValidationMap.get(control)?.setError(null);
		}

		local.onReset?.(event);
	};

	const handleSubmit = async (event: SubmitEvent) => {
		const form = event.target as HTMLFormElement;
		const controls = getControls(form);

		// Revalidate all controls in the form. Validation may be async so need
		// special handling for that scenario.
		const validationPromises: Promise<(() => JSX.Element) | null>[] = [];
		for (const control of controls) {
			const validationResult = errorValidationMap.get(control)?.revalidate(event);
			if (validationResult instanceof Promise) {
				validationPromises.push(validationResult);
			} else if (validationResult) {
				// Synchronous error
				event.preventDefault();
				return;
			}
		}

		// Presence of either client-side onSubmit or async validation implies
		// we're not relying on form's default behavior
		if (local.onSubmit || validationPromises.length) {
			event.preventDefault();
		}

		// Wait for validation and if any errors, stop submission
		const results = await Promise.all(validationPromises);
		for (const result of results) {
			if (result) {
				return;
			}
		}

		const data = new FormData(form);
		local.onSubmit?.(Object.assign(event, { data }));
		form.reset(); // Manually reset data
	};

	return (
		<form
			ref={combineRefs(...getRefs(FORM_REF), local.ref)}
			// By default, don't use browser validation and use our own but can be
			// forced on via a prop
			noValidate={!isServer}
			onSubmit={handleSubmit}
			onReset={handleReset}
			{...rest}
		/>
	);
}
