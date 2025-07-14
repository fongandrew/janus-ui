/**
 * Checks if an element is visible / not-hidden. This is not a viewport check but more to
 * guard against elements being hidden by CSS (e.g. display: none, visibility: hidden,
 * or inside popovers and modals).
 */
export function isVisible(elm: Element | null): boolean {
	if (!elm) return false;
	const rect = elm.getBoundingClientRect();
	return !!(rect?.height && rect?.width);
}
