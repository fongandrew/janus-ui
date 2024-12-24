import { flip, offset, shift, size } from '@floating-ui/dom';
import cx from 'classix';
import { createMemo, type JSX, mergeProps, splitProps } from 'solid-js';

import { createComboBoxControl } from '~/shared/components/create-combo-box-control';
import { createDropdown } from '~/shared/components/create-dropdown';
import { ListBoxSelections } from '~/shared/components/list-box';
import { OptionList } from '~/shared/components/option-list';
import { SelectButton } from '~/shared/components/select-button';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

export interface SelectProps
	extends Omit<JSX.IntrinsicAttributes, 'ref'>,
		Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
	/** Ref must be callback */
	ref?: (element: HTMLButtonElement) => void;
	/** Name for form submission */
	name?: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Currently selected values (controlled) */
	values?: Set<string>;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onChange?: (event: MouseEvent | KeyboardEvent, value: Set<string>) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Disables clearing selection */
	required?: boolean;
	/** Make children required */
	children: JSX.Element;
}

export function Select(props: SelectProps) {
	const [listBoxProps, rest] = splitProps(props, [
		'disabled',
		'values',
		'defaultValues',
		'onChange',
		'multiple',
		'required',
	]);
	const [local, buttonProps] = splitProps(rest, ['children', 'name', 'placeholder']);

	// Refs to trigger and dropdown
	const [setTrigger, setDropdown, dropdownControls] = createDropdown([
		offset(4),
		size({
			apply({ rects, elements }) {
				Object.assign(elements.floating.style, {
					minWidth: `${rects.reference.width}px`,
				});
			},
		}),
		flip(),
		shift({ padding: 4 }),
	]);

	// Refs for input and list box
	const comboBoxProps = mergeProps(listBoxProps, {
		onChange: (event: MouseEvent | KeyboardEvent, value: Set<string>) => {
			listBoxProps.onChange?.(event, value);
			if (!props.multiple) {
				dropdownControls.hidePopover();
			}
		},
	});
	const [setInput, setListBox, comboBoxControls] = createComboBoxControl(comboBoxProps);

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => comboBoxControls.getItems());
	const handleKeyDown = (event: KeyboardEvent) => {
		// If here, check if we're typing a character to filter the list
		if (event.key.length === 1) {
			const node = matchText(event.key);
			comboBoxControls.highlight(event, node);
		}
	};

	const handleClear = (event: MouseEvent | KeyboardEvent) => {
		comboBoxControls.setValues(event, new Set());
	};

	const handleBlur = (event: FocusEvent) => {
		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (!relatedTarget) return;
		if (dropdownControls.getTriggerNode()?.contains(relatedTarget)) return;
		if (dropdownControls.getMenuNode()?.contains(relatedTarget)) return;
		dropdownControls.hidePopover();
	};

	// Generate content of trigger
	const isMounted = createMountedSignal();
	const selectionText = createMemo(() => {
		if (!isMounted()) return;

		const contentElm = dropdownControls.getMenuNode();
		if (!contentElm) return;

		const valuesSet = comboBoxControls.values();
		if (valuesSet?.size === 1) {
			for (const value of valuesSet) {
				const textContent = comboBoxControls.getItemByValue(value)?.textContent;
				if (textContent) {
					return <>{textContent}</>;
				}
			}
		}

		if (valuesSet && (valuesSet.size ?? 0) > 1) {
			return <span>{valuesSet.size} selected</span>;
		}

		return <span class="c-select__placeholder">{local.placeholder}</span>;
	});

	const showClear = createMemo(() => {
		if (comboBoxProps.required) return false;
		const size = comboBoxControls.values()?.size;
		return size && size > 0;
	});

	return (
		<>
			<SelectButton
				{...buttonProps}
				ref={combineRefs(setTrigger, setInput, props.ref)}
				aria-haspopup="listbox"
				onClear={showClear() ? handleClear : undefined}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
			>
				{selectionText()}
			</SelectButton>
			<OptionList
				ref={combineRefs(setDropdown, setListBox)}
				role="listbox"
				class={cx('c-dropdown', props.class)}
			>
				{local.children}
				{local.name && (
					<ListBoxSelections name={local.name} values={comboBoxControls.values()} />
				)}
			</OptionList>
		</>
	);
}
