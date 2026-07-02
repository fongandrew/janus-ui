/**
 * t-empty — sets data-t-empty on containers whose children render no visible
 * content (§12.2.4, aesthetic spec §19). Drives the CSS empty-collapse rules
 * (.c-alert:has([data-t-empty]) { display: none }) so forms don't carry dead
 * vertical bands. Auto-observing: re-checks on subtree mutations.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const observed = new WeakSet<Element>();

function isEmpty(el: Element): boolean {
	if ((el.textContent ?? '').trim() !== '') return false;
	return !el.querySelector('img, svg, video, canvas, input, button, select, textarea');
}

function update(el: Element): void {
	if (isEmpty(el)) el.setAttribute('data-t-empty', '');
	else el.removeAttribute('data-t-empty');
}

registerBehavior('t-empty', {
	mount(el) {
		update(el);
		if (observed.has(el)) return;
		observed.add(el);
		new MutationObserver(() => update(el)).observe(el, {
			childList: true,
			characterData: true,
			subtree: true,
		});
	},
});

export function emptyCollapse() {
	return { 'data-js': concat('t-empty') };
}
