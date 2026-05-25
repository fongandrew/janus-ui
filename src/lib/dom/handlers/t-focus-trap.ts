import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

function getFocusables(container: Element): HTMLElement[] {
	const selector =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
	return Array.from(container.querySelectorAll(selector));
}

registerBehavior('t-focus-trap', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		if (event.key !== 'Tab') return;

		const focusables = getFocusables(el);
		if (focusables.length === 0) return;

		const first = focusables[0]!;
		const last = focusables[focusables.length - 1]!;

		if (event.shiftKey) {
			if (document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	},
});

export function focusTrap() {
	return { 'data-js': concat('t-focus-trap') };
}
