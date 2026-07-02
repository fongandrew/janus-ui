/**
 * t-open-tab (§12.2.4) — the smallest illustrative behavior: focuses a target
 * element on click; reads the target id from a sibling data-target attribute.
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-open-tab', {
	click(el) {
		const panelId = el.getAttribute('data-target');
		if (panelId) document.getElementById(panelId)?.focus();
	},
});

export function openTab(panelId: string) {
	return {
		'data-js': concat('t-open-tab'),
		'data-target': only(panelId),
	};
}
