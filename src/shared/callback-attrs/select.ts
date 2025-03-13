import {
	getControllingElement,
	listBoxValues,
	syncActiveDescendant,
} from '~/shared/callback-attrs/list-box';
import {
	getClosestItem,
	getList,
	getListHighlighted,
	getListItems,
	highlightInList,
	optionListKeyDown,
	optionListMatchText,
} from '~/shared/callback-attrs/option-list';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createMounter } from '~/shared/utility/callback-attrs/mount';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { data } from '~/shared/utility/magic-strings';
import { elmDoc } from '~/shared/utility/multi-view';
import { t } from '~/shared/utility/text/t-tag';

/** Keydown handler for select button */
export const selectButtonKeyDown = createHandler(
	'keydown',
	'select__button-keydown',
	function (this, event) {
		const popover = (event.target as HTMLButtonElement).popoverTargetElement;
		let popoverOpen = popover?.matches(':popover-open');
		if (popoverOpen) {
			optionListKeyDown.do.call(this, event);
		} else {
			showOnKeyDown(event);
		}

		optionListMatchText.do.call(this, event);

		popoverOpen = popover?.matches(':popover-open');
		if (popoverOpen) {
			syncActiveDescendant(event.target as HTMLElement);
		} else {
			selectMaybeClearOnEsc.call(this, event);
		}
	},
);

/** Keydown handler for select input */
export const selectInputKeyDown = createHandler(
	'keydown',
	'select__input-keydown',
	function (this, event) {
		const popover = (event.target as HTMLInputElement).popoverTargetElement;
		let popoverOpen = popover?.matches(':popover-open');
		if (popoverOpen) {
			optionListKeyDown.do.call(this, event);
		} else {
			showOnKeyDown(event);
		}

		popoverOpen = popover?.matches(':popover-open');
		if (popoverOpen) {
			syncActiveDescendant(event.target as HTMLElement);
		} else {
			selectMaybeClearOnEsc.call(this, event);
		}

		// Prevent default so that we don't submit form if enter key is pressed while
		// text input is focused. That may be the expected behavior for an actual
		// input, but behaviorally, this combobox input behaves much more like a
		// select element (which doesn't submit form on enter in Chrome at least).
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	},
);

/**
 * Toggle popover on input click -- this happens automatically with buttons with
 * popovertargets but not inputs
 */
export const selectInputClick = createHandler('click', 'select__input-click', (event) => {
	const target = event.target as HTMLInputElement;
	const popover = target.popoverTargetElement as HTMLElement;
	popover?.togglePopover();
});

/** Blur / focusout handler to close dropdown when focus leaves input */
export const selectFocusOut = createHandler('focusout', 'select__focusout', (event) => {
	if (!isFocusVisible()) return;

	const target = event.target as HTMLElement;
	const relatedTarget = event.relatedTarget as HTMLElement | null;
	if (!relatedTarget) return;
	if (target.contains(relatedTarget)) return;

	const listElm = getList(target);
	if (!listElm) return;
	if (listElm.contains(relatedTarget)) return;

	listPopover(listElm)?.hidePopover();
});

/**
 * Change handler to close select menu when item is selected. This should be attached
 * to the list box itself (input / button control triggers click there).
 */
export const selectCloseOnClick = createHandler('click', 'select__close-on-click', (event) => {
	const target = event.target as HTMLElement;
	if (!getClosestItem(target)) return;

	const listElm = getList(target);
	if (!listElm) return;

	const control = getControllingElement(listElm);
	const multiple = control.matches('[aria-multiselectable="true"]');
	if (multiple) return;

	listPopover(listElm)?.hidePopover();
});

/**
 * Click handler for clearing selected values for select. Expects an `aria-controls`
 * attribute on the clear button to help find the listbox element.
 */
export const selectClear = createHandler('click', 'select__clear', (event) => {
	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	let didChange = false;
	for (const item of listElm.querySelectorAll('[aria-selected="true"]')) {
		item.setAttribute('aria-selected', 'false');
		if (item instanceof HTMLInputElement) {
			didChange = true;
			item.checked = false;
		}
	}
	if (!didChange) return;

	const dispatcher = getControllingElement(listElm);
	dispatcher.dispatchEvent(new Event('change', { bubbles: true }));

	// Clear unsets focus, so restore to dispatching element
	dispatcher.focus();
});

/**
 * Input handler that refocuses on first highlight item when typing
 */
