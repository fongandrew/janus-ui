import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

const savedFocus = new WeakMap<Element, Element | null>();

registerBehavior('t-restore-focus', {
	mount(el) {
		savedFocus.set(el, document.activeElement);
	},

	close(el) {
		const prev = savedFocus.get(el);
		if (prev instanceof HTMLElement) {
			requestAnimationFrame(() => prev.focus());
		}
		savedFocus.delete(el);
	},

	toggle(el, ev) {
		const event = ev as ToggleEvent;
		if (event.newState === 'open') {
			savedFocus.set(el, document.activeElement);
		} else if (event.newState === 'closed') {
			const prev = savedFocus.get(el);
			if (prev instanceof HTMLElement) {
				requestAnimationFrame(() => prev.focus());
			}
			savedFocus.delete(el);
		}
	},
});

export function restoreFocus() {
	return { 'data-js': concat('t-restore-focus') };
}
