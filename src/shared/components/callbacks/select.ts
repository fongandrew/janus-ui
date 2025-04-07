import { createResetCallback } from '~/shared/components/callbacks/form';
import {
	getControllingElement,
	listBoxValues,
	syncActiveDescendant,
} from '~/shared/components/callbacks/list-box';
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
import { createMounter, processRoot } from '~/shared/utility/callback-attrs/mount';
import { createQueryEffect } from '~/shared/utility/create-query-effect';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { createMagicProp } from '~/shared/utility/magic-prop';
import { elmDoc, evtDoc } from '~/shared/utility/multi-view';
import { elmT } from '~/shared/utility/text/t-tag';
import { onUnmount } from '~/shared/utility/unmount-observer';

/** Data attribute for marking part of select for visibile options */
export const SELECT_VISIBLE_CONTAINER_ATTR = 'data-select__visible';

/** Data attribute for marking part of select for hidden options */
export const SELECT_HIDDEN_CONTAINER_ATTR = 'data-select__hidden';

/** Keydown handler for select button */
export const selectButtonKeyDown = createHandler(
	'keydown',
	'$c-select__button-keydown',
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
	'$c-select__input-keydown',
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
export const selectInputClick = createHandler('click', '$c-select__input-click', (event) => {
	const target = event.target as HTMLInputElement;
	const popover = target.popoverTargetElement as HTMLElement;
	popover?.togglePopover();
});

/** Blur / focusout handler to close dropdown when focus leaves input */
export const selectFocusOut = createHandler('focusout', '$c-select__focusout', (event) => {
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
export const selectCloseOnClick = createHandler('click', '$c-select__close-on-click', (event) => {
	const target = event.target as HTMLElement;
	const listElm = getList(target);
	if (!listElm) return;

	const control = getControllingElement(listElm);
	const multiple = control.matches('[aria-multiselectable="true"]');

	// Single selection -- just close the popover
	if (getClosestItem(target) && !multiple) {
		// Single
		listPopover(listElm)?.hidePopover();
		return;
	}

	// Either no selection or multiple so refocus
	if (control instanceof HTMLInputElement) {
		control.focus();
	}
});

/**
 * Click handler for clearing selected values for select. Expects an `aria-controls`
 * attribute on the clear button to help find the listbox element.
 */
export const selectClear = createHandler('click', '$c-select__clear', (event) => {
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
	for (const item of listElm.querySelectorAll<HTMLInputElement>('[type="hidden"]')) {
		didChange = true;
		item.remove();
	}
	if (!didChange) return;

	const dispatcher = getControllingElement(listElm);
	dispatcher.dispatchEvent(new Event('change', { bubbles: true }));

	// Clear unsets focus, so restore to dispatching element
	dispatcher.focus();
});

/**
 * Attach a mutation observer to select dropdown when it opens to auto-highlight
 * first item when it changes
 */
export const selectToggleObserve = createHandler(
	'beforetoggle',
	'$c-select__toggle-observe',
	(event) => {
		const target = event.target as HTMLElement;

		const visibleInputContainer = target.querySelector<HTMLElement>(
			`[${SELECT_VISIBLE_CONTAINER_ATTR}]`,
		);
		const hiddenInputContainer = target.querySelector<HTMLElement>(
			`[${SELECT_HIDDEN_CONTAINER_ATTR}]`,
		);
		if (!visibleInputContainer || !hiddenInputContainer) return;

		// Use the one selectObserver instance because we aassume there any
		if ((event as ToggleEvent & { currentTarget: HTMLElement }).newState === 'open') {
			getSelectObserver(hiddenInputContainer).observe(visibleInputContainer, {
				childList: true,
				subtree: true,
			});
		} else {
			getSelectObserver(hiddenInputContainer).disconnect();
		}
	},
);

/**
 * Mounter to populate descriptive text for select button or input based on selected
 * elements in list box.
 */
export const selectMountText = createMounter<[string]>(
	'$c-select__mount-text',
	(elm, updateTargetId: string) => {
		const updateTarget = elmDoc(elm)?.getElementById(updateTargetId);
		if (!updateTarget) return;

		const listElm = getList(elm.querySelector<HTMLElement>('[role="combobox"]') ?? elm);
		if (!listElm) return;

		const t = elmT(listElm);
		const values = listBoxValues(listElm);
		if (values.size === 0) {
			updateTarget.textContent = '';
		} else if (values.size > 1) {
			updateTarget.textContent = t`${values.size} selected`;
		} else {
			const checked = listElm.querySelector<HTMLInputElement>(':checked');
			updateTarget.textContent = checked?.closest('label')?.textContent ?? '';
		}
	},
);

/**
 * Change handler that updates content of a select box with text from the selected
 * values (or summary text if multiple values are selected). Should be attached to
 * an element that gets the bubbled change event and contains the element to update.
 */
export const selectUpdateText = createHandler(
	'change',
	'$c-select__update-text',
	(event, updateTargetId: string) => {
		selectMountText.do.call(event.currentTarget, event.currentTarget, updateTargetId);
	},
);

/** Update text on form reset */
export const selectResetText = createResetCallback(
	'$c-select__reset',
	function (_event: Event, updateTargetId: string) {
		// Queue microtask so we can process state *after* reset has happened
		queueMicrotask(() => {
			selectMountText.do.call(this, this, updateTargetId);
		});
	},
);

/**
 * Input handler that updates the empty state text (or anything else that needs
 * the current input value)
 */
export const selectUpdateWithInput = createHandler(
	'input',
	'$c-select__update-with-input',
	(event, targetId: string) => {
		const updateTarget = evtDoc(event)?.getElementById(targetId);
		if (!updateTarget) return;
		updateTarget.textContent = (event.target as HTMLInputElement).value;
	},
);

/** Magic prop to see if there's an associated input handler with an input already */
const [selectInputHandler, setSelectInputHandler] =
	createMagicProp<
		(
			event: Event & { target: HTMLInputElement; currentTarget: HTMLElement },
		) => Promise<DocumentFragment | undefined>
	>();

/**
 * Create a query effect tied to select input
 */
export function createSelectInputHandler<TExtra extends (string | undefined)[]>(
	name: string,
	callback: (
		event: Event & { target: HTMLInputElement; currentTarget: HTMLElement },
		abortSignal: AbortSignal,
		...extra: TExtra
	) => Promise<DocumentFragment>,
) {
	return createHandler<'input', TExtra>('input', name, (event, ...extras: TExtra) => {
		const target = event.target as HTMLInputElement;
		const listElm = getList(target);
		if (!listElm) return;

		let query = selectInputHandler(target);
		if (!query) {
			query = createQueryEffect<
				Event & { target: HTMLInputElement; currentTarget: HTMLElement },
				DocumentFragment
			>(
				(event, abortSignal) => callback(event, abortSignal, ...extras),
				(fragment) => {
					selectReplaceOptions(listElm, fragment);
					target.setAttribute('aria-busy', 'false');
					listElm.setAttribute('aria-busy', 'false');
				},
			);
			setSelectInputHandler(target, query);
		}

		target.setAttribute('aria-busy', 'true');
		listElm.setAttribute('aria-busy', 'true');
		query(event as Event & { target: HTMLInputElement; currentTarget: HTMLElement });
	});
}

/**
 * Helper to replace the visible portion of select options with a new set of options
 * that is, for example, fetched via XHR
 */
export function selectReplaceOptions(listElm: HTMLElement, ...newOptions: DocumentFragment[]) {
	// Preserve checked state when replacing options
	const values = listBoxValues(listElm);
	for (const newOption of newOptions) {
		for (const item of newOption.querySelectorAll<HTMLInputElement>('input')) {
			const checked = values.has(item.value);
			item.checked = checked;
			item.setAttribute('aria-selected', String(checked));
		}
	}

	const visibleContainer = listElm.querySelector<HTMLElement>(
		`[${SELECT_VISIBLE_CONTAINER_ATTR}]`,
	);
	if (!visibleContainer) return;

	visibleContainer.replaceChildren(...newOptions);
	processRoot(visibleContainer);
}

/** Magic prop for tracking mutation observers created */
const [selectObserver, setSelectObserver] = createMagicProp<MutationObserver>();

/**
 * Create mutation observer that can monitor a select listbox and update its highlight state
 */
function getSelectObserver(hiddenInputContainer: HTMLElement) {
	const current = selectObserver(hiddenInputContainer);
	if (current) return current;

	const observer = new MutationObserver((mutations) => {
		// Map from label value to input element (assume only one instance per value)
		const inputs: Record<string, HTMLInputElement> = {};
		for (const item of hiddenInputContainer.querySelectorAll<HTMLInputElement>('[value]')) {
			inputs[item.value] = item;
		}

		const maybeRemoveHiddenInput = (value: string) => {
			inputs[value]?.remove();
			delete inputs[value];
		};

		const maybeCreateHiddenInput = (value: string) => {
			if (inputs[value]) return;
			const hiddenInput = elmDoc(hiddenInputContainer).createElement('input');
			hiddenInput.type = 'hidden';
			hiddenInput.value = value;
			hiddenInputContainer.appendChild(hiddenInput);
			inputs[value] = hiddenInput;
		};

		// Update hidden input list to sync with any selected nodes that are now hidden
		for (const mutation of mutations) {
			for (const node of mutation.removedNodes) {
				if (!(node instanceof HTMLElement)) continue;
				if (node instanceof HTMLInputElement && node.checked) {
					maybeCreateHiddenInput(node.value);
				}
				for (const input of node.querySelectorAll<HTMLInputElement>(':checked')) {
					maybeCreateHiddenInput(input.value);
				}
			}
			for (const node of mutation.addedNodes) {
				if (!(node instanceof HTMLElement)) continue;
				if (node instanceof HTMLInputElement && node.checked) {
					maybeRemoveHiddenInput(node.value);
				}
				for (const input of node.querySelectorAll<HTMLInputElement>(':checked')) {
					maybeRemoveHiddenInput(input.value);
				}
			}
		}

		// Update highlight state on mutation once
		const mutation = mutations[0];
		if (mutation?.target instanceof HTMLElement) {
			const listBox = mutation.target.closest<HTMLElement>('[role="listbox"]');
			if (!listBox) return;
			const firstItem = getListItems(listBox)[0];
			if (!firstItem) return;
			highlightInList(listBox, firstItem);

			const controllingElement = getControllingElement(listBox);

			// For single selection, highlighting basically acts as selection so clear hidden
			// inputs to avoid multi-selecting in single select case
			const multiple = controllingElement.getAttribute('aria-multiselectable') === 'true';
			if (!multiple) {
				hiddenInputContainer.replaceChildren();
			}

			syncActiveDescendant(controllingElement);
		}
	});

	setSelectObserver(hiddenInputContainer, observer);
	onUnmount(hiddenInputContainer, () => observer.disconnect());

	return observer;
}

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
		if (listElm && listBoxValues(listElm).size) {
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
