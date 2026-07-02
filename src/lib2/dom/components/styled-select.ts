/**
 * c-styled-select (§12.3) = [popover] + roving focus + active descendant +
 * typeahead + form-engine integration.
 */
import { ca } from '~/lib2/dom/compose-attrs';
import { activeDescendant } from '~/lib2/dom/handlers/t-active-descendant';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { typeaheadFilter } from '~/lib2/dom/handlers/t-typeahead-filter';

export function styledSelect() {
	return ca(
		rovingFocus({ axis: 'vertical' }),
		activeDescendant(),
		typeaheadFilter(),
		requestClose(),
	);
}
