/**
 * `c-menu` composition (§12.3): `[popover]` + `t-roving-focus` (vertical) +
 * `t-typeahead-filter` + `t-request-close`.
 */
import { ca } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { typeaheadFilter } from '~/lib2/dom/handlers/t-typeahead-filter';

/** Attributes for a `[popover] role="menu"`. */
export function menu() {
	return ca(rovingFocus({ axis: 'vertical' }), typeaheadFilter(), requestClose(), {
		role: 'menu',
	});
}
