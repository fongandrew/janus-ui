/**
 * t-focus-trap (§12.2.4) — constrains Tab / Shift+Tab to descendants. Only
 * needed for non-<dialog> overlays; native <dialog> traps focus for free.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { focusables } from '~/lib2/dom/handlers/focusables';

registerBehavior('t-focus-trap', {
	keydown(el, ev) {
		const e = ev as KeyboardEvent;
		if (e.key !== 'Tab') return;
		const list = focusables(el);
		if (!list.length) return;
		const first = list[0]!;
		const last = list[list.length - 1]!;
		const active = document.activeElement;
		if (e.shiftKey && active === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	},
});

export function focusTrap() {
	return { 'data-js': concat('t-focus-trap') };
}
