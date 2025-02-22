import { elmDoc, elmWin } from '~/shared/utility/multi-view';

/**
 * Get the immediately scrollable parent of an element
 */
export function getScrollableParent(element: HTMLElement | null): Element | null {
	const document = elmDoc(element);
	const window = elmWin(element);
	if (!document || !window) return null;

	while (element) {
		// Return document.scrollingElement for the <html> element
		if (element === document.documentElement) {
			return document.scrollingElement || document.documentElement;
		}

		// Check if element itself is scrollable
		const style = window.getComputedStyle(element);
		const overflowRegex = /(auto|scroll|overlay)/;
		const isScrollable =
			overflowRegex.test(style.overflow) ||
			overflowRegex.test(style.overflowY) ||
			overflowRegex.test(style.overflowX);
		if (isScrollable) {
			return element;
		}

		// Move to the parent element
		element = element.parentElement;
	}

	return null;
}
