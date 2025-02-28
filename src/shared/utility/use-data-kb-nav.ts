import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { evtDoc } from '~/shared/utility/multi-view';

export const KB_NAV_ATTR = 'data-kb-nav';

let isKeyboardNavigating = false;

/** Is keyboard navigation currently active? */
export function isKeyboardNavigatingActive() {
	return isKeyboardNavigating;
}

/** Handler for keydown events */
export function handleKeyDown(event: KeyboardEvent) {
	if (isKeyboardNavigating) return;
	isKeyboardNavigating = true;
	evtDoc(event)?.body.setAttribute(KB_NAV_ATTR, 'true');
}

/** Handler for mousemove events */
export function handleMouseMove(event: MouseEvent) {
	if (!isKeyboardNavigating) return;
	isKeyboardNavigating = false;
	evtDoc(event)?.body.setAttribute(KB_NAV_ATTR, 'false');
}

/** Register event listeners */
registerDocumentSetup((document) => {
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('mousemove', handleMouseMove);
	document.body.setAttribute(KB_NAV_ATTR, 'false');
});
