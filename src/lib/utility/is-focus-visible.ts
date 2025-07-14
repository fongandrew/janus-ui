import { registerDocumentSetup } from '~/lib/utility/document-setup';
import { evtDoc } from '~/lib/utility/multi-view';

let focusVisible = false;

/** Is focus currently visible? */
export function isFocusVisible() {
	return focusVisible;
}

/**
 * Sometimes necessary to manually set focus visibility (as with programatic
 * focus changes).
 */
export function setFocusVisible(value: boolean) {
	focusVisible = value;
}

/** Handle to track pending blur event */
let pendingBlur: ReturnType<typeof setTimeout> | undefined = undefined;

/** Handler to update focus visibility */
export function handleFocus(event: FocusEvent) {
	clearTimeout(pendingBlur);
	focusVisible = !!(event.target as HTMLElement | null)?.matches(':focus-visible');
}

/** Handler for when blur removes focus */
export function handleBlur() {
	// This fires if focusing but if refocusing on another element, the focus handler
	// above should handle it. Delay slightly to accommodate scenario where this gets
	// checked in a blur handler after user hits tab to move focus and focus is
	// temporarily not visible (because it's moving to another element) but will be
	// and for all intents and purposes should still be considered visible.
	pendingBlur = setTimeout(() => {
		focusVisible = false;
	}, 0);
}

/**
 * Keydown maybe sets focus visibility (generally true for key presses on focused elements
 * but not if randomly hitting keys
 */
export function handleKeyDown(event: KeyboardEvent) {
	focusVisible = !!evtDoc(event)?.activeElement?.matches(':focus-visible');
}

/** Mousedown immediately clears focus visibility */
export function handleMouseDown() {
	focusVisible = false;
}

/** Handler for whenever focus event happens */
registerDocumentSetup((document) => {
	// Use focusin / focusout instead of focus / blur to capture all focus changes
	// because they propagate up to the document
	document.addEventListener('focusin', handleFocus);
	document.addEventListener('focusout', handleBlur);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('mousedown', handleMouseDown);
});
