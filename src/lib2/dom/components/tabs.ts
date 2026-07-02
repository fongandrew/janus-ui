/**
 * c-tabs = t-roving-focus (horizontal) + c-tabs__select (§12.3). Producers
 * for the three tab roles; the consumer supplies ids for aria wiring.
 */
import '~/lib2/dom/handlers/c-tabs__select';
import '~/lib2/dom/handlers/t-roving-focus';

import { concat, only } from '~/lib2/dom/compose-attrs';

export function tabList() {
	return {
		role: only('tablist'),
		'aria-orientation': only('horizontal'),
		'data-js': concat('t-roving-focus c-tabs__select'),
	};
}

export function tab(panelId: string, selected = false) {
	return {
		role: only('tab'),
		'aria-controls': only(panelId),
		'aria-selected': only(String(selected)),
	};
}

export function tabPanel(selected = false) {
	return {
		role: only('tabpanel'),
		...(selected ? {} : { hidden: only('true') }),
	};
}
