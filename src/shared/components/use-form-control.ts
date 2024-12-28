import { createMemo, mergeProps, splitProps } from 'solid-js';

import { registerDocumentSetup } from '~/shared/utility/document-setup';

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

/** Solid JS hook to modify props for input elements and other form-like things */
export function useFormControl<T extends { disabled?: boolean | undefined }>(props: T) {
	const [local, rest] = splitProps(props, ['disabled'] as const);
	const mergedProps = createMemo(() => {
		const merged = mergeProps(rest, {
			'aria-disabled': (local as { disabled?: boolean }).disabled,
		});
		return merged;
	});

	return mergedProps;
}
