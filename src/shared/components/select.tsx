import cx from 'classix';
import { createUniqueId, type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	createListBoxValidator,
	listBoxRequired,
	type ListBoxValidator,
	listBoxValues,
} from '~/shared/components/callbacks/list-box';
import { getList } from '~/shared/components/callbacks/option-list';
import {
	selectButtonClick,
	selectButtonKeyDown,
	selectFocusOut,
	selectMountText,
	selectResetText,
	selectUpdateText,
} from '~/shared/components/callbacks/select';
import { type FormElementProps } from '~/shared/components/form-element-props';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface SelectProps extends Omit<FormElementProps<'button'>, 'onValidate'> {
	/** Name for form submission */
	name?: string | undefined;
	/** Placeholder text when no selection */
	placeholder?: string | undefined;
	/**
	 * Currently selected values (or if never changed, default values -- see
	 * https://github.com/solidjs/solid/discussions/416 for Solid and controlled state
	 */
	values?: Set<string> | undefined;
	/** Called when selection changes */
	onValues?: ((values: Set<string>, event: Event) => void) | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
	/** Make children required */
	children: JSX.Element;
	/** Custom validation function for this element */
	onValidate?: ListBoxValidator | undefined;
}

export function Select(props: SelectProps) {
	const [local, buttonProps] = splitProps(props, [
		'children',
		'name',
		'placeholder',
		'values',
		'onValues',
		'onValidate',
		'multiple',
	]);

	const listId = createUniqueId();

	// Trigger values callback on JS change event
	const handleChange = (event: Event) => {
		const listElm = getList(event.target as HTMLElement);
		if (!listElm) return;

		const values = listBoxValues(listElm);
		local.onValues?.(values, event);
	};

	// Add values to validator
	const handleValidate = createListBoxValidator((values, event) =>
		local.onValidate?.(values, event),
	);

	const selectInputTextId = createUniqueId();
	const selectUpdateTextId = createUniqueId();

	return (
		<SelectContainer
			listId={listId}
			{...callbackAttrs(
				selectMountText(selectUpdateTextId),
				selectUpdateText(selectUpdateTextId),
				selectResetText(selectUpdateTextId),
			)}
		>
			<Button
				{...buttonProps}
				{...callbackAttrs(
					buttonProps,
					selectButtonClick,
					selectButtonKeyDown,
					selectFocusOut,
					(props.required || props['aria-required']) && listBoxRequired,
				)}
				{...extendHandler(buttonProps, 'onChange', handleChange)}
				role="combobox"
				class={cx('c-select__button', props.class)}
				onValidate={handleValidate}
				aria-controls={listId}
				aria-haspopup="listbox"
				aria-multiselectable={props.multiple}
				unstyled
			>
				<SelectText id={selectUpdateTextId} placeholder={local.placeholder} />
			</Button>
			<SelectOptionList
				listBoxId={listId}
				selectInputTextId={selectInputTextId}
				name={local.name}
				multiple={local.multiple}
				values={local.values}
			>
				{local.children}
			</SelectOptionList>
		</SelectContainer>
	);
}
