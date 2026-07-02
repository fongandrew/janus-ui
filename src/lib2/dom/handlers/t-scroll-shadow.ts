/**
 * t-scroll-shadow (§12.2.4, aesthetic §16) — sets data-scroll-top when scrolled
 * to the top edge and data-scroll-bottom when at the bottom, so CSS can toggle
 * the scroll-edge shadows on modal/drawer content.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function update(el: Element): void {
	const target = el as HTMLElement;
	const atTop = target.scrollTop <= 1;
	const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
	target.toggleAttribute('data-scroll-top', atTop);
	target.toggleAttribute('data-scroll-bottom', atBottom);
}

registerBehavior('t-scroll-shadow', {
	mount(el) {
		update(el);
		el.addEventListener('scroll', () => update(el), { passive: true });
	},
	scroll(el) {
		update(el);
	},
});

export function scrollShadow() {
	return { 'data-js': concat('t-scroll-shadow') };
}
