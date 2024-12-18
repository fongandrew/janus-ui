export function getFirstFocusableElement(element: HTMLElement) {
	// CSS selector for commonly focusable elements
	const selector = [
		'a[href]', // Links with href
		'button:not([disabled])', // Non-disabled buttons
		'input:not([disabled])', // Non-disabled inputs
		'select:not([disabled])', // Non-disabled select dropdowns
		'textarea:not([disabled])', // Non-disabled textareas
		'[tabindex]:not([tabindex="-1"])', // Elements with positive tabindex
	].join(',');
	return element.querySelector(selector);
}
