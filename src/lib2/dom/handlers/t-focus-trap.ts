/**
 * t-focus-trap — constrains Tab/Shift+Tab to descendants (§12.2.4). Only
 * needed for non-<dialog> overlays; native <dialog> traps for free.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { focusables } from '~/lib2/dom/focusables';

registerBehavior('t-focus-trap', {
	keydown(el, ev: KeyboardEvent) {
		if (ev.key !== 'Tab') return;
		const items = focusables(el);
		if (!items.length) return;
		const first = items[0]!;
		const last = items[items.length - 1]!;
		const active = el.ownerDocument.activeElement;
		if (ev.shiftKey && active === first) {
			ev.preventDefault();
			last.focus();
		} else if (!ev.shiftKey && active === last) {
			ev.preventDefault();
			first.focus();
		}
	},
});

export function focusTrap() {
	return { 'data-js': concat('t-focus-trap') };
}
