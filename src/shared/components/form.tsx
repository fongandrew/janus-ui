import { type JSX, splitProps, useContext } from 'solid-js';

import { createFormContext, FormContext } from '~/shared/components/form-context';
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

/**
 * Represents an element being passed for validation -- HTML element with certain
 * optional things guaranteed-ish
 */
export interface FormDataElement<TName> extends HTMLElement {
	name: TName;
	value: string;
	files?: FileList;
}

export interface FormProps<TNames extends string>
	extends Omit<JSX.FormHTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit'> {
	/** Require callback ref if any */
	ref?: (element: HTMLFormElement) => void;
	/** This prop is unused but just used to infer and type-check form names */
	names: Record<string, TNames>;
	/** Require change callback to be function */
	onChange?: (event: Event) => void;
	/** Default submit handler */
	onSubmit?: (event: SubmitEvent & { data: TypedFormData<TNames> }) => void | Promise<void>;
	/**
	 * Validation funciton that gets called whenever a value changes in the form.
	 * Returns a map of elements to error messages (if any) or promise to such.
	 * Should return void if no errors.
	 */
	onValidate?: (
		event: Event & { elements: FormDataElement<TNames>[] },
	) =>
		| void
		| Map<FormDataElement<TNames>, JSX.Element>
		| Promise<void | Map<FormDataElement<TNames>, JSX.Element>>;
}

export function Form<TNames extends string>(props: FormProps<TNames>) {
	const [local, rest] = splitProps(props, ['ref', 'names', 'onChange', 'onSubmit', 'onValidate']);
	const formContext = createFormContext();
	const getRefs = useContext(RefContext);

	let formRef: HTMLFormElement | null = null;
	const setRef = (el: HTMLFormElement) => {
		formRef = el;
	};

	/** Runs validation based on event, returns true if no errors */
	const validate = async (event: Event) => {
		const elements = formRef?.elements as FormDataElement<TNames>[] | undefined;
		if (!elements || !elements.length) return;

		formContext.clearErrors();
		if (local.onValidate) {
			const results = await local.onValidate?.(Object.assign(event, { elements }));
			if (results) {
				for (const [element, error] of results) {
					formContext.setError(element, error);
				}
			}
		}

		return !formContext.hasErrors();
	};

	const handleChange = (event: Event) => {
		if (!formRef) return;
		validate(event);
		local.onChange?.(event);
	};

	const handleSubmit = async (event: SubmitEvent) => {
		if (!formRef) return;
		if (local.onSubmit) event.preventDefault();

		const isValid = await validate(event);
		if (!isValid) return;

		const data = new FormData(formRef);
		local.onSubmit?.(Object.assign(event, { data }));
	};

	return (
		<FormContext.Provider value={formContext}>
			<form
				ref={combineRefs(setRef, ...getRefs(FORM_REF), local.ref)}
				onChange={handleChange}
				onSubmit={handleSubmit}
				{...rest}
			/>
		</FormContext.Provider>
	);
}
