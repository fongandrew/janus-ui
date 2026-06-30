/**
 * `t-scroll-shadow` — observes scroll position of an element. Sets
 * `data-scroll-top` when scrolled to the top edge, `data-scroll-bottom`
 * when at the bottom edge. CSS shows/hides `--v-shadow-inner-top` /
 * `--v-shadow-inner-bottom` off these. Used by modal/drawer scrollable
 * content (§10.1's `c-modal`).
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function update(el: Element): void {
	const atTop = el.scrollTop <= 0;
	const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
	el.toggleAttribute('data-scroll-top', atTop);
	el.toggleAttribute('data-scroll-bottom', atBottom);
}

registerBehavior('t-scroll-shadow', {
	mount: update,
	scroll: update,
});

/** Producer: opts a scroll container into `t-scroll-shadow`. */
export function scrollShadow(): Record<string, AttrValue> {
	return { 'data-js': concat('t-scroll-shadow') };
}
