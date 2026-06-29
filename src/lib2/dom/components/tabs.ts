/**
 * `c-tabs` composition (§12.3): `t-roving-focus` (horizontal) + `c-tabs__select`
 * for aria-selected / panel sync. Producers for the vanilla-JS path.
 */
import { ca, concat } from '~/lib2/dom/compose-attrs';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';

/** Attributes for the `[role="tablist"]` container. */
export function tabList() {
	return ca(rovingFocus({ axis: 'horizontal' }), {
		role: 'tablist',
		'data-js': concat('c-tabs__select'),
	});
}

/** Attributes for a `[role="tab"]` button controlling `panelId`. */
export function tab(panelId: string, selected = false) {
	return {
		role: 'tab',
		'aria-controls': panelId,
		'aria-selected': selected ? 'true' : 'false',
	};
}

/** Attributes for a `[role="tabpanel"]` labelled by `tabId`. */
export function tabPanel(tabId: string, selected = false) {
	return { role: 'tabpanel', 'aria-labelledby': tabId, hidden: !selected };
}
