import {
	getClosestItem,
	getList,
	getListHighlighted,
	getListItems,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/shared/handlers/option-list';
import { createHandler } from '~/shared/utility/event-handler-attrs';

/**
 * Handle arrow navigation in menu
 */
export const menuKeyDown = createHandler('keydown', 'menu__keydown', (event) => {
	optionListKeyDown.do(event);
	optionListMatchText.do(event);

	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	// WCAG guideline says tab closes menu if in popover
	if (event.key === 'Tab') {
		const popover = target.closest(':popover-open') as HTMLElement | null;
		popover?.hidePopover();

		// Remove highlight so next time arrow keys go to beginning (or end)
		highlightInList(listElm, null);
		return;
	}

	// If not moving focus out of menu, then focus on highlighted item
	const highlighted = getListHighlighted(listElm);
	if (highlighted) highlighted.focus();
});

/**
 * Close on menu item selection
 */
export const menuCloseOnSelect = createHandler('click', 'menu__close-on-select', (event) => {
	const target = event.target as HTMLElement;
	if (getClosestItem(target)) {
		const popover = target.closest(':popover-open') as HTMLElement | null;
		popover?.hidePopover();
	}
});

/**
 * Autofocus first menu item on menu open
 */
export const menuFocusOnOpen = createHandler('beforetoggle', 'menu__focus-on-open', (event) => {
	if ((event as ToggleEvent & { delegateTarget: HTMLElement }).newState !== 'open') return;

	const dropdown = event.target as HTMLElement;
	if (dropdown.querySelector('[autofocus]')) return;

	const first = getListItems(dropdown)[0];
	if (!first) return;

	first.autofocus = true;
});
