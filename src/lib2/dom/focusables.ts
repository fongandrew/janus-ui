/** Selector for elements that can receive keyboard focus (excluding `tabindex="-1"`). */
export const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'details',
	'[tabindex]',
]
	.map((n) => `${n}:not([tabindex="-1"])`)
	.join(',');

/** Selector including `tabindex="-1"` — used for roving-focus item discovery. */
export const ROVING_ITEM_SELECTOR = [
	'[role="tab"]',
	'[role="menuitem"]',
	'[role="menuitemradio"]',
	'[role="menuitemcheckbox"]',
	'[role="option"]',
	'[role="radio"]',
	'button:not([disabled])',
	'a[href]',
].join(',');

/** All focusable elements within a container, in DOM order. */
export function focusables(el: ParentNode): HTMLElement[] {
	return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/** The first focusable element within a container. */
export function firstFocusable(el: ParentNode): HTMLElement | null {
	return el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}
