import '~/lib/utility/use-data-kb-nav';

import { createHandler } from '~/lib/utility/callback-attrs/events';
import { createTextMatcherForElement } from '~/lib/utility/create-text-matcher';
import { isTextInput } from '~/lib/utility/element-types';
import { isFocusVisible } from '~/lib/utility/is-focus-visible';
import { nextIndex } from '~/lib/utility/next-index';

/**
 * Data variable used to identify a highlighted item in a list
 */
export const LIST_HIGHLIGHTED_ATTR = 'data-c-option-list__active';

/**
 * Handle arrow key navigation and selection of options in a list
 */
export const optionListKeyDown = createHandler('keydown', '$c-option-list__keydown', (event) => {
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
 * Highlight matching text when typing
 */
export const optionListMatchText = createHandler(
	'keydown',
	'$c-option-list__match-text',
	function (this: HTMLElement, event) {
		if (event.key === ' ') return;
		if (event.key.length !== 1) return;

		const listElm = getList(this || (event.target as HTMLElement));
		if (!listElm) return;

		const textMatcher = getTextMatcherForList(listElm);
		const nextHighlighted = textMatcher(event.key);
		if (nextHighlighted) {
			event.preventDefault();
			highlightInList(listElm, nextHighlighted);
		}
	},
);

/**
 * Scroll to highlighted menu after popover with option list opens. This should happen
 * automatically when highlighting in the beforetoggle / toggle event, there may be some
 * issues with animations or positioning not being done yet. So do it after a short delay.
 */
export const optionListScrollToHighlighted = createHandler(
	'toggle',
	'$c-option-list__scroll-highlighted',
	(event) => {
		const popover = event.target as HTMLElement;
		setTimeout(() => {
			const itemElm = popover.querySelector<HTMLElement>(`[${LIST_HIGHLIGHTED_ATTR}]`);
			(itemElm?.closest('label') ?? itemElm)?.scrollIntoView({ block: 'nearest' });
		}, 80);
	},
);

/**
 * Get list element from an element inside the list, the element itself,
 * or something controlling it
 */
export function getList(elm: HTMLElement) {
	const closest = elm?.closest('[role="listbox"],[role="menu"],[aria-controls]') as
		| HTMLElement
		| null
		| undefined;

	const ariaControlsValue = closest?.getAttribute('aria-controls');
	for (const id of ariaControlsValue?.split(' ') ?? []) {
		const ariaControlled = closest?.ownerDocument.getElementById(id);
		if (ariaControlled?.role === 'listbox' || ariaControlled?.role === 'menu') {
			return ariaControlled;
		}
	}

	if (closest?.role === 'listbox' || closest?.role === 'menu') {
		return closest;
	}

	return null;
}

/**
 * Returns true if a given event target / element is the list element (or a list element)
 */
export function isList(elm: EventTarget | HTMLElement | null): elm is HTMLElement {
	const role = (elm as HTMLElement | null)?.role;
	return role === 'listbox' || role === 'menu';
}

/**
 * Get items from a list element
 */
export function getListItems(listElm: HTMLElement) {
	return Array.from(
		listElm?.querySelectorAll(
			'[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="option"]',
		) ?? [],
	) as HTMLElement[];
}

/**
 * Get list item with a particular value
 */
export function getListValue(listElm: HTMLElement, value: string) {
	return listElm.querySelector(`[value="${value}"]`) as HTMLElement | null;
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

	(itemElm?.closest('label') ?? itemElm)?.scrollIntoView({ block: 'nearest' });
}

/**
 * Get value from item element
 */
export function getItemValue(itemElm: HTMLElement) {
	return getClosestItem(itemElm)?.getAttribute('value');
}

/**
 * Get closest list item based on roles
 */
export function getClosestItem(elm: HTMLElement) {
	return elm.closest(
		'[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="option"]',
	);
}

/**
 * Get matcher for simple text matching in a list
 */
export const getTextMatcherForList = createTextMatcherForElement(getListItems, {
	getText: (elm) => elm.textContent || elm.closest('label')?.textContent || '',
});
