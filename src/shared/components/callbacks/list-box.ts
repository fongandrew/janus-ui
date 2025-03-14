import { createResetCallback } from '~/shared/components/callbacks/form';
import {
	getList,
	getListHighlighted,
	getListItems,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/shared/components/callbacks/option-list';
import { createValidator } from '~/shared/utility/callback-attrs/validate';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { elmDoc } from '~/shared/utility/multi-view';
import { t } from '~/shared/utility/text/t-tag';

/** Custom validator for ListBox-like things -- returns error or nothing if fine */
export type ListBoxValidator = (values: Set<string>, event: Event) => string | undefined | null;

/**
 * Handle arrow navigation in list box and basic selection
 */
export const listBoxKeyDown = createHandler('keydown', '$c-list-box__keydown', function (event) {
	optionListKeyDown.do.call(this, event);
	optionListMatchText.do.call(this, event);
	syncActiveDescendant(event.target as HTMLElement);
});

/**
 * Synchronize aria-selected attribute with selection state and mark changed item
 * as highlighted
 */
export const listBoxChange = createHandler('change', '$c-list-box__change', (event) => {
	// ListBox is meant to encapsulate its internal elements. We'll re-dispatch
	// change event from listbox itself below, so ignore it here and stop further
	// propagation.
	const target = event.target as HTMLElement;
	if (target === event.currentTarget) return;
	event.stopPropagation();

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
 * Custom validator to handle "required" behavior for list boxes
 */
export const listBoxRequired = createValidator('$c-list-box__required', function () {
	const listElm = getList(this);
	if (!listElm) return;

	if (listBoxValues(listElm).size === 0) {
		return t`Please fill out this field.`;
	}
});

/**
 * Reset values for reset -- reset event should handle input, so just resynchonize
 */
export const listBoxReset = createResetCallback('$c-list-box__reset', function () {
	const listElm = getList(this);
	if (!listElm) return;

	for (const item of getListItems(listElm)) {
		if (item instanceof HTMLInputElement && typeof item.checked === 'boolean') {
			item.checked = item.defaultChecked;
			item.setAttribute('aria-selected', String(item.defaultChecked));
		}
	}
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
		const listElm = getList(event.currentTarget as HTMLElement);
		if (!listElm) return;
		return onValidate(listBoxValues(listElm), event);
	};
}
