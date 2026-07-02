/**
 * t-empty (§12.2.4, aesthetic §19) — sets data-t-empty on a container whose
 * children render no visible content, driving the CSS empty-collapse rules.
 * Auto-observing via a per-element MutationObserver.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function hasVisibleContent(el: Element): boolean {
	if (el.children.length > 0) return true;
	return (el.textContent ?? '').trim().length > 0;
}

function update(el: Element): void {
	if (hasVisibleContent(el)) el.removeAttribute('data-t-empty');
	else el.setAttribute('data-t-empty', '');
}

const observers = new WeakMap<Element, MutationObserver>();

registerBehavior('t-empty', {
	mount(el) {
		update(el);
		if (observers.has(el) || typeof MutationObserver === 'undefined') return;
		const obs = new MutationObserver(() => update(el));
		obs.observe(el, { childList: true, characterData: true, subtree: true });
		observers.set(el, obs);
	},
});

export function empty() {
	return { 'data-js': concat('t-empty') };
}
