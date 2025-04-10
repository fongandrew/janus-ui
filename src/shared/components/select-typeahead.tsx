import { createUniqueId, splitProps } from 'solid-js';

import { selectInputKeyDown, selectUpdateWithInput } from '~/shared/components/callbacks/select';
import { createFormElementId } from '~/shared/components/form-element-context';
import { type FormElementProps } from '~/shared/components/form-element-props';
import { Input, type InputProps } from '~/shared/components/input';
import { type ListBoxProps } from '~/shared/components/list-box';
import { SelectButtonContainer } from '~/shared/components/select-button-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { VALIDATE_ATTR } from '~/shared/utility/callback-attrs/validate';

export type SelectTypeaheadProps = Omit<FormElementProps<'div'>, 'onInput' | 'onValidate'> &
	Pick<ListBoxProps, 'name' | 'multiple' | 'values' | 'onChange' | 'onValues' | 'onValidate'> & {
		/** Placeholder text when no selection */
		placeholder?: string | undefined;
		/** Signal that async typeahead is busy */
		busy?: boolean | undefined;
		/** Input handler, tied to typing */
		onInput?: InputProps['onInput'] | undefined;
		/** Called when typing happens */
		onValueInput?: ((value: string, event: Event) => void) | undefined;
	};

export function SelectTypeahead(props: SelectTypeaheadProps) {
	const [inputProps, buttonOptionListShared, optionListProps, rest] = splitProps(
		props,
		['invalid', 'aria-invalid', 'onInput', 'onValueInput', 'placeholder'],
		['required', 'aria-required'],
		[
			'children',
			'name',
			'multiple',
			'values',
			'onChange',
			'onValues',
			'onValidate',
			VALIDATE_ATTR,
		],
	);

	const id = createFormElementId(props);
	const listId = createUniqueId();
	const selectInputTextId = createUniqueId();

	return (
		<SelectButtonContainer
			listId={listId}
			inputId={id()}
			aria-busy={props.busy}
			aria-haspopup="dialog"
			placeholder={inputProps.placeholder}
			{...buttonOptionListShared}
			{...rest}
		>
			<Input
				{...inputProps}
				{...callbackAttrs(
					inputProps,
					selectInputKeyDown,
					selectUpdateWithInput(selectInputTextId),
				)}
				id={id()}
				role="combobox"
				class="c-select__input"
				aria-autocomplete="list"
				aria-controls={listId}
				aria-multiselectable={props.multiple}
				autofocus
				unstyled
			/>
			<SelectOptionList
				busy={props.busy}
				listBoxId={listId}
				selectInputTextId={selectInputTextId}
				tabIndex={-1}
				{...buttonOptionListShared}
				{...optionListProps}
			/>
		</SelectButtonContainer>
	);
}
