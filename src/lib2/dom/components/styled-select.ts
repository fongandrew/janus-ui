/**
 * c-styled-select = [popover] + t-roving-focus + t-active-descendant +
 * t-typeahead-filter + form-engine integration (§12.3) — the one composite.
 */
import '~/lib2/dom/handlers/t-active-descendant';
import '~/lib2/dom/handlers/t-request-close';
import '~/lib2/dom/handlers/t-roving-focus';
import '~/lib2/dom/handlers/t-typeahead-filter';

import { concat, only } from '~/lib2/dom/compose-attrs';

export function styledSelectListbox() {
	return {
		role: only('listbox'),
		'aria-orientation': only('vertical'),
		'data-js': concat('t-roving-focus t-active-descendant t-typeahead-filter t-request-close'),
	};
}

export function styledSelectOption(selected = false) {
	return {
		role: only('option'),
		'aria-selected': only(String(selected)),
	};
}
