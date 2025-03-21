import { createHandler } from '~/shared/utility/callback-attrs/events';

/**
 * Highlight with current aria-current on click. This isn't quite correct within the
 * context of how we're actually using sidebar links (anchor tag navigation), but it's
 * useful for testing.
 */
export const sidebarHighlight = createHandler('click', '$p-sidebar__link', function (event) {
	const target = event.target as HTMLElement;
	const closest = target.closest<HTMLElement>('a,button');

	const nav = event.currentTarget as HTMLElement;
	const prev = nav.querySelector<HTMLElement>('[aria-current]');

	if (closest !== prev) {
		prev?.removeAttribute('aria-current');
		closest?.setAttribute('aria-current', 'page');
	}
});
