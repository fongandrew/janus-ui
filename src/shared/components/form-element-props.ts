import '~/shared/components/callbacks/disabled';

import { createMemo, type JSX, mergeProps, onCleanup } from 'solid-js';
import { createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { useFormElementProps } from '~/shared/components/form-element-context';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import {
	createValidator,
	EXTERNAL_ERROR_ATTR,
	validateOnChange,
	type Validator,
} from '~/shared/utility/callback-attrs/validate';

export interface HTMLElements {
	a: HTMLAnchorElement;
	button: HTMLButtonElement;
	div: HTMLDivElement;
	input: HTMLInputElement;
	label: HTMLLabelElement;
	select: HTMLSelectElement;
	span: HTMLSpanElement;
	textarea: HTMLTextAreaElement;
}

export type FormElementProps<
	TTag extends keyof JSX.HTMLElementTags,
	TElement extends HTMLElement = TTag extends keyof HTMLElements
		? HTMLElements[TTag]
		: HTMLElement,
> = JSX.HTMLElementTags[TTag] & {
	/**
	 * Whether the input is disabled. Not all HTMLElements support `disabled`
	 * but allow this as a prop
	 */
	disabled?: boolean | undefined;
	/**
	 * Whether the input is required. Not all HTMLElements support `required`
	 * but allow this as a prop
	 */
	required?: boolean | undefined;
	/**
	 * Whether the input value is currently invalid. Not a standard HTML
	 * attribute but allow because `aria-invalid` is a thing and we want
	 * to be consistent with how we do `disabled` and `required`
	 */
	invalid?: boolean | undefined;
	/** Validation attribute functions created with `createValidator` */
	onValidate?: Validator<TElement> | undefined;
	/**
	 * Allow arbitrary data attributes
	 */
	[key: `data-${string}`]: string | undefined;
};

/** Rewrites contextual props input elements and other form-like controls */
export function mergeFormElementProps<TTag extends keyof JSX.HTMLElementTags>(
	props: FormElementProps<TTag>,
): JSX.HTMLElementTags[TTag] {
	// Create a validator on the fly if needed
	const getValidator = createMemo(() => {
		if (!props.onValidate) return;
		const validator = createValidator(createUniqueId(), props.onValidate);
		onCleanup(validator.rm);
		return validator;
	});

	// Merge in elements from above, then add in custom behaviors
	const formProps = useFormElementProps(props);
	const merged = mergeProps(
		formProps,

		// Set ID by default
		() => (formProps.id ? {} : { id: createUniqueId() }),

		{
			// Prefer `aria-disabled` over disabled. Better screenreader experience if you
			// can focus disabled element and see that it's disabled.
			get disabled() {
				return null;
			},
			// Set aria-disabled if disabled
			get ['aria-disabled']() {
				return formProps.disabled ?? formProps['aria-disabled'];
			},
			// Set aria-required if required
			get ['aria-required']() {
				return formProps.required ?? formProps['aria-required'];
			},
			// Set aria-invalid if invalid
			get ['aria-invalid']() {
				return !!(formProps.invalid ?? formProps['aria-invalid']);
			},
			// Set additional variable if invalid is set externally to keep imperative
			// validation handlers from clobbering it
			get [EXTERNAL_ERROR_ATTR]() {
				if (isServer) return null;
				return (formProps.invalid ?? formProps['aria-invalid']) ? 'true' : null;
			},
			// Unset non-standard invalid attribute */
			invalid: null,
		},

		// Hook up validate on change (inside function so validatorId is tracked)
		() => callbackAttrs(formProps, validateOnChange, getValidator()),
	);

	return merged as JSX.HTMLElementTags[TTag];
}
