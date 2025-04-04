import {
	getClosestItem,
	getList,
	getListHighlighted,
	getListItems,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/shared/components/callbacks/option-list';
import { createHandler } from '~/shared/utility/callback-attrs/events';

/**
 * Handle arrow navigation in menu
 */
export const menuKeyDown = createHandler('keydown', '$c-menu__keydown', function (this, event) {
	optionListKeyDown.do.call(this, event);
	optionListMatchText.do.call(this, event);

	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	// WCAG guideline says tab closes menu if in popover
	const popover = target.closest(':popover-open') as HTMLElement | null;
	if (event.key === 'Tab') {
		popover?.hidePopover();

		// Remove highlight so next time arrow keys go to beginning (or end)
		highlightInList(listElm, null);
		return;
	}

	// If not moving focus out of menu (and popover still open), then focus on highlighted item
	if (popover?.matches(':popover-open')) {
		const highlighted = getListHighlighted(listElm);
		if (highlighted) highlighted.focus();
	}
});

/**
 * Close on menu item selection
 */
export const menuCloseOnSelect = createHandler('click', '$c-menu__close-on-select', (event) => {
	const target = event.target as HTMLElement;
	if (getClosestItem(target)) {
		const popover = target.closest(':popover-open') as HTMLElement | null;
		popover?.hidePopover();
	}
});

/**
 * Maybe set autofocus on first menu item on menu open
 */
export const menuAutoFocus = createHandler('beforetoggle', '$c-menu__autofocus', (event) => {
	if ((event as ToggleEvent & { currentTarget: HTMLElement }).newState !== 'open') return;

	const dropdown = event.target as HTMLElement;
	if (dropdown.querySelector('[autofocus]')) return;

	const first = getListItems(dropdown)[0];
	if (!first) return;

	first.autofocus = true;
});

/**
 * Autofocus menu on click
 */
export const menuTriggerClick = createHandler('click', '$c-menu__trigger-click', (event) => {
	// Popover="auto" should handle popover opening. We just need to set an autofocus
	menuTriggerAutoFocus(event.target as HTMLButtonElement);
});

/**
 * Slightly autofocus handling for arrow keydowns (space and enter handled by click handler)
 */
export const menuTriggerKeyDown = createHandler('keydown', '$c-menu__trigger-keydown', (event) => {
	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		if (event.key === 'ArrowDown') {
			menuTriggerAutoFocus(event.target as HTMLButtonElement, 'first');
		} else {
			menuTriggerAutoFocus(event.target as HTMLButtonElement, 'last');
		}

		const popover = (event.target as HTMLButtonElement)
			.popoverTargetElement as HTMLElement | null;
		if (!popover) return;

		event.preventDefault();
		popover.showPopover();
	}
});

/**
 * Helper to autofocus item after trigger interacted with
 */
const menuTriggerAutoFocus = (trigger: HTMLButtonElement, position: 'first' | 'last' = 'first') => {
	const popover = trigger.popoverTargetElement as HTMLElement;
	if (!popover) return;

	const currentAutoFocus = popover.querySelector<HTMLButtonElement>('[autofocus]');
	if (currentAutoFocus) {
		currentAutoFocus.autofocus = false;
	}

	const items = getListItems(popover);
	const item = items[position === 'first' ? 0 : items.length - 1];
	if (!item) return;
	item.autofocus = true;

	highlightInList(popover, item);
};
