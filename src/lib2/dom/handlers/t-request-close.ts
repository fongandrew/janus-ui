/**
 * t-request-close (§12.2.4) — intercepts ESC, outside-click, and `commandfor
 * close` so a close can be vetoed (e.g. "discard unsaved changes?"). Exposes
 * onRequestClose (subscribe a programmatic hook) and forceClose (close while
 * bypassing the chain — the speed-bump recursion guard).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

type CloseHook = () => boolean;

const hooks = new WeakMap<Element, Set<CloseHook>>();
const bypassing = new WeakSet<Element>();

/** Subscribe a hook to an element's requestClose chain. Returns cleanup. */
export function onRequestClose(el: Element, fn: CloseHook): () => void {
	let set = hooks.get(el);
	if (!set) {
		set = new Set();
		hooks.set(el, set);
	}
	set.add(fn);
	return () => set!.delete(fn);
}

/** True if every hook allows the close. */
function allowsClose(el: Element): boolean {
	const set = hooks.get(el);
	if (!set) return true;
	for (const fn of set) if (!fn()) return false;
	return true;
}

/** Close a dialog while bypassing the requestClose chain. */
export function forceClose(dialog: HTMLDialogElement): void {
	bypassing.add(dialog);
	dialog.close();
	bypassing.delete(dialog);
}

/** Run the requestClose chain for a dialog; closes only if every hook allows. */
export function tryClose(dialog: HTMLDialogElement): void {
	if (allowsClose(dialog)) forceClose(dialog);
}

function requestCloseDialog(dialog: HTMLDialogElement): void {
	tryClose(dialog);
}

registerBehavior('t-request-close', {
	// ESC on a <dialog> fires `cancel` before `close`; veto by intercepting it.
	cancel(el, ev) {
		if (!(el instanceof HTMLDialogElement)) return;
		ev.preventDefault();
		requestCloseDialog(el);
	},
	// Outside-click (backdrop) on a dialog: the click target is the dialog itself.
	click(el, ev) {
		if (!(el instanceof HTMLDialogElement)) return;
		if (ev.target === el) requestCloseDialog(el);
	},
});

export function requestClose() {
	return { 'data-js': concat('t-request-close') };
}
