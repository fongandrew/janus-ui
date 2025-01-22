import { createMemo, createRenderEffect, type JSX, splitProps, useContext } from 'solid-js';
import { isServer } from 'solid-js/web';

import { FormContext } from '~/shared/components/form-context';
import {
	FORM_CONTROL_ATTR,
	resetControl,
	validate,
} from '~/shared/components/form-element-control';
import { generateId } from '~/shared/utility/id-generator';

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
	const [local, rest] = splitProps(props, ['names', 'onReset', 'onSubmit']);

	const context = useContext(FormContext);
	const id = createMemo(() => props.id ?? generateId('form'));
	createRenderEffect(() => {
		context.setId(id());
	});

	const handleReset = async (event: Event) => {
		const form = event.target as HTMLFormElement;

		// Reset touched state in all controls in form
		const controls = getControls(form);
		for (const control of controls) {
			resetControl(control);
		}

		local.onReset?.(event);
	};

	const handleSubmit = async (event: SubmitEvent) => {
		const form = event.target as HTMLFormElement;
		const controls = getControls(form);

		// Revalidate all controls in the form. Validation may be async so need
		// special handling for that scenario.
		const validationPromises: Promise<boolean>[] = [];
		for (const control of controls) {
			const validationResult = validate(event, control);
			if (validationResult instanceof Promise) {
				validationPromises.push(validationResult);
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
			if (result === false) {
				// Focus first invalid control
				for (const control of controls) {
					if (control.matches(':invalid, [aria-invalid="true"]')) {
						control.focus?.();
						break;
					}
				}
				return;
			}
		}

		const data = new FormData(form);
		local.onSubmit?.(Object.assign(event, { data }));
		form.reset(); // Manually reset data
	};

	return (
		<form
			// By default, don't use browser validation and use our own but can be
			// forced on via a prop
			noValidate={!isServer}
			onSubmit={handleSubmit}
			onReset={handleReset}
			{...rest}
		/>
	);
}
