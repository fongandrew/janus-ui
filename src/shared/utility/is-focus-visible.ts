import { registerDocumentSetup } from '~/shared/utility/document-setup';

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

/** Handler to update focus visibility */
export function handleFocus(event: FocusEvent) {
	focusVisible = !!(event.target as HTMLElement | null)?.matches(':focus-visible');
}

/** Handler for when blur removes focus */
export function handleBlur() {
	// This fires if focusing but if refocusing on another element, the focus handler
	// above should handle it.
	focusVisible = false;
}

/** Handler for whenever focus event happens */
registerDocumentSetup((document) => {
	// Use focusin / focusout instead of focus / blur to capture all focus changes
	// because they propagate up to the document
	document.addEventListener('focusin', handleFocus);
	document.addEventListener('focusout', handleBlur);
});
