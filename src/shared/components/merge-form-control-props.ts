import { mergeProps, splitProps, useContext } from 'solid-js';

import { FormControlContext } from '~/shared/components/form-control-context';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

/** Listener that selectively disables event propagation if aria-disabled */
function preventDefaultIfAriaDisabled(event: Event) {
	const target = event.target as HTMLElement;
	if (!target) return;

	const closestAriaDisabled = target.closest('[aria-disabled]');
	if (closestAriaDisabled && closestAriaDisabled?.getAttribute('aria-disabled') !== 'false') {
		if (event instanceof KeyboardEvent && event.key === 'Tab') {
			return;
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

export interface FormControlProps {
	/**
	 * Callback ref for the input element -- sort of annoying to cast to any but otherwise
	 * TypeScript complains when trying to assign more specific ref handlers to this
	 */
	ref?: ((element: any) => void) | undefined;
	/** Whether the input is disabled */
	disabled?: boolean | undefined;
	/**
	 * By default, we will set this as the input in the form control context.
	 * This can be opted out of (e.g. for secondary controls) via this props.
	 */
	unsetFormInput?: boolean | undefined;
}

/** Solid JS hook to modify props for input elements and other form-like things */
export function mergeFormControlProps<T extends FormControlProps>(
	props: T,
	...extraRefs: ((element: any) => void)[]
) {
	const formControlContext = useContext(FormControlContext);

	const [local, rest] = splitProps(props, ['disabled', 'ref', 'unsetFormInput']) as [
		FormControlProps,
		any,
	];

	const merged = mergeProps(rest, {
		// Assign input to form control context if it exists
		get ref() {
			return combineRefs(
				local.unsetFormInput ? undefined : formControlContext?.setInput,
				local.ref,
				...extraRefs,
			);
		},
		// Switch disabled to aria-disabled if it exists
		get ['aria-disabled']() {
			return local.disabled;
		},
	});
	return merged as Omit<T, 'disabled' | 'unsetFormInput'> & { 'aria-disabled': boolean };
}
