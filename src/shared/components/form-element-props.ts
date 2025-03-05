import { createMemo, type JSX, mergeProps, onCleanup } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { useFormElementProps } from '~/shared/components/form-element-context';
import {
	createValidator,
	removeValidator,
	validateOnChange,
	type Validator,
	validatorProps,
} from '~/shared/handlers/validation';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { handlerProps } from '~/shared/utility/event-handler-attrs';

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
	const validatorId = createMemo(() => {
		if (!props.onValidate) return;
		const id = createUniqueId();
		onCleanup(() => removeValidator(id));
		return createValidator(id, props.onValidate)();
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
			// Unset non-standard invalid attribute */
			invalid: null,
		},

		// Hook up validate on change
		handlerProps(formProps, validateOnChange),
		() => validatorProps(formProps, validatorId),
	);

	return merged as JSX.HTMLElementTags[TTag];
}

registerDocumentSetup((document) => {
	const relevantEvents = [
		'click',
		'dblclick',
		'input',
		'keydown',
		'keyup',
		'mousedown',
		'mouseup',
		'paste',
	];

	/** Listener that selectively disables event propagation if aria-disabled */
	function preventDefaultIfAriaDisabled(event: Event) {
		const target = event.target as HTMLElement;
		if (!target) return;

		const closestAriaDisabled = target.closest('[aria-disabled]');
		if (closestAriaDisabled && closestAriaDisabled?.getAttribute('aria-disabled') !== 'false') {
			if (event instanceof KeyboardEvent) {
				// Need to allow tabbing off disabled element
				if (event.key === 'Tab') return;
				// For toolbars + radios, arrow key allows moving selection
				// Exception for aria-haspopup elements since arrow means "open popup"
				if (event.key.startsWith('Arrow') && !closestAriaDisabled.ariaHasPopup) return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	relevantEvents.forEach((eventName) => {
		document.addEventListener(eventName, preventDefaultIfAriaDisabled, true);
	});
});
