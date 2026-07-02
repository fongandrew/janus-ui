/**
 * Focusable-element discovery (internal helper for focus behaviors).
 */
const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button',
	'input',
	'select',
	'textarea',
	'[tabindex]',
	'[contenteditable="true"]',
	'audio[controls]',
	'video[controls]',
	'details > summary',
].join(', ');

export function focusables(root: Element): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(el) =>
			!el.hasAttribute('disabled') &&
			el.getAttribute('aria-hidden') !== 'true' &&
			el.tabIndex !== -1 &&
			el.offsetParent !== null,
	);
}

/**
 * Items a roving-focus / active-descendant group navigates: role-carrying
 * rows first, generic focusables as the fallback.
 */
export function navigableItems(root: Element): HTMLElement[] {
	const byRole = Array.from(
		root.querySelectorAll<HTMLElement>(
			'[role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="radio"], input[type="radio"]',
		),
	).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true');
	if (byRole.length) return byRole;
	return focusables(root);
}
