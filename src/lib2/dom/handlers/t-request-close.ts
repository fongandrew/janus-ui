/**
 * `t-request-close` — intercept ESC, backdrop-click, and `commandfor` close (§12.2.4).
 *
 * Each registered hook returns a boolean to allow / cancel the close (e.g. a "discard
 * unsaved changes?" prompt). Also exports `onRequestClose` (subscribe a programmatic
 * hook to the same chain) and `forceClose` (close while bypassing the chain — the
 * recursion guard the speed bump in §12.1 relies on).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

type CloseHook = () => boolean;

const hooks = new WeakMap<Element, Set<CloseHook>>();
const forcing = new WeakSet<Element>();

/** Subscribe a programmatic hook to an element's requestClose chain. Returns cleanup. */
export function onRequestClose(el: Element, fn: CloseHook): () => void {
	let set = hooks.get(el);
	if (!set) hooks.set(el, (set = new Set()));
	set.add(fn);
	return () => {
		hooks.get(el)?.delete(fn);
	};
}

/** Run the chain. Returns true if every hook allows the close. */
function allowClose(el: Element): boolean {
	const set = hooks.get(el);
	if (!set) return true;
	for (const fn of set) {
		if (fn() === false) return false;
	}
	return true;
}

/** Close a dialog while bypassing the requestClose chain (recursion guard). */
export function forceClose(dialog: HTMLDialogElement): void {
	forcing.add(dialog);
	try {
		dialog.close();
	} finally {
		forcing.delete(dialog);
	}
}

registerBehavior('t-request-close', {
	// Native dialog ESC (and dialog.requestClose()) fire a cancelable `cancel`.
	cancel(el, ev) {
		if (forcing.has(el)) return;
		if (!allowClose(el)) ev.preventDefault();
	},
	// Backdrop click on a modal <dialog> reports the dialog itself as the target.
	click(el, ev) {
		if (ev.target !== el) return;
		if (el instanceof HTMLDialogElement) {
			if (allowClose(el)) forceClose(el);
		}
	},
	// Popover light-dismiss.
	beforetoggle(el, ev) {
		if (forcing.has(el)) return;
		if ((ev as ToggleEvent).newState !== 'closed') return;
		if (!allowClose(el)) ev.preventDefault();
	},
});

/** Producer: opt an overlay into managed close handling. */
export function requestClose() {
	return { 'data-js': concat('t-request-close') };
}
