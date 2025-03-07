/**
 * Is this inside a hidden popover element?
 */
export function inClosedPopover(element: HTMLElement) {
	const popover = element.closest('[popover]');
	return popover && !popover.matches(':popover-open');
}

/**
 * Is this inside a hidden / closed dialog?
 */
export function inClosedDialog(element: HTMLElement) {
	const dialog = element.closest('dialog');
	return dialog && !dialog.open;
}
