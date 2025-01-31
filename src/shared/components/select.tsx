import '~/shared/components/select.css';

import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import { type FormElementProps } from '~/shared/components/form-element-props';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectControl } from '~/shared/components/select-control';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';

export interface SelectProps extends Omit<FormElementProps<'button'>, 'onValidate'> {
	/** Name for form submission */
	name?: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Currently selected values (controlled) */
	values?: Set<string>;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onValues?: (values: Set<string>, event: MouseEvent | KeyboardEvent) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Disables clearing selection */
	required?: boolean;
	/** Make children required */
	children: JSX.Element;
	/** Custom validation function for this element */
	onValidate?: (
		values: Set<string>,
		event: Event & { delegateTarget: HTMLElement },
	) => string | undefined | null | Promise<string | undefined | null>;
}

export function Select(props: SelectProps) {
	const [listBoxProps, local, buttonProps] = splitProps(
		props,
		['values', 'defaultValues', 'onValues', 'onValidate', 'multiple', 'required'],
		['children', 'name', 'placeholder'],
	);
	const selectControl = new SelectControl(listBoxProps);

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => selectControl.items());
	selectControl.handle('onKeyDown', (event: KeyboardEvent) => {
		// If here, check if we're typing a character to filter the list (force open too)
		if (event.key.length === 1) {
			selectControl.show();
			const node = matchText(event.key);
			selectControl.highlight(node, event);
		}
	});

	// Transform Set<string> validator to string validator for underlying control
	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) =>
		listBoxProps.onValidate?.(selectControl.values(), event);

	return (
		<SelectContainer onClear={selectControl.clear.bind(selectControl)}>
			{() => (
				<Button
					{...selectControl.merge({ ...buttonProps, onValidate: handleValidate })}
					class={cx('c-select__button', props.class)}
					unstyled
				>
					<SelectText
						placeholder={local.placeholder}
						values={selectControl.values()}
						getItemByValue={selectControl.item.bind(selectControl)}
					/>
				</Button>
			)}
			{() => (
				<SelectOptionList
					name={local.name}
					values={selectControl.values()}
					listCtrl={selectControl.listCtrl}
				>
					{local.children}
				</SelectOptionList>
			)}
		</SelectContainer>
	);
}
