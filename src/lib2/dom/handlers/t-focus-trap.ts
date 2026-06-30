/**
 * `t-focus-trap` — constrains Tab/Shift+Tab to descendants. Only needed for
 * non-`<dialog>` overlays; native `<dialog>` traps focus for free.
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

function focusables(el: Element): HTMLElement[] {
	return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(item) =>
			item.tabIndex >= 0 &&
			!(item as HTMLButtonElement).disabled &&
			item.getAttribute('aria-disabled') !== 'true',
	);
}

registerBehavior('t-focus-trap', {
	keydown(el, ev) {
		if (ev.key !== 'Tab') {
			return;
		}
		const list = focusables(el);
		if (list.length === 0) {
			return;
		}
		const first = list[0]!;
		const last = list[list.length - 1]!;
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

/** Producer: opts a container into `t-focus-trap`. */
export function focusTrap(): Record<string, AttrValue> {
	return { 'data-js': concat('t-focus-trap') };
}
