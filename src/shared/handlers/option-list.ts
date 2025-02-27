import { createTextMatcherForElement } from '~/shared/utility/create-text-matcher';
import { isTextInput } from '~/shared/utility/element-types';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { data } from '~/shared/utility/magic-strings';
import { nextIndex } from '~/shared/utility/next-index';

/**
 * Data variable used to identify the associated value of an element since an actual
 * value attribute may be semantically incorrect.
 */
export const LIST_OPTION_VALUE_ATTR = data('list-option-value');

/**
 * Data variable used to identify a highlighted item in a list
 */
export const LIST_HIGHLIGHTED_ATTR = data('option-list__active');

/**
 * Handle arrow key navigation and selection of options in a list
 */
export const optionListKeyDown = createHandler('keydown', 'option-list__keydown', (event) => {
	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	// Get elements from list element
	const items = getListItems(listElm);

	// Get current highlight (if any)
	const highlighted = getListHighlighted(listElm);
	const currentIndex = highlighted ? items.indexOf(highlighted) : -1;

	switch (event.key) {
		case 'ArrowDown': {
			event.preventDefault();
			// First item gets autofocused, but if focus isn't visible, this is
			// a bit weird since it'll jump to the second item when you hit down.
			// So explicitly select it if not already visible
			if (highlighted?.autofocus && !isFocusVisible()) {
				highlightInList(listElm, items[0] ?? null);
			} else {
				highlightInList(listElm, items[nextIndex(items, currentIndex, 1, true)] ?? null);
			}
			break;
		}
		case 'ArrowUp': {
			event.preventDefault();
			highlightInList(listElm, items[nextIndex(items, currentIndex, -1, true)] ?? null);
			break;
		}
		case 'Enter':
		case ' ': {
			// Don't count spaces for inputs since intent may be to type a space
			if (event.key === ' ' && isTextInput(event.target as HTMLElement)) {
				break;
			}
			if (highlighted) {
				event.preventDefault();
				highlighted.click();
			}
			break;
		}
	}
});

/**
 * Get list element from an element inside the list, the element itself,
 * or something controlling it
 */
export function getList(elm: HTMLElement) {
	const closest = elm?.closest('[role="listbox"], [role="menu"], [aria-controls]') as
		| HTMLElement
		| null
		| undefined;

	const ariaControlsId = closest?.getAttribute('aria-controls');
	const ariaControlled = ariaControlsId && closest?.ownerDocument.getElementById(ariaControlsId);
	if (ariaControlled) {
		return ariaControlled;
	}

	if (closest?.role === 'listbox' || closest?.role === 'menu') {
		return closest;
	}

	return null;
}

/**
 * Get items from a list element
 */
export function getListItems(listElm: HTMLElement) {
	return Array.from(
		listElm?.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`) ?? [],
	) as HTMLElement[];
}

/**
 * Get list item with a particular value
 */
export function getListValue(listElm: HTMLElement, value: string) {
	return listElm.querySelector(`[${LIST_OPTION_VALUE_ATTR}="${value}"]`) as HTMLElement | null;
}

/**
 * Get highlighted element from a list element
 */
export function getListHighlighted(listElm: HTMLElement) {
	return listElm.querySelector(`[${LIST_HIGHLIGHTED_ATTR}]`) as HTMLElement | null;
}

/**
 * Highlight an item in a list element
 */
export function highlightInList(listElm: HTMLElement, itemElm: HTMLElement | null) {
	const current = getListHighlighted(listElm);
	if (current === itemElm) return;

	current?.removeAttribute(LIST_HIGHLIGHTED_ATTR);
	itemElm?.setAttribute(LIST_HIGHLIGHTED_ATTR, '');
}

/**
 * Get value from item element
 */
export function getItemValue(itemElm: HTMLElement) {
	return itemElm.closest(`[${LIST_OPTION_VALUE_ATTR}]`)?.getAttribute(LIST_OPTION_VALUE_ATTR);
}

/**
 * Get matcher for simple text matching in a list
 */
export const getTextMatcherForList = createTextMatcherForElement(getListItems);
