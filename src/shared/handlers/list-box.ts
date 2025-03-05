import {
	getList,
	getListHighlighted,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/shared/handlers/option-list';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { elmDoc } from '~/shared/utility/multi-view';

/** Custom validator for ListBox-like things -- returns error or nothing if fine */
export type ListBoxValidator = (values: Set<string>, event: Event) => string | undefined | null;

/**
 * Handle arrow navigation in list box and basic selection
 */
export const listBoxKeyDown = createHandler('keydown', 'list-box__keydown', (event) => {
	optionListKeyDown.do(event);
	optionListMatchText.do(event);
	syncActiveDescendant(event.target as HTMLElement);
});

/**
 * Synchronize aria-selected attribute with selection state and mark changed item
 * as highlighted
 */
export const listBoxChange = createHandler('change', 'list-box__change', (event) => {
	const target = event.target as HTMLElement;
	if (target instanceof HTMLInputElement && target.role === 'option') {
		target.setAttribute('aria-selected', target.checked ? 'true' : 'false');
	}

	const listElm = getList(target);
	if (!listElm) return;

	highlightInList(listElm, target);

	const dispatcher = getControllingElement(listElm);
	dispatcher.setAttribute('aria-activedescendant', target.id);
	dispatcher.dispatchEvent(new Event('change', { bubbles: true }));
});

/**
 * Return list of all selected values
 */
export function listBoxValues(listElm: HTMLElement) {
	const values = new Set<string>();
	for (const option of listElm.querySelectorAll<HTMLInputElement>(':checked')) {
		values.add(option.value);
	}
	return values;
}

/**
 * Process highlight change in list box
 */
export function syncActiveDescendant(target: HTMLElement) {
	if (target.role !== 'listbox' && target.role !== 'combobox') return;

	const listElm = getList(target);
	if (!listElm) return;

	const highlighted = getListHighlighted(listElm);
	target.setAttribute('aria-activedescendant', highlighted?.id ?? '');

	// For single selection, highlighting basically acts as selection
	const controller = getControllingElement(listElm);
	const multiple = controller.getAttribute('aria-multiselectable') === 'true';
	if (!multiple && highlighted instanceof HTMLInputElement) {
		if (highlighted.checked) return;
		highlighted.checked = true;
		highlighted.dispatchEvent(new Event('change', { bubbles: true }));
	}
}

/**
 * Get controlling list or combobox for a given list element
 */
export function getControllingElement(listElm: HTMLElement) {
	return (
		(listElm.id &&
			elmDoc(listElm)?.querySelector<HTMLElement>(
				`[role="combobox"][aria-controls="${listElm.id}"]`,
			)) ||
		listElm
	);
}

/**
 * Create a custom validator for a list box that includes values
 */
export function createListBoxValidator(onValidate: ListBoxValidator) {
	return (event: Event) => {
		const listElm = getList(event.target as HTMLElement);
		if (!listElm) return;
		return onValidate(listBoxValues(listElm), event);
	};
}
