import {
	getList,
	getListHighlighted,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/shared/handlers/option-list';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { elmDoc } from '~/shared/utility/multi-view';

/**
 * Handle arrow navigation in list box and basic selection
 */
export const listBoxKeyDown = createHandler('keydown', 'list-box__keydown', (event) => {
	optionListKeyDown.do(event);
	optionListMatchText.do(event);

	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	const highlighted = getListHighlighted(listElm);
	if (target.role === 'listbox' || target.role === 'combobox') {
		target.setAttribute('aria-activedescendant', highlighted?.id ?? '');
	}

	// For single selection, highlighting basically acts as selection
	if (highlighted) {
		const multiple = target.getAttribute('aria-multiselectable') === 'true';
		if (!multiple && highlighted instanceof HTMLInputElement) {
			highlighted.checked = true;
		}
	}
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

	const dispatcher =
		(listElm.id &&
			elmDoc(listElm)?.querySelector<HTMLElement>(`[aria-controls="${listElm.id}"]`)) ||
		listElm;
	dispatcher.dispatchEvent(new Event('change'));
});

/**
 * Clicking on a list item marks it as *highlighted*
 */
export const listBoxClick = createHandler('click', 'list-box__click', (event) => {
	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	const multiple = listElm.getAttribute('aria-multiselectable') === 'true';
	const item = target.closest('[role="option"]') as HTMLElement | null;
	if (!item) return;

	const input = item.querySelector<HTMLInputElement>(
		'input[type="checkbox"], input[type="radio"]',
	);
	if (!input) return;

	if (multiple) {
		input.checked = !input.checked;
	} else {
		input.checked = true;
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
