import { flip, offset, shift, size } from '@floating-ui/dom';
import { mergeProps } from 'solid-js';

import {
	type ComboBoxProps,
	createComboBoxControl,
} from '~/shared/components/create-combo-box-control';
import { createDropdown } from '~/shared/components/create-dropdown';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export type SelectControlProps = ComboBoxProps;

/**
 * A select control is jsut a combo box + a dropdown. This returns props for both.
 */
export function createSelectControl(props: SelectControlProps) {
	// Refs to trigger and dropdown
	const [setTrigger, setDropdown, dropdownControls] = createDropdown([
		offset(4),
		flip(),
		shift({ padding: 4 }),
		size({
			apply({ rects, elements, availableHeight }) {
				elements.floating.style.setProperty(
					'--c-dropdown-max-width',
					`${rects.reference.width}px`,
				);
				elements.floating.style.setProperty(
					'--c-dropdown-min-width',
					`${rects.reference.width}px`,
				);
				elements.floating.style.setProperty(
					'--c-dropdown-max-height',
					`${Math.max(0, availableHeight - 8)}px`,
				);
			},
		}),
	]);

	// Refs for input and list box
	const comboBoxProps = mergeProps(props, {
		onChange: (event: MouseEvent | KeyboardEvent, value: Set<string>) => {
			props.onChange?.(event, value);
			if (!props.multiple) {
				dropdownControls.hidePopover();
			}
		},
	});
	const [setInput, setListBox, comboBoxControls] = createComboBoxControl(comboBoxProps);

	const hideOnBlur = (event: FocusEvent) => {
		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (!relatedTarget) return;
		if (dropdownControls.getTriggerNode()?.contains(relatedTarget)) return;
		if (dropdownControls.getMenuNode()?.contains(relatedTarget)) return;
		dropdownControls.hidePopover();
	};

	const clear = (event: MouseEvent | KeyboardEvent) => {
		comboBoxControls.setValues(event, new Set());
	};

	return [
		combineRefs(setTrigger, setInput),
		combineRefs(setDropdown, setListBox),
		{
			...comboBoxControls,
			clear,
			hideOnBlur,
		},
	] as const;
}
