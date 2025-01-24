export const FOCUSABLE_SELECTOR = [
	'a[href]', // Links with href
	'button:not([disabled])', // Non-disabled buttons
	'input:not([disabled])', // Non-disabled inputs
	'select:not([disabled])', // Non-disabled select dropdowns
	'textarea:not([disabled])', // Non-disabled textareas
	'details', // Details elements
	'[tabindex]:not([tabindex="-1"])', // Elements with positive tabindex
].join(',');

/**
 * Returns a list of focusable elements within a given element
 */
export function focusables(element: HTMLElement): Iterable<HTMLElement> {
	return element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
}

/**
 * Returns the first focusable element within a given element
 */
export function firstFocusable(element: HTMLElement) {
	return element.querySelector(FOCUSABLE_SELECTOR);
}
