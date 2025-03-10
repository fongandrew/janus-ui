import { updateScrollState } from '~/shared/callback-attrs/scroll';
import { createCallbackRegistry } from '~/shared/utility/callback-attrs/callback-registry';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { firstFocusable } from '~/shared/utility/focusables';
import { inClosedDialog, inClosedPopover } from '~/shared/utility/in-closed';
import { createMagicProp } from '~/shared/utility/magic-prop';
import { data } from '~/shared/utility/magic-strings';
import { elmDoc } from '~/shared/utility/multi-view';

/**
 * A request-to-close callback is a function that can return false to interrupt
 * the current modal from being closed.
 */
export type RequestCloseCallback = (
	this: HTMLElement,
	event: Event & { currentTarget: HTMLElement },
) => boolean | void;

/**
 * Magic attribute to identify modal content (used to find focusable elements)
 */
export const MODAL_CONTENT_ATTR = data('modal__content');

/**
 * Magic attribute to identify modal footer (used to find focusable elements)
 */
export const MODAL_FOOTER_ATTR = data('modal__footer');

/**
 * Magic data attribute to register a "modal opened" callback within a modal.
 * This will run right *after* the modal is opened.
 */
export const MODAL_OPENED_ATTR = data('modal__opened');

const openedRegistry =
	createCallbackRegistry<(this: HTMLElement, elm: HTMLElement) => void>(MODAL_OPENED_ATTR);
export const createOpenedCallback = openedRegistry.create;

/**
 * Magic data attribute to register a "modal closed" callback within a modal.
 * This will run right *before* the modal is closed.
 */
export const MODAL_CLOSED_ATTR = data('modal__closed');

const closedRegistry =
	createCallbackRegistry<(this: HTMLElement, elm: HTMLElement) => void>(MODAL_CLOSED_ATTR);
export const createClosedCallback = closedRegistry.create;

/**
 * Magic data attribute used to register a "request to close" callback on a modal
 */
export const REQUEST_CLOSE_ATTR = data('modal__request-close');

const requestCloseRegistry = createCallbackRegistry<RequestCloseCallback>(REQUEST_CLOSE_ATTR);
export const createRequestCloseCallback = requestCloseRegistry.create;

// Flag used by `modalBackdropMouseDown` below.
const [mouseDownDialog, setMouseDownDialog] = createMagicProp<boolean>();

/**
 * Set a flag that lets the click handler know what the initial click target was. A user
 * may start a click on the dialog element, then move to the backdrop before mouseup
 * (e.g. to highlight some text). This should not count as a click on the backdrop.
 */
export const modalBackdropMouseDown = createHandler(
	'mousedown',
	'modal__backdrop-mousedown',
	(event) => {
		const dialog = event.currentTarget as HTMLDialogElement;
		setMouseDownDialog(dialog, event.target === dialog);
	},
);

/** Close modal on backdrop click  */
export const modalBackdropClick = createHandler('click', 'modal__backdrop-click', (event) => {
	const dialog = event.currentTarget as HTMLDialogElement;
	if (mouseDownDialog(dialog)) {
		// A click on the dialog itself is really a click on the backdrop. The visible
		// content area of the dialog is within a separate element and will result in
		// the event target being some child of the dialog.
		if (event.target === dialog) {
			requestModalClose(dialog, event);
		}
	}
});

/** Close current modal when escape key is pressed */
export const modalEscapeKey = createHandler('keydown', 'modal__escape', (event) => {
	if (event.key !== 'Escape') return;

	const dialog = (event.target as HTMLElement)?.closest(':modal') as HTMLDialogElement | null;
	if (!dialog) return;

	// Don't auto close on escape if popover is open (let light dismiss handle it)
	if (dialog.querySelector(':popover-open')) return;

	requestModalClose(dialog, event);
});

/**
 * Open the modal associated with this element's target attribute
 * Switch this to command / commandfor when tere's better support for that.
 */
export const modalTriggerOpen = createHandler('click', 'modal__trigger-open', (event) => {
	const target = event.currentTarget as HTMLElement;
	const dialogId = target.getAttribute('aria-controls');
	if (!dialogId) return;
	const dialog = elmDoc(target)?.getElementById(dialogId);
	if (!dialog) return;
	openModal(dialog as HTMLDialogElement);
});

/** Request the modal associated with this trigger close */
export const modalTriggerRequestClose = createHandler(
	'click',
	'modal__trigger-request-close',
	(event) => {
		const target = event.currentTarget as HTMLElement;
		const dialogId = target.getAttribute('aria-controls');
		const dialog = dialogId
			? elmDoc(target)?.getElementById(dialogId)
			: target.closest(':modal');
		if (!dialog) return;
		requestModalClose(dialog as HTMLDialogElement, event);
	},
);

