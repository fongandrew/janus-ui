import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

const BUFFER_TIMEOUT = 500;
const buffers = new WeakMap<Element, { text: string; timer: ReturnType<typeof setTimeout> }>();

function getItems(el: Element): HTMLElement[] {
	return Array.from(el.querySelectorAll('[role="menuitem"], [role="option"], [role="tab"]'));
}

registerBehavior('t-typeahead-filter', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;

		event.preventDefault();
		const existing = buffers.get(el);
		if (existing) {
			clearTimeout(existing.timer);
			existing.text += event.key.toLowerCase();
			existing.timer = setTimeout(() => buffers.delete(el), BUFFER_TIMEOUT);
		} else {
			const timer = setTimeout(() => buffers.delete(el), BUFFER_TIMEOUT);
			buffers.set(el, { text: event.key.toLowerCase(), timer });
		}

		const buffer = buffers.get(el)!.text;
		const items = getItems(el);
		const match = items.find(
			(item) => item.textContent?.trim().toLowerCase().startsWith(buffer),
		);
		if (match) {
			match.focus();
		}
	},
});

export function typeaheadFilter() {
	return { 'data-js': concat('t-typeahead-filter') };
}
