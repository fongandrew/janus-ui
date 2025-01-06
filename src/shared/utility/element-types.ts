/**
 * Utilities for element types -- prefer `.tagName` checks over `instanceof` so it works
 * across windows (unless it's actually important to check something specific to a window)
 */

/**
 * Is element a <dialog>?
 */
export function isDialog(elm: Element | null): elm is HTMLDialogElement {
	return elm?.tagName === 'DIALOG';
}

/**
 * Is element an <input>?
 */
export function isInput(elm: Element | null): elm is HTMLInputElement {
	return elm?.tagName === 'INPUT';
}

/**
 * Is element an <input> that supports text editing (so not button-like)?
 */
export function isTextInput(elm: Element | null): elm is HTMLInputElement {
	return (
		isInput(elm) &&
		!['button', 'checkbox', 'file', 'hidden', 'image', 'radio', 'reset', 'submit'].includes(
			elm.type,
		)
	);
}

/**
 * Is element a form control? Used to determine if a label can refer to it with a `for`
 * attribute.
 */
export function isFormControl(elm: Element | null) {
	return ['INPUT', 'TEXTAREA', 'SELECT'].includes(elm?.tagName ?? '');
}