/** Forcefully close the modal associated with trigger */
export const modalTriggerClose = createHandler('click', 'modal__trigger-close', (event) => {
	const target = event.currentTarget as HTMLElement;
	const dialogId = target.getAttribute('aria-controls');
	const dialog = dialogId ? elmDoc(target)?.getElementById(dialogId) : target.closest(':modal');
	if (!dialog) return;
	closeModal(dialog as HTMLDialogElement);
});

/** Set scroll handler on modal content area when visible */
export const modalOpenScrollState = createOpenedCallback('modal__open-scroll-state', (elm) => {
	elm.addEventListener('scroll', updateScrollState, { passive: true });
	updateScrollState({ target: elm });
});
export const modalClosedScrollState = createClosedCallback('modal__closed-scroll-state', (elm) => {
	elm.removeEventListener('scroll', updateScrollState);
});

/**
 * Open a modal dialog
 */
export function openModal(dialog: HTMLDialogElement) {
	dialog.showModal();
	focusModal(dialog);
	setAriaExpanded(dialog, true);

	// Run any opened callbacks
	for (const elm of [
		dialog,
		...dialog.querySelectorAll<HTMLElement>('[' + MODAL_OPENED_ATTR + ']'),
	]) {
		// Ignore things inside closed popovers or dialogs
		if (inClosedDialog(elm)) continue;
		if (inClosedPopover(elm)) continue;
		for (const callback of openedRegistry.iter(elm)) {
			callback.call(elm, elm);
		}
	}
}

/**
 * Close a modal dialog (and closes all child dialogs too so any bookkeeping and event
 * listeners can be cleaned up)
 */
export function closeModal(dialog: HTMLDialogElement) {
	const childDialogs = dialog.querySelectorAll<HTMLDialogElement>(':modal') ?? [];

	// Close in reverse order with assumption that the later ones are the "top-most" ones
	for (const childDialog of Array.from(childDialogs).reverse()) {
		closeJustOne(childDialog);
	}

	closeJustOne(dialog);
}

/**
 * Helper function called by closeModal that closes just the immediate dialog,
 * with no child dialogs.
 */
function closeJustOne(dialog: HTMLDialogElement) {
	setAriaExpanded(dialog, false);

	// Close any popovers
	for (const popover of dialog.querySelectorAll<HTMLElement>(':popover-open')) {
		popover.hidePopover();
	}

	// Run any closed callbacks
	for (const elm of [
		dialog,
		...dialog.querySelectorAll<HTMLElement>('[' + MODAL_CLOSED_ATTR + ']'),
	]) {
		// Ignore things inside closed popovers or dialogs
		if (inClosedDialog(elm)) continue;
		if (inClosedPopover(elm)) continue;
		for (const callback of closedRegistry.iter(elm)) {
			callback.call(elm, elm);
		}
	}

	dialog.close();
}

/**
 * Focus on the first focusable element in the modal to ensure focus moves
 * into the modal from the trigger.
 */
export function focusModal(dialog: HTMLDialogElement) {
	// Always go with explicit autofocus
	const autoFocusElement = dialog.querySelector<HTMLElement>('[autofocus]');
	if (autoFocusElement) {
		autoFocusElement.focus();
		return;
	}

	// Else prefer focusable in content
	const content = dialog.querySelector<HTMLElement>('[' + MODAL_CONTENT_ATTR + ']');
	let target = content ? firstFocusable(content) : undefined;
	if (target) {
		target.focus();
		return;
	}

	// Else if no content, look in footer
	const footer = dialog.querySelector<HTMLElement>('[' + MODAL_FOOTER_ATTR + ']');
	target = footer ? firstFocusable(footer) : undefined;
	if (target) {
		target.focus();
		return;
	}

	// Else just focus the first focusable in the dialog
	firstFocusable(dialog)?.focus();
}

/** Toggle any aria-controls / aria-expanded options for trigger buttons */
export function setAriaExpanded(dialog: HTMLDialogElement, value: boolean) {
	if (dialog.id) {
		for (const trigger of elmDoc(dialog)?.querySelectorAll(
			`[aria-expanded][aria-controls~="${dialog.id}"]`,
		) ?? []) {
			trigger.setAttribute('aria-expanded', String(value));
		}
	}
}

/**
 * Attempt to close a modal, checking with registered callbacks first
 * Returns true if the modal was closed, false if a callback prevented it
 */
export function requestModalClose(dialog: HTMLDialogElement, event: Event) {
	if (!dialog.open) return false;

	// Prevent default since we're maybe doing this manually
	event.preventDefault();

	// Specify dialog as current target for ease of reference
	Object.defineProperty(event, 'currentTarget', {
		configurable: true,
		value: dialog,
	});

	// Check for callbacks on dialog plus any child callbacks as well
	for (const elm of [
		dialog,
		...dialog.querySelectorAll<HTMLElement>('[' + REQUEST_CLOSE_ATTR + ']'),
	]) {
		for (const callback of requestCloseRegistry.iter(elm)) {
			if (callback.call(elm, event as Event & { currentTarget: HTMLElement }) === false) {
				return false;
			}
		}
	}

	// Close the dialog
	closeModal(dialog);
	return true;
}
