import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

function updateScrollAttrs(el: Element): void {
	const scrollTop = el.scrollTop;
	const scrollBottom = el.scrollHeight - el.clientHeight - el.scrollTop;

	if (scrollTop <= 1) {
		el.setAttribute('data-scroll-top', '');
	} else {
		el.removeAttribute('data-scroll-top');
	}

	if (scrollBottom <= 1) {
		el.setAttribute('data-scroll-bottom', '');
	} else {
		el.removeAttribute('data-scroll-bottom');
	}
}

registerBehavior('t-scroll-shadow', {
	mount(el) {
		updateScrollAttrs(el);
		el.addEventListener('scroll', () => updateScrollAttrs(el), { passive: true });
	},

	scroll(el) {
		updateScrollAttrs(el);
	},
});

export function scrollShadow() {
	return { 'data-js': concat('t-scroll-shadow') };
}
