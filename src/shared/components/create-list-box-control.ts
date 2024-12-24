import { createEffect, createSignal } from 'solid-js';

import {
	createOptionListControl,
	LIST_OPTION_VALUE_ATTR,
} from '~/shared/components/create-option-list-control';

/** Base props for ListBox */
export interface ListBoxProps {
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string> | undefined;
	/** Currently selected values (controlled) */
	values?: Set<string> | undefined;
	/** Active higlight ID (controlled) */
	currentId?: string | null | undefined;
	/** Called when selection changes */
	onChange?: (event: MouseEvent | KeyboardEvent, value: Set<string>) => void;
	/** Called when highlight changes */
	onHighlight?: (event: KeyboardEvent, elementId: string) => void;
	/** Disables clearing selection */
	required?: boolean | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
}

/**
 * Create a list box control.
 */
export function createListBoxControl(props: ListBoxProps) {
	const [uncontrolledValues, setUncontrolledValues] = createSignal<Set<string>>(
		props.defaultValues ?? new Set<string>(),
	);
	const values = () => props.values ?? uncontrolledValues();
	const setValues = (event: KeyboardEvent | MouseEvent, newValues: Set<string>) => {
		props.onChange?.(event, newValues);
		setUncontrolledValues(newValues);
	};

	const [uncontrolledCurrentId, setUncontrolledCurrentId] = createSignal<string | null>(null);
	const currentId = () => props.currentId ?? uncontrolledCurrentId();

	const [setOptionListControl, optionListControls] = createOptionListControl({
		onHighlight: (event, elm) => {
			const id = elm?.id;
			if (!id) return;
			setUncontrolledCurrentId(id);
			props.onHighlight?.(event, id);
		},
		onSelect: (event, _elm, value) => {
			const oldValues = values();
			const newValues = new Set(oldValues);
			if (props.multiple) {
				if (newValues.has(value)) {
					newValues.delete(value);
				} else {
					newValues.add(value);
				}
			} else {
				const shouldAdd = !newValues.has(value);
				newValues.clear();
				if (shouldAdd) {
					newValues.add(value);
				}
			}
			if (newValues.size === 0 && (props.required || !props.multiple)) {
				props.onChange?.(event, oldValues);
				return;
			}
			setValues(event, newValues);
		},
	});

	// Get list box element (which is the control element unless there's an aria-controls)
	const getListBox = () => {
		const controlNode = optionListControls.getNode();
		const ariaControlsId = controlNode?.getAttribute('aria-controls');
		const ariaControlled =
			ariaControlsId && controlNode?.ownerDocument.getElementById(ariaControlsId);
		return ariaControlled || controlNode;
	};

	// Update the listBox element with the correct role and ARIA propertyies
	createEffect(() => {
		const listBox = getListBox();
		if (!listBox) return;
		listBox.role ??= 'listbox';
		listBox.ariaRequired = String(!!props.required);
		listBox.ariaMultiSelectable = String(!!props.multiple);
	});

	// Update ARIA selected state when values change
	createEffect(() => {
		const listBox = getListBox();
		if (!listBox) return;

		for (const option of listBox.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`)) {
			const optionValue = option.getAttribute(LIST_OPTION_VALUE_ATTR);
			if (optionValue) {
				option.ariaSelected = String(values().has(optionValue));
			}
		}
	});

	// Update ARIA current state when currentId changes
	createEffect(() => {
		const listBox = getListBox();
		if (!listBox) return;

		const nextId = currentId();
		const next = nextId && listBox.ownerDocument.getElementById(nextId);
		const prev = listBox.querySelector('[aria-current="true"]');
		if (prev && prev !== next) {
			prev.ariaCurrent = 'false';
		}
		if (next) {
			next.ariaCurrent = 'true';
			// This needs to be on the control element, not the listbox element
			// (which is the smae for a listbox bit not a combobox)
			optionListControls.getNode()?.setAttribute('aria-activedescendant', nextId);
		}
	});

	return [
		setOptionListControl,
		{
			...optionListControls,
			values,
			setValues,
		},
	] as const;
}
