import { createRenderEffect, type JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

import { useFormElement } from '~/shared/components/form-element-context';
import { FormElementControl, type Validator } from '~/shared/components/form-element-control';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { unreactivePropAccess } from '~/shared/utility/solid/unreactive-prop-access';

export type FormElementProps<
	TTag extends keyof JSX.HTMLElementTags,
	TElement extends HTMLElement = JSX.HTMLElementTags[TTag] extends JSX.HTMLAttributes<infer T>
		? T & HTMLElement
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
	/** Custom validation function for this element */
	onValidate?: Validator<TElement> | undefined;
	/**
	 * By default, we will set this as the input in the form control context.
	 * This can be opted out of (e.g. for secondary controls) via this props.
	 * This prop cannot change reactively.
	 */
	unsetFormInput?: boolean | undefined;
	/**
	 * Allow arbitrary data attributes
	 */
	[key: `data-${string}`]: string | undefined;
};

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

	relevantEvents.forEach((eventName) => {
		document.addEventListener(eventName, preventDefaultIfAriaDisabled, true);
	});
});

/** Rewrites contextual props input elements and other form-like controls */
export function mergeFormElementProps<TTag extends keyof JSX.HTMLElementTags>(
	props: FormElementProps<TTag>,
) {
	const [unsetFormInput] = unreactivePropAccess(props, ['unsetFormInput']);
	const control = (unsetFormInput ? useFormElement() : null) ?? new FormElementControl();

	// Remove non-standard DOM attribute
	control.rmAttr('unsetFormInput');

	// Switch disabled to aria-disabled if it exists (and we're on the client)
	// so screen reader can still get useful info about the disabled component
	// while tabbing around
	(control as FormElementControl<'input'>).setAttr('disabled', () =>
		props.disabled && !isServer ? false : undefined,
	);
	control.setAttr('aria-disabled', () => props.disabled);

	// Add aria version of required if applicable. We can leave required as is.
	// It's kind of annoying to the extent it blocks form submission and we
	// have our own JS validation, but that can be disabled with the form's
	// novalidate attribute as needed.
	control.setAttr('aria-required', () => props.required);

	// Replace non-standard `invalid` attribute with `aria-invalid` if it exists
	control.rmAttr('invalid');
	control.setAttr('aria-invalid', () => props.invalid);

	// Set validation (and remove from props)
	createRenderEffect(() => {
		control.onValidate(props.onValidate as Validator<HTMLElement>);
		control.rmAttr('onValidate');
	});

	return control.merge(props as any) as JSX.HTMLElementTags[TTag];
}
