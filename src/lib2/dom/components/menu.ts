/** c-menu (§12.3) = [popover] + roving focus (vertical) + typeahead + request-close. */
import { ca } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { typeaheadFilter } from '~/lib2/dom/handlers/t-typeahead-filter';

export function menu() {
	return ca(
		{ role: 'menu' },
		rovingFocus({ axis: 'vertical' }),
		typeaheadFilter(),
		requestClose(),
	);
}
