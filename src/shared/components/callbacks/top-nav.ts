import { createMounter } from '~/shared/utility/callback-attrs/mount';
import { getScrollableParent } from '~/shared/utility/get-scrollable-parent';
import { createMagicProp } from '~/shared/utility/magic-prop';
import { elmWin } from '~/shared/utility/multi-view';
import { onUnmount } from '~/shared/utility/unmount-observer';

/** Magic data attr to set to signal we should hide top nav on scroll */
export const TOP_NAV_SCROLL_HIDE_ATTR = 'data-c-top-nav__scroll-hide';

/** Magic attribute to label the top nav layout element (since) */

/** Magic prop for memoizing memoized height (and measurement time) of header */
const [memoizedHeight, setMemoizedHeight] = createMagicProp<[number, number]>();

/** Magic prop for tracking last scroll top of container element */
const [lastScrollTop, setLastScrollTop] = createMagicProp<number>();

/** Magic prop for tracking last scroll event of container element */
const [lastScrollEvent, setLastScrollEvent] = createMagicProp<number>();

/** Threshold bewtween scroll events to consider "real" scrolling */
const TOP_NAV_SCROLL_THRESHOLD = 500;

/**
 * Attach scroll handler to scrollable parent of top nav layout
 */
export const topNavScroll = createMounter('modal__open-scroll-state', (elm) => {
	const parent = getScrollableParent(elm);
	if (!parent) return;

	const onScroll = handleScroll.bind(null, elm);
	parent.addEventListener('scroll', onScroll, { passive: true });
	onUnmount(elm, () => {
		parent.removeEventListener('scroll', onScroll);
	});
});

/** Get height of header */
const getHeaderHeight = (header: HTMLElement) => {
	const lastMeasure = memoizedHeight(header);
	if (lastMeasure) {
		const [measure, time] = lastMeasure;
		if (Date.now() - time < 1000) return measure;
		return measure;
	}

	const height = header.getBoundingClientRect().height;
	setMemoizedHeight(header, [height, Date.now()]);
	return height;
};

/**
 * Scroll handler to attach to scrollable area in top nav layout.
 * Sets hidden state on top nav based on scroll direction.
 */
function handleScroll(topNavLayout: HTMLElement, e: Event) {
	const container = e.target as HTMLElement | null;
	if (!container) return;

	const header = topNavLayout.querySelector('header');
	if (!header) return;

	// This basically forces us to have two scroll events in quick succession
	// to trigger the header. This is to avoid "fake" scrolling triggered by
	// navigation, progrmatic scrolling, etc.
	const lastEvent = lastScrollEvent(container) ?? 0;
	if (Date.now() - lastEvent > TOP_NAV_SCROLL_THRESHOLD) {
		setLastScrollEvent(container, Date.now());
		return;
	}

	const headerHeight = getHeaderHeight(header);
	const scrollDiff = container.scrollTop - (lastScrollTop(container) ?? 0);

	if (Math.abs(scrollDiff) < headerHeight) return;

	// Safari can have negative scrollTop from bounceback
	setLastScrollTop(container, Math.max(container.scrollTop, 0));
	setLastScrollEvent(container, Date.now());

	header.toggleAttribute(TOP_NAV_SCROLL_HIDE_ATTR, scrollDiff > 0);
}

/**
 * Stuff like suspense callback messes up scroll position -- we can fix by
 * forcing the scroll (and recalc) before suspense unmounts everything though.
 */
export function resetScrollPosition(elm: HTMLElement) {
	// Wrap in requestAnimationFrame to ensure header has chance to mount before we reset
	elmWin(elm)?.requestAnimationFrame(() => {
		const parent = getScrollableParent(elm);
		if (!parent) return;

		setLastScrollTop(parent, parent.scrollTop);
		const header = elm.querySelector('header');
		header?.toggleAttribute(TOP_NAV_SCROLL_HIDE_ATTR, false);
	});
}
