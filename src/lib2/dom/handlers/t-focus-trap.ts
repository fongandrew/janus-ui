/**
 * `t-focus-trap` — constrain Tab / Shift+Tab to descendants (§12.2.4).
 *
 * Only needed for non-`<dialog>` overlays — a native modal `<dialog>` traps focus
 * for free.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { focusables } from '~/lib2/dom/focusables';

registerBehavior('t-focus-trap', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		if (event.key !== 'Tab') return;
		const items = focusables(el);
		if (!items.length) return;
		const first = items[0]!;
		const last = items[items.length - 1]!;
		const active = el.ownerDocument.activeElement;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	},
});

/** Producer: trap Tab focus within this element. */
export function focusTrap() {
	return { 'data-js': concat('t-focus-trap') };
}
