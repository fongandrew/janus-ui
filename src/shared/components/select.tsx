import { createUniqueId, splitProps } from 'solid-js';

import { type FormElementProps } from '~/shared/components/form-element-props';
import { type ListBoxProps } from '~/shared/components/list-box';
import { SelectButtonContainer } from '~/shared/components/select-button-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { VALIDATE_ATTR } from '~/shared/utility/callback-attrs/validate';

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

	const listId = createUniqueId();
	return (
		<SelectButtonContainer listId={listId} {...rest}>
			<SelectOptionList listBoxId={listId} {...optionListProps} autofocus />
		</SelectButtonContainer>
	);
}
