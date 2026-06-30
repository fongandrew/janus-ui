/**
 * `t-restore-focus` — records the active element before `el` opens;
 * restores it on close. Pairs with popovers / menus / dialogs.
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const recorded = new WeakMap<Element, HTMLElement | null>();

function recordIfOpening(el: Element): void {
	if (!recorded.has(el)) {
		recorded.set(el, el.ownerDocument.activeElement as HTMLElement | null);
	}
}

function restore(el: Element): void {
	const prior = recorded.get(el);
	recorded.delete(el);
	if (prior && el.ownerDocument.contains(prior)) {
		prior.focus();
	}
}

registerBehavior('t-restore-focus', {
	mount(el) {
		const isOpen = (el as HTMLDialogElement).open === true || el.matches(':popover-open');
		if (isOpen) {
			recordIfOpening(el);
		}
	},
	toggle(el, ev) {
		const newState = (ev as ToggleEvent).newState;
		if (newState === 'open') {
			recordIfOpening(el);
		} else if (newState === 'closed') {
			restore(el);
		}
	},
	close(el) {
		restore(el);
	},
});

/** Producer: opts an overlay element into `t-restore-focus`. */
export function restoreFocus(): Record<string, AttrValue> {
	return { 'data-js': concat('t-restore-focus') };
}
