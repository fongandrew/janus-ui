/**
 * `c-menu` — `[popover]` + `t-roving-focus` (vertical) + `t-typeahead-filter`
 * + `t-request-close` (§12.3).
 */

import { type AttrValue, ca, only } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { typeaheadFilter } from '~/lib2/dom/handlers/t-typeahead-filter';

/** Producer: opts a `[popover]` element into the menu behavior set. */
export function menu(): Record<string, AttrValue> {
	return ca(rovingFocus({ axis: 'vertical', homeEnd: true }), typeaheadFilter(), requestClose(), {
		role: only('menu'),
		popover: only('auto'),
	});
}

/** Producer: one menu item. */
export function menuItem(): Record<string, AttrValue> {
	return { role: only('menuitem') };
}
