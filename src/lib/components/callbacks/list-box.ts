import { createResetCallback } from '~/lib/components/callbacks/form';
import {
	getList,
	getListHighlighted,
	getListItems,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/lib/components/callbacks/option-list';
import { createHandler } from '~/lib/utility/callback-attrs/events';
import { createMounter } from '~/lib/utility/callback-attrs/mount';
import { createValidator } from '~/lib/utility/callback-attrs/validate';
import { elmDoc } from '~/lib/utility/multi-view';
import { elmT } from '~/lib/utility/text/t-tag';

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
 * Synchronize aria-selected attribute with selection state (if JS is slow in loading,
 * user may change initial selection before mount)
 */
export const listBoxMount = createMounter('$c-list-box__mount', function () {
	const listElm = getList(this);
	if (!listElm) return;

	for (const elm of getListItems(listElm)) {
		if (elm instanceof HTMLInputElement && typeof elm.checked === 'boolean') {
			elm.setAttribute('aria-selected', String(elm.checked));
		}
	}
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

	// Multi-select = checkboxes, single-select = radio buttons. This naturally causes
	// single-select to unselect a prior option but we need to sync aria-selected state too.
	// too.
	for (const prev of listElm.querySelectorAll<HTMLInputElement>(
		'[role="option"][aria-selected="true"]:not(:checked)',
	)) {
		prev.setAttribute('aria-selected', 'false');
	}

	highlightInList(listElm, target);

	const controller = getControllingElement(listElm);
	controller.setAttribute('aria-activedescendant', target.id);
	listElm.dispatchEvent(new Event('change', { bubbles: true }));
});

/**
 * Custom validator to handle "required" behavior for list boxes
 */
export const listBoxRequired = createValidator('$c-list-box__required', function () {
	const listElm = getList(this);
	if (!listElm) return;

	const t = elmT(listElm);
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
	for (const option of listElm.querySelectorAll<HTMLInputElement>('[type="hidden"]')) {
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

	const controller = getControllingElement(listElm);
	const highlighted = getListHighlighted(listElm);
	controller.setAttribute('aria-activedescendant', highlighted?.id ?? '');

	// For single selection, highlighting basically acts as selection
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
export function connectListBoxValidator(onValidate: ListBoxValidator) {
	return (event: Event) => {
		const listElm = getList(event.currentTarget as HTMLElement);
		if (!listElm) return;
		return onValidate(listBoxValues(listElm), event);
	};
}

/**
 * Helper to validate event target is a list box, returns the list box if so,
 * otherwise null
 */
export function evtListBox(event: Event) {
	const target = event.target as HTMLElement;
	if (target.role === 'listbox' || target.role === 'menu') {
		return target;
	}
	return null;
}
