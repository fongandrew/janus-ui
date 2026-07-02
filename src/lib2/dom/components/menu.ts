/**
 * c-menu = [popover] + t-roving-focus (vertical) + t-typeahead-filter +
 * t-request-close (§12.3).
 */
import '~/lib2/dom/handlers/t-request-close';
import '~/lib2/dom/handlers/t-restore-focus';
import '~/lib2/dom/handlers/t-roving-focus';
import '~/lib2/dom/handlers/t-typeahead-filter';

import { concat, only } from '~/lib2/dom/compose-attrs';

export function menu() {
	return {
		popover: '',
		role: only('menu'),
		'aria-orientation': only('vertical'),
		'data-js': concat('t-roving-focus t-typeahead-filter t-request-close t-restore-focus'),
	};
}

export function menuItem() {
	return { role: only('menuitem') };
}
