import { data } from '~/shared/utility/magic-strings';

/**
 * Event listener that sets data attributes when scrolling to the top or bottom
 * of a scrollable area.
 */
export function updateScrollState(event: { target: EventTarget | null }) {
	const content = event.target as HTMLElement;
	if (!content) return;

	content.toggleAttribute(updateScrollState.SCROLLED_TO_TOP_ATTR, content.scrollTop === 0);
	content.toggleAttribute(
		updateScrollState.SCROLLED_TO_BOTTOM_ATTR,
		content.scrollHeight - content.scrollTop - 2 <= content.clientHeight,
	);
}
updateScrollState.SCROLLED_TO_TOP_ATTR = data('scroll__top');
updateScrollState.SCROLLED_TO_BOTTOM_ATTR = data('scroll__bottom');
