/**
 * t-request-close — intercepts ESC, outside-click, and `commandfor close`
 * invocations on dialogs/popovers (§12.2.4). Hooks subscribed via
 * onRequestClose() can veto a close ("discard unsaved changes?");
 * forceClose() bypasses the chain (the speed bump's recursion guard).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { jsAttr } from '~/lib2/dom/config';
import { registerBehavior } from '~/lib2/dom/dispatch';

type CloseHook = () => boolean;

const hooks = new WeakMap<Element, Set<CloseHook>>();
const bypass = new WeakSet<Element>();

/** Subscribe a programmatic hook to an element's request-close chain. */
export function onRequestClose(el: Element, fn: CloseHook): () => void {
	let set = hooks.get(el);
	if (!set) {
		set = new Set();
		hooks.set(el, set);
	}
	set.add(fn);
	return () => set.delete(fn);
}

/** Run the chain. Returns true when every hook allows the close. */
function runHooks(el: Element): boolean {
	if (bypass.has(el)) return true;
	const set = hooks.get(el);
	if (!set) return true;
	for (const fn of set) {
		if (!fn()) return false;
	}
	return true;
}

/** Close a dialog while bypassing the request-close chain. */
export function forceClose(dialog: HTMLDialogElement): void {
	bypass.add(dialog);
	try {
		dialog.close();
	} finally {
		bypass.delete(dialog);
	}
}

/** Request a close through the chain; closes when allowed. Returns whether it closed. */
export function requestClose(el: Element): boolean {
	if (!runHooks(el)) return false;
	if (el instanceof HTMLDialogElement) el.close();
	else if ('hidePopover' in el) (el as HTMLElement).hidePopover();
	return true;
}

function hasBehavior(el: Element): boolean {
	return (el.getAttribute(jsAttr()) ?? '').split(/\s+/).includes('t-request-close');
}

registerBehavior('t-request-close', {
	/*
	 * ESC on a <dialog> fires a cancelable `cancel` event — veto it when a
	 * hook says no. (cancel doesn't bubble, but the capture-phase document
	 * listener still descends to the target.)
	 */
	cancel(el, ev: Event) {
		if (ev.target !== el) return;
		if (!runHooks(el)) ev.preventDefault();
	},

	/*
	 * Outside-click: a click on the backdrop reports the dialog itself as
	 * the target with coordinates outside the dialog's box.
	 */
	click(el, ev: MouseEvent) {
		if (!(el instanceof HTMLDialogElement) || ev.target !== el || !el.open) return;
		const rect = el.getBoundingClientRect();
		const inside =
			ev.clientX >= rect.left &&
			ev.clientX <= rect.right &&
			ev.clientY >= rect.top &&
			ev.clientY <= rect.bottom;
		if (!inside) requestClose(el);
	},

	/*
	 * commandfor close: the `command` event fires on the invokee. Veto by
	 * preventDefault when a hook cancels.
	 */
	command(el, ev: Event & { command?: string }) {
		if (ev.target !== el) return;
		if (
			ev.command === 'close' ||
			ev.command === 'hide-popover' ||
			ev.command === 'toggle-popover'
		) {
			if (!runHooks(el)) ev.preventDefault();
		}
	},
});

/** Producer: spread onto the dialog / popover element. */
export function requestCloseAttrs() {
	return { 'data-js': concat('t-request-close') };
}

export { hasBehavior as hasRequestClose };