export const selectHighlightOnInput = createHandler('input', 'select__focus-on-input', (event) => {
	const listElm = getList(event.target as HTMLElement);
	if (!listElm) return;

	// Queue microtask to ensure highlight happens after list is updated
	// from input changes
	queueMicrotask(() => {
		const firstItem = getListItems(listElm)[0];
		if (!firstItem) return;
		highlightInList(listElm, firstItem);
		syncActiveDescendant(listElm);
	});
});

/**
 * Mounter to populate descriptive text for select button or input based on selected
 * elements in list box.
 */
export const selectMountText = createMounter('select__mount-text', (elm) => {
	const updateTarget = elm.querySelector<HTMLElement>(`[${selectUpdateText.DESC_ATTR}]`);
	if (!updateTarget) return;

	const listElm = getList(elm.querySelector('[role="combobox') ?? elm);
	if (!listElm) return;

	const values = listBoxValues(listElm);
	if (values.size === 0) {
		updateTarget.textContent = '';
	} else if (values.size > 1) {
		updateTarget.textContent = t`${values.size} selected`;
	} else {
		const checked = listElm.querySelector<HTMLInputElement>(':checked');
		updateTarget.textContent = checked?.closest('label')?.textContent ?? '';
	}
});

/**
 * Change handler that updates content of a select box with text from the selected
 * values (or summary text if multiple values are selected). Should be attached to
 * an element that gets the bubbled change event and contains the element to update.
 */
export const selectUpdateText = Object.assign(
	createHandler('change', 'select__update-text', (event, updateTargetId: string) => {
		const target = event.target as HTMLElement;
		const updateTarget = elmDoc(target)?.getElementById(updateTargetId);
		if (!updateTarget) return;

		const listElm = getList(target);
		if (!listElm) return;

		const values = listBoxValues(listElm);
		if (values.size === 0) {
			updateTarget.textContent = '';
		} else if (values.size > 1) {
			updateTarget.textContent = t`${values.size} selected`;
		} else {
			const checked = listElm.querySelector<HTMLInputElement>(':checked');
			updateTarget.textContent = checked?.closest('label')?.textContent ?? '';
		}
	}),
	{
		/** Data attribute to assign to element to update with change text */
		DESC_ATTR: data('select__text'),
	},
);

/**
 * Input handler that updates the empty state text (or anything else that needs
 * the current input value)
 */
export const selectUpdateWithInput = Object.assign(
	createHandler('input', 'select__update-with-input', (event) => {
		const updateTarget = event.currentTarget.querySelector<HTMLElement>(
			`[${selectUpdateWithInput.TEXT_ATTR}]`,
		);
		if (!updateTarget) return;
		updateTarget.textContent = (event.target as HTMLInputElement).value;
	}),
	{
		/** Data attribute to assign to element to update with input value */
		TEXT_ATTR: data('select__input-text'),
	},
);

/**
 * Maybe clear the select element when pressing escape. Do this only if there is
 * something to clear to avoid blocking escape functionality inside a modal or somthing.
 */
function selectMaybeClearOnEsc(
	this: HTMLElement,
	event: KeyboardEvent & { currentTarget: HTMLElement },
) {
	if (event.key === 'Escape') {
		const target = event.target as HTMLElement;
		const listElm = getList(target);
		if (listElm?.querySelector<HTMLInputElement>('[aria-selected="true"]')) {
			event.preventDefault();
			selectClear.do.call(this, event);
		}
	}
}

/** Get popover for list element */
function listPopover(listElm: HTMLElement) {
	return listElm.closest('[popover]') as HTMLElement | null;
}

/** Show popover on keydown */
function showOnKeyDown(event: KeyboardEvent) {
	if (event.key.length === 1 || ['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
		const popover = (event.target as HTMLButtonElement | HTMLInputElement)
			?.popoverTargetElement as HTMLElement;
		popover?.showPopover();

		const listElm = getList(event.target as HTMLElement);
		if (!listElm) return;

		// Arrow down should highlight first item only if there is no item already
		// highlighted (e.g. go to default)
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			const highlighted = getListHighlighted(listElm);
			if (highlighted) return;

			// For single select, highlight selected item by default
			const controller = getControllingElement(listElm);
			const multiple = controller.getAttribute('aria-multiselectable') === 'true';
			if (!multiple) {
				const checked = listElm.querySelector<HTMLInputElement>(':checked');
				if (checked) {
					highlightInList(listElm, checked);
					return;
				}
			}

			const items = getListItems(listElm);
			highlightInList(listElm, items[0] ?? null);
		}

		// Arrow up is different in that it always highlights the last item in list,
		// regardless of previous selection
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			const listElm = getList(event.target as HTMLElement);
			if (listElm) {
				const items = getListItems(listElm);
				highlightInList(listElm, items[items.length - 1] ?? null);
			}
		}
	}
}
