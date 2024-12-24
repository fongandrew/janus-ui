import { createEffect, createSignal } from 'solid-js';

import {
	createListBoxControl,
	type ListBoxProps,
} from '~/shared/components/create-list-box-control';
import { LIST_OPTION_VALUE_ATTR, useClick } from '~/shared/components/create-option-list-control';
import { generateId } from '~/shared/utility/id-generator';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

/** Base props for ComboBox are identical to ListBox for now */
export type ComboBoxProps = ListBoxProps;

/**
 * Returns refs to link inbox box and list box for combo box.
 */
export function createComboBoxControl(props: ComboBoxProps) {
	const [listBox, setListBox] = createSignal<HTMLElement | null>(null);

	// `createListBoxControl` ref actually goes to input here since that'll end up controlling
	// the actual listBox
	const [setInput, inputControls] = createListBoxControl(props);

	useClick(listBox, {
		// Highlight is a no-op for combobox here since it's a keyboard only interaction
		// and focus is on the input
		onHighlight: () => {},
		// Make sure click interaction works on menu even though focus is elsewhere
		onSelect(event, element) {
			inputControls.select(event, element);
		},
	});

	// Add attributes associating input and listbox
	const isMounted = createMountedSignal();
	createEffect(() => {
		if (!isMounted()) return;

		const inputElm = inputControls.getNode();
		if (!inputElm) return;

		const listElm = listBox();
		if (!listElm) return;

		let inputId = inputElm.id;
		if (!inputId) {
			inputId = generateId('combobox-input');
			inputElm.id = inputId;
		}

		let listId = listElm.id;
		if (!listId) {
			listId = generateId('combobox-listbox');
			listElm.id = listId;
		}

		inputElm.role ??= 'combobox';
		inputElm.setAttribute('aria-controls', listId);
		if (!inputElm.getAttribute('aria-haspopup')) {
			inputElm.setAttribute('aria-expanded', 'true');
		}
		inputElm.setAttribute('aria-autocomplete', 'list');
		listElm.role ??= 'listbox';
	});

	return [
		setInput,
		setListBox,
		{
			...inputControls,
			getInputNode: inputControls.getNode,
			getListBoxNode: listBox,
			getFirstItem: () => {
				const node = listBox();
				if (!node) return null;
				return node.querySelector(`[${LIST_OPTION_VALUE_ATTR}]`) as HTMLElement | null;
			},
			getItemByValue: (value: string) => {
				const node = listBox();
				if (!node) return null;
				return node.querySelector(
					`[${LIST_OPTION_VALUE_ATTR}="${value}"]`,
				) as HTMLElement | null;
			},
			getItems: () => {
				const node = listBox();
				if (!node) return [];
				return Array.from(
					node.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`),
				) as HTMLElement[];
			},
		},
	] as const;
}
