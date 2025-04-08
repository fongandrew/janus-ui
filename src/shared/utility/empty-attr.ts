export const EMPTY_ATTR = 'data-t-empty';

/** Convenience function to assign during initial render based on content */
export const emptyAttr = (content?: any) => ({
	[EMPTY_ATTR]: !content || content.length === 0 ? '' : null,
});

/**
 * Toggles a data attribute to indicate if the element is empty or not.
 * This is a workaround for a Safari bug around the :has(:empty) selector.
 * See :has(:empty) selector (https://bugs.webkit.org/show_bug.cgi?id=239868).
 */
export function toggleEmptyAttr(element: HTMLElement) {
	element.toggleAttribute(EMPTY_ATTR, element.matches(':empty'));
}
