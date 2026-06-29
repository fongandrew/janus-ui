/**
 * `t-scroll-shadow` — track scroll position for scroll-edge shadows (§12.2.4,
 * Aesthetic spec §16).
 *
 * Sets `data-scroll-top` when the element is scrolled to its top edge and
 * `data-scroll-bottom` when at the bottom. CSS uses these to show / hide
 * `--v-shadow-inner-top` / `--v-shadow-inner-bottom` on modal / drawer content.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function sync(el: HTMLElement): void {
	const atTop = el.scrollTop <= 0;
	const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
	el.toggleAttribute('data-scroll-top', atTop);
	el.toggleAttribute('data-scroll-bottom', atBottom);
}

registerBehavior('t-scroll-shadow', {
	mount(el) {
		sync(el);
	},
	scroll(el) {
		sync(el);
	},
});

/** Producer: emit scroll-edge state for an overflow container. */
export function scrollShadow() {
	return { 'data-js': concat('t-scroll-shadow') };
}
