/**
 * `c-styled-select` composition (§12.3): `[popover]` + `t-roving-focus` +
 * `t-active-descendant` + `t-typeahead-filter`.
 */
import { ca } from '~/lib2/dom/compose-attrs';
import { activeDescendant } from '~/lib2/dom/handlers/t-active-descendant';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { typeaheadFilter } from '~/lib2/dom/handlers/t-typeahead-filter';

/** Attributes for the styled-select listbox popover. */
export function styledSelect() {
	return ca(rovingFocus({ axis: 'vertical' }), activeDescendant(), typeaheadFilter(), {
		role: 'listbox',
	});
}
