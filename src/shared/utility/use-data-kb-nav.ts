import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { evtDoc } from '~/shared/utility/multi-view';

export const KB_NAV_ATTR = 'data-kb-nav';

let isKeyboardNavigating = false;
let prevX: number | null = null;
let prevY: number | null = null;

/** Is keyboard navigation currently active? */
export function isKeyboardNavigatingActive() {
	return isKeyboardNavigating;
}

/** Handler for keydown events */
export function handleKeyDown(event: KeyboardEvent) {
	if (isKeyboardNavigating) return;
	switch (event.key) {
		case 'ArrowUp':
		case 'ArrowDown':
		case 'ArrowLeft':
		case 'ArrowRight':
		case 'Tab': {
			isKeyboardNavigating = true;
			evtDoc(event)?.body.setAttribute(KB_NAV_ATTR, 'true');
		}
	}
}

/** Handler for mouseover events */
export function handleMouseOver(event: MouseEvent) {
	if (!isKeyboardNavigating) return;

	// Mouseover can trigger if something appears under mouse (like popover)
	// without mouse moving, which shouldn't count. Also, if we decide to implement
	// some min threshold or distance check in the future, we can do that here.
	if (event.pageX === prevX && event.pageY === prevY) return;

	isKeyboardNavigating = false;
	prevX = event.pageX;
	prevY = event.pageY;
	evtDoc(event)?.body.setAttribute(KB_NAV_ATTR, 'false');
}

/** Register event listeners */
registerDocumentSetup((document) => {
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('mouseover', handleMouseOver);
	document.body.setAttribute(KB_NAV_ATTR, 'false');
});
