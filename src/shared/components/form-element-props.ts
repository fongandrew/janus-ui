import { type JSX, mergeProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { useFormElementProps } from '~/shared/components/form-element-context';
import { validateOnChange, validatorProps } from '~/shared/handlers/validation';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { type Falsey } from '~/shared/utility/type-helpers';

export type FormElementProps<TTag extends keyof JSX.HTMLElementTags> = JSX.HTMLElementTags[TTag] & {
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
	validators?: (string | (() => string) | Falsey)[] | undefined;
	/**
	 * Allow arbitrary data attributes
	 */
	[key: `data-${string}`]: string | undefined;
};

/** Rewrites contextual props input elements and other form-like controls */
export function mergeFormElementProps<TTag extends keyof JSX.HTMLElementTags>(
	passedProps: FormElementProps<TTag>,
) {
	// Merge in elements from above first
	const props = useFormElementProps(passedProps);
	const merged = mergeProps(
		{
			// Set ID by default
			id: createUniqueId(),
		},
		props,

		{
			// Prefer `aria-disabled` over disabled. Better screenreader experience if you
			// can focus disabled element and see that it's disabled.
			get disabled() {
				return null;
			},
			// Set aria-disabled if disabled
			get ['aria-disabled']() {
				return props.disabled ?? props['aria-disabled'];
			},
			// Set aria-required if required
			get ['aria-required']() {
				return props.required ?? props['aria-required'];
			},
			// Set aria-invalid if invalid
			get ['aria-invalid']() {
				return !!(props.invalid ?? props['aria-invalid']);
			},
			// Unset non-standard invalid attribute */
			invalid: null,
		},

		// Hook up validate on change -- stick props.validators access in function
		// so we can recalc if validators passed to props change
		handlerProps(props, validateOnChange),
		() => validatorProps(props, ...(props.validators ?? [])),
	);

	return merged;
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
