import { createEffect, createMemo, mergeProps, splitProps } from 'solid-js';

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

/** Track which documents we've already attached to */
const didAttachToDocument = new WeakSet<Document>();

/** Add our aria-disabled capture phase listener to document */
function attachToDocument(targetDocument = window.document) {
	if (didAttachToDocument.has(targetDocument)) {
		return;
	}

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
		targetDocument.addEventListener(eventName, preventDefaultIfAriaDisabled, true);
	});

	didAttachToDocument.add(targetDocument);
}

/** Solid JS hook to modify props for input elements and other form-like things */
export function useFormControl<T extends { disabled?: boolean | undefined }>(props: T) {
	const [local, rest] = splitProps(props, ['disabled'] as const);
	const mergedProps = createMemo(() => {
		const merged = mergeProps(rest, {
			'aria-disabled': (local as { disabled?: boolean }).disabled,
		});
		return merged;
	});
	createEffect(() => attachToDocument());

	return mergedProps;
}
