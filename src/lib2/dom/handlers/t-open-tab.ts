/**
 * `t-open-tab` — the smallest illustrative behavior (§12.2.2): focuses a
 * target element on click; reads the target id from a sibling `data-target`.
 */

import { type AttrValue, concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-open-tab', {
	click(el) {
		const panelId = el.getAttribute('data-target');
		if (panelId) {
			el.ownerDocument.getElementById(panelId)?.focus();
		}
	},
});

/** Producer: opts a tab trigger into `t-open-tab`, targeting `panelId`. */
export function openTab(panelId: string): Record<string, AttrValue> {
	return {
		role: 'tab',
		'data-js': concat('t-open-tab'),
		'data-target': only(panelId),
	};
}
