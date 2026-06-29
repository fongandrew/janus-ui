/**
 * `t-open-tab` — the smallest illustrative behavior (§12.2.4): focus a target
 * element on click, reading the target id from a sibling `data-target`.
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-open-tab', {
	click(el) {
		const id = el.getAttribute('data-target');
		if (id) el.ownerDocument.getElementById(id)?.focus();
	},
});

/** Producer: focus the panel with id `panelId` on click. */
export function openTab(panelId: string) {
	return {
		role: 'tab',
		'aria-labelledby': concat(panelId),
		'data-js': concat('t-open-tab'),
		'data-target': only(panelId),
	};
}
