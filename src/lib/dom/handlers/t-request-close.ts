import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

type CloseHook = () => boolean;
const hookMap = new WeakMap<Element, CloseHook[]>();
const forceCloseSet = new WeakSet<Element>();

export function onRequestClose(el: Element, fn: CloseHook): () => void {
	const hooks = hookMap.get(el) ?? [];
	hooks.push(fn);
	hookMap.set(el, hooks);
	return () => {
		const list = hookMap.get(el);
		if (list) {
			const idx = list.indexOf(fn);
			if (idx >= 0) list.splice(idx, 1);
		}
	};
}

export function forceClose(dialog: HTMLDialogElement): void {
	forceCloseSet.add(dialog);
	dialog.close();
	forceCloseSet.delete(dialog);
}

function tryClose(el: Element): void {
	if (forceCloseSet.has(el)) return;

	const hooks = hookMap.get(el);
	if (hooks) {
		for (const hook of hooks) {
			if (!hook()) return;
		}
	}

	if (el instanceof HTMLDialogElement) {
		el.close();
	} else if (el.hasAttribute('popover')) {
		(el as HTMLElement).hidePopover();
	}
}

registerBehavior('t-request-close', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			tryClose(el);
		}
	},

	click(el, ev) {
		const target = ev.target as Element;
		if (target === el) {
			tryClose(el);
		}
	},
});

export function requestClose() {
	return {
		'data-js': concat('t-request-close'),
	};
}
