/**
 * t-scroll-shadow — scroll-edge sentinels (§12.2.4, aesthetic spec §16).
 * Sets data-scroll-top when the element is scrolled to its top edge and
 * data-scroll-bottom at the bottom; the CSS shows --v-shadow-inner-top /
 * -bottom when the matching sentinel is ABSENT.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const EPSILON = 1;

function update(el: Element): void {
	const atTop = el.scrollTop <= EPSILON;
	const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - EPSILON;
	if (atTop) el.setAttribute('data-scroll-top', '');
	else el.removeAttribute('data-scroll-top');
	if (atBottom) el.setAttribute('data-scroll-bottom', '');
	else el.removeAttribute('data-scroll-bottom');
}

registerBehavior('t-scroll-shadow', {
	mount: update,
	// scroll doesn't bubble, but the capture-phase document listener still
	// descends to the scrolling element.
	scroll(el) {
		update(el);
	},
	// Dialog/popover opening changes scrollability — re-measure.
	toggle(el) {
		update(el);
	},
});

export function scrollShadow() {
	return { 'data-js': concat('t-scroll-shadow') };
}
