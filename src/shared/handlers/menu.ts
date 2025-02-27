import {
	getItemValue,
	getList,
	getListHighlighted,
	getListItems,
	getTextMatcherForList,
	highlightInList,
	optionListKeyDown,
} from '~/shared/handlers/option-list';
import { createHandler } from '~/shared/utility/event-handler-attrs';

/**
 * Handle arrow navigation in menu
 */
export const menuKeyDown = createHandler('keydown', 'menu__keydown', (event) => {
	optionListKeyDown.do(event);

	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	// Focus on highlighted item
	if (event.key.startsWith('Arrow')) {
		const highlighted = getListHighlighted(listElm);
		if (highlighted) highlighted.focus();
	}

	// WCAG guideline says tab closes menu if in popover
	if (event.key === 'Tab') {
		const popover = target.closest(':popover-open') as HTMLElement | null;
		popover?.hidePopover();
	}

	// Text matcher
	if (event.key.length === 1) {
		const textMatcher = getTextMatcherForList(listElm);
		const nextHighlighted = textMatcher(event.key);
		if (nextHighlighted) {
			event.preventDefault();
			highlightInList(listElm, nextHighlighted);
			nextHighlighted.focus();
		}
	}
});

/**
 * Close on menu item selection
 */
export const menuCloseOnSelect = createHandler('click', 'menu__close-on-select', (event) => {
	const target = event.target as HTMLElement;
	const value = getItemValue(target);
	if (value) {
		const popover = target.closest(':popover-open') as HTMLElement | null;
		popover?.hidePopover();
	}
});

/**
 * Autofocus first menu item on menu open
 */
export const menuFocusOnOpen = createHandler('beforetoggle', 'menu__focus-on-open', (event) => {
	if ((event as ToggleEvent).newState !== 'open') return;

	const dropdown = event.target as HTMLElement;
	if (dropdown.querySelector('[autofocus]')) return;

	const first = getListItems(dropdown)[0];
	if (!first) return;

	first.autofocus = true;
});
