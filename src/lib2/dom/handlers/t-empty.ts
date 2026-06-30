/**
 * `t-empty` — sets `data-t-empty` on a container whose children render no
 * visible content (no element children, no non-whitespace text). Drives
 * CSS empty-collapse rules (`.c-alert:has([data-t-empty]) { display: none }`).
 * Auto-observing: a `MutationObserver` keeps the attribute current as
 * children are added/removed.
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function isEmpty(el: Element): boolean {
	for (const node of el.childNodes) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			return false;
		}
		if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim()) {
			return false;
		}
	}
	return true;
}

function update(el: Element): void {
	el.toggleAttribute('data-t-empty', isEmpty(el));
}

const observers = new WeakMap<Element, MutationObserver>();

registerBehavior('t-empty', {
	mount(el) {
		update(el);
		if (observers.has(el)) {
			return;
		}
		const observer = new MutationObserver(() => update(el));
		observer.observe(el, { childList: true, characterData: true, subtree: true });
		observers.set(el, observer);
	},
});

/** Producer: opts a container into `t-empty`. */
export function empty(): Record<string, AttrValue> {
	return { 'data-js': concat('t-empty') };
}
