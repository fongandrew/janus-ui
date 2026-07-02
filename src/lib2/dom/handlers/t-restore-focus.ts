/**
 * t-restore-focus — records the focused element before an overlay opens and
 * restores it on close (§12.2.4). Uses beforetoggle/toggle (dialogs and
 * popovers both fire them at the §15 browser floor) plus dialog `close`.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const anchors = new WeakMap<Element, HTMLElement>();

function record(el: Element): void {
	const active = el.ownerDocument.activeElement;
	if (active instanceof HTMLElement && active !== el.ownerDocument.body) {
		anchors.set(el, active);
	}
}

function restore(el: Element): void {
	const anchor = anchors.get(el);
	anchors.delete(el);
	if (anchor?.isConnected) anchor.focus();
}

registerBehavior('t-restore-focus', {
	beforetoggle(el, ev: Event & { newState?: string }) {
		if (ev.target !== el) return;
		if (ev.newState === 'open') record(el);
	},

	toggle(el, ev: Event & { newState?: string }) {
		if (ev.target !== el) return;
		if (ev.newState === 'closed') restore(el);
	},

	close(el, ev: Event) {
		if (ev.target === el) restore(el);
	},
});

export function restoreFocus() {
	return { 'data-js': concat('t-restore-focus') };
}
