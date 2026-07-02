/**
 * t-open-tab — the smallest illustrative behavior (§12.2.2): focuses a
 * target element on click; reads the target id from a sidecar data-target.
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-open-tab', {
	click(el) {
		const panelId = el.getAttribute('data-target');
		if (panelId) el.ownerDocument.getElementById(panelId)?.focus();
	},
});

export function openTab(panelId: string) {
	return {
		'data-js': concat('t-open-tab'),
		'data-target': only(panelId),
	};
}
