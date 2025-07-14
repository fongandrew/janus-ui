import { createMemo, createUniqueId, splitProps } from 'solid-js';

import { FormElementPropsContext } from '~/lib/components/form-element-context';
import { type FormElementProps } from '~/lib/components/form-element-props';
import { type ListBoxProps } from '~/lib/components/list-box';
import { SelectButtonContainer } from '~/lib/components/select-button-container';
import { SelectOptionList } from '~/lib/components/select-option-list';
import { VALIDATE_ATTR } from '~/lib/utility/callback-attrs/validate';
import { useSingleProp } from '~/lib/utility/solid/prop-mod-context';

export type SelectProps = Omit<FormElementProps<'div'>, 'onValidate'> &
	Pick<ListBoxProps, 'name' | 'multiple' | 'values' | 'onChange' | 'onValues' | 'onValidate'> & {
		/** Placeholder text when no selection */
		placeholder?: string | undefined;
	};

/**
 * Select dropdown component for single or multiple selection
 *
 * @example
 * ```tsx
 * // Basic single selection
 * const [value, setValue] = createSignal<Set<string>>(new Set());
 *
 * 	<Select
 * 		name="fruit"
 * 		placeholder="Select a fruit..."
 * 		values={value()}
 * 		onValues={setValue}
 * 	>
 * 		<ListBoxItem value="apple">Apple</ListBoxItem>
 * 		<ListBoxItem value="banana">Banana</ListBoxItem>
 * 		<ListBoxItem value="orange">Orange</ListBoxItem>
 * 	</Select>
 *
 * // Multiple selection
 * 	<Select
 * 		name="color"
 * 		placeholder="Select colors..."
 * 		values={value()}
 * 		onValues={setValue}
 * 		multiple
 * 	>
 * 		<ListBoxItem value="red">Red</ListBoxItem>
 * 		<ListBoxItem value="green">Green</ListBoxItem>
 * 		<ListBoxItem value="blue">Blue</ListBoxItem>
 * 	</Select>
 *
 * // With grouped options
 * 	<Select
 * 		name="color"
 * 		placeholder="Select a color..."
 * 		values={value()}
 * 		onValues={setValue}
 * 	>
 * 		<ListBoxGroup heading="Primary Colors">
 * 			<ListBoxItem value="red">Red</ListBoxItem>
 * 			<ListBoxItem value="blue">Blue</ListBoxItem>
 * 			<ListBoxItem value="yellow">Yellow</ListBoxItem>
 * 		</ListBoxGroup>
 * 		<ListBoxGroup heading="Secondary Colors">
 * 			<ListBoxItem value="green">Green</ListBoxItem>
 * 			<ListBoxItem value="purple">Purple</ListBoxItem>
 * 			<ListBoxItem value="orange">Orange</ListBoxItem>
 * 		</ListBoxGroup>
 * 	</Select>
 * ```
 */
export function Select(props: SelectProps) {
	const [optionListProps, rest] = splitProps(props, [
		'children',
		'name',
		'multiple',
		'values',
		'onChange',
		'onValues',
		'onValidate',
		VALIDATE_ATTR,
	]);

	// Single select is listbox or radio-like, which don't allow clearing if required
	const clearable = createMemo(() => {
		const required = props.required || useSingleProp(FormElementPropsContext, 'required');
		return !required || props.multiple;
	});

	const listId = createUniqueId();
	return (
		<SelectButtonContainer
			listId={listId}
			clearable={clearable()}
			values={props.values}
			{...rest}
		>
			<SelectOptionList listBoxId={listId} {...optionListProps} autofocus />
		</SelectButtonContainer>
	);
}
