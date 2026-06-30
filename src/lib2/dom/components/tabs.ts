/**
 * `c-tabs` — `t-roving-focus` (horizontal) + `c-tabs__select` for
 * `aria-selected` sync and panel visibility (§12.3).
 */

import '~/lib2/dom/handlers/c-tabs__select';

import { type AttrValue, ca, concat, only } from '~/lib2/dom/compose-attrs';
import { rovingFocus, type RovingFocusAxis } from '~/lib2/dom/handlers/t-roving-focus';

/** Producer: the tablist container. */
export function tabList(opts: { axis?: RovingFocusAxis } = {}): Record<string, AttrValue> {
	return ca(rovingFocus({ axis: opts.axis ?? 'horizontal' }), {
		role: only('tablist'),
		'data-js': concat('c-tabs__select'),
	});
}

/** Producer: one tab trigger, controlling the panel with id `panelId`. */
export function tab(opts: { panelId: string; selected?: boolean }): Record<string, AttrValue> {
	return {
		role: 'tab',
		'aria-selected': String(opts.selected ?? false),
		'aria-controls': opts.panelId,
		tabindex: opts.selected ? 0 : -1,
	};
}

/** Producer: one tab panel, labelled by the tab with id `tabId`. */
export function tabPanel(opts: { tabId: string; selected?: boolean }): Record<string, AttrValue> {
	return {
		role: 'tabpanel',
		'aria-labelledby': opts.tabId,
		hidden: !opts.selected,
	};
}
