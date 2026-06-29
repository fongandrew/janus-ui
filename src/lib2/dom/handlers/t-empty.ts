/**
 * `t-empty` — mark containers with no visible content (§12.2.4, Aesthetic spec §19).
 *
 * Sets the `data-t-empty` attribute on a container whose children render no visible
 * content (empty text, no element children). Drives CSS empty-collapse rules
 * (`.c-alert:has([data-t-empty]) { display: none }`) so error / alert containers
 * don't leave dead vertical space.
 *
 * Self-observing: the `mount` hook wires a `MutationObserver` per container that
 * keeps the flag in sync.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const observers = new WeakMap<Element, MutationObserver>();

function isEmpty(el: Element): boolean {
	return (el.textContent ?? '').trim().length === 0 && el.children.length === 0;
}

function sync(el: Element): void {
	el.toggleAttribute('data-t-empty', isEmpty(el));
}

registerBehavior('t-empty', {
	mount(el) {
		sync(el);
		if (observers.has(el) || typeof MutationObserver === 'undefined') return;
		const observer = new MutationObserver(() => sync(el));
		observer.observe(el, { childList: true, characterData: true, subtree: true });
		observers.set(el, observer);
	},
});

/** Producer: collapse this container when it has no visible content. */
export function empty() {
	return { 'data-js': concat('t-empty') };
}
