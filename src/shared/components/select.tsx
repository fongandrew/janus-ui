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
