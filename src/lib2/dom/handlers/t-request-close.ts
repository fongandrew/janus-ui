/**
 * `t-request-close` — intercepts ESC (`<dialog>`'s `cancel` event, which
 * also covers `command="close"` invocation via `requestClose()`), backdrop
 * click, and light-dismiss (`[popover]`'s `beforetoggle` to `closed`).
 * A registered hook can cancel the close (e.g. "discard unsaved changes?").
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

type RequestCloseHook = () => boolean;

const hooks = new WeakMap<Element, Set<RequestCloseHook>>();
const bypass = new WeakSet<Element>();

/** Subscribe a programmatic hook to an element's request-close chain. Returns a cleanup. */
export function onRequestClose(el: Element, fn: RequestCloseHook): () => void {
	let set = hooks.get(el);
	if (!set) {
		set = new Set();
		hooks.set(el, set);
	}
	set.add(fn);
	return () => {
		hooks.get(el)?.delete(fn);
	};
}

function allow(el: Element): boolean {
	const set = hooks.get(el);
	if (!set) {
		return true;
	}
	for (const fn of set) {
		if (!fn()) {
			return false;
		}
	}
	return true;
}

/** Close a `<dialog>` while bypassing its request-close hook chain (so the hook doesn't re-fire and re-cancel). */
export function forceClose(dialog: HTMLDialogElement): void {
	bypass.add(dialog);
	dialog.close();
}

registerBehavior('t-request-close', {
	cancel(el, ev) {
		if (!(el instanceof HTMLDialogElement)) {
			return;
		}
		if (bypass.has(el)) {
			bypass.delete(el);
			return;
		}
		if (!allow(el)) {
			ev.preventDefault();
		}
	},
	click(el, ev) {
		if (el instanceof HTMLDialogElement && el.open && ev.target === el) {
			// A click directly on the <dialog> element (not a descendant) is the
			// backdrop click case for a dialog shown via showModal().
			if (allow(el)) {
				el.close();
			}
		}
	},
	beforetoggle(el, ev) {
		if (!el.hasAttribute('popover')) {
			return;
		}
		if ((ev as ToggleEvent).newState !== 'closed') {
			return;
		}
		if (bypass.has(el)) {
			bypass.delete(el);
			return;
		}
		if (!allow(el)) {
			ev.preventDefault();
		}
	},
});

/** Producer: opts an element into `t-request-close`. */
export function requestClose(): { 'data-js': AttrValue } {
	return { 'data-js': concat('t-request-close') };
}
