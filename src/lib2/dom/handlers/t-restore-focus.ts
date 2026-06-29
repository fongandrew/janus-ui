/**
 * `t-restore-focus` — record focus before an overlay opens, restore it on close (§12.2.4).
 *
 * Pairs with dialogs / popovers / menus.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const previous = new WeakMap<Element, HTMLElement>();

function record(el: Element): void {
	const active = el.ownerDocument.activeElement;
	if (active instanceof HTMLElement && active !== el && !el.contains(active)) {
		previous.set(el, active);
	}
}

function restore(el: Element): void {
	const target = previous.get(el);
	previous.delete(el);
	if (target && target.isConnected) target.focus();
}

registerBehavior('t-restore-focus', {
	mount(el) {
		// Capture the opener if the overlay is already open at mount.
		if ((el as HTMLDialogElement).open || el.matches(':popover-open')) record(el);
	},
	// Dialog open/close.
	close(el) {
		restore(el);
	},
	// Popover open/close.
	beforetoggle(el, ev) {
		const state = (ev as ToggleEvent).newState;
		if (state === 'open') record(el);
	},
	toggle(el, ev) {
		if ((ev as ToggleEvent).newState === 'closed') restore(el);
	},
});

/** Producer: restore focus to the opener when this overlay closes. */
export function restoreFocus() {
	return { 'data-js': concat('t-restore-focus') };
}
