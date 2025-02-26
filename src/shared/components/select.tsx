import cx from 'classix';
import { createUniqueId, type JSX, mergeProps, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import { type FormElementProps } from '~/shared/components/form-element-props';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { SelectControl } from '~/shared/utility/controls/select-control';
import { useControl } from '~/shared/utility/solid/use-control';

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
	onValues?: (values: Set<string>, event: Event) => void;
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

	// Transform Set<string> validator to string validator for underlying control
	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) =>
		listBoxProps.onValidate?.(selectControl.values(), event);

	const selectProps = mergeProps(buttonProps, { onValidate: handleValidate });
	const listBoxId = createUniqueId();
	const selectControlProps = useControl(SelectControl, {
		listBoxId,
	});

	return (
		<SelectContainer>
			{() => (
				<Button
					{...selectControlProps}
					{...selectProps}
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
			{() => <SelectOptionList id={listBoxId}>{local.children}</SelectOptionList>}
		</SelectContainer>
	);
}
