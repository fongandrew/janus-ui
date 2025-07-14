import { elmDoc, elmWin } from '~/lib/utility/multi-view';

/**
 * Get the immediately scrollable parent of an element
 */
export function getScrollableParent(element: HTMLElement | null): HTMLElement | null {
	const document = elmDoc(element);
	const window = elmWin(element);
	if (!document || !window) return null;

	while (element) {
		// Return document.scrollingElement for the <html> element
		if (element === document.documentElement) {
			return (document.scrollingElement || document.documentElement) as HTMLElement;
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

/**
 * Get the immediately scrollable parent of an element on which we should add
 * the scroll listener
 */
export function getScrollListenerParent(element: HTMLElement | null) {
	const elm = getScrollableParent(element);
	if (
		elm &&
		(elm === elm?.ownerDocument?.scrollingElement ||
			elm === elm?.ownerDocument?.documentElement)
	) {
		return elm.ownerDocument;
	}
	return elm;
}
