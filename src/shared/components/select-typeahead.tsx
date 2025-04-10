import cx from 'classix';
import { createUniqueId, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	createListBoxValidator,
	listBoxRequired,
	type ListBoxValidator,
	listBoxValues,
} from '~/shared/components/callbacks/list-box';
import { getList } from '~/shared/components/callbacks/option-list';
import {
	selectInputKeyDown,
	selectMountText,
	selectTypeaheadButtonKeyDown,
	selectUpdateText,
	selectUpdateWithInput,
} from '~/shared/components/callbacks/select';
import { createFormElementId } from '~/shared/components/form-element-context';
import { type FormElementProps } from '~/shared/components/form-element-props';
import { Input, type InputProps } from '~/shared/components/input';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectPopover } from '~/shared/components/select-popover';
import { SelectText } from '~/shared/components/select-text';
import { T } from '~/shared/components/t-components';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { VALIDATE_ATTR } from '~/shared/utility/callback-attrs/validate';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface SelectTypeaheadProps
	extends Omit<FormElementProps<'div'>, 'onChange' | 'onInput' | 'onValidate'> {
	/** Name for form submission */
	name?: string | undefined;
	/** Placeholder text when no selection */
	placeholder?: string | undefined;
	/** Signal that async typeahead is busy */
	busy?: boolean | undefined;
	/**
	 * Currently selected values (or if never changed, default values -- see
	 * https://github.com/solidjs/solid/discussions/416 for Solid and controlled state
	 */
	values?: Set<string> | undefined;
	/** Change handler, tied to input instead */
	onChange?: InputProps['onChange'] | undefined;
	/** Input handler, tied to typing */
	onInput?: InputProps['onInput'] | undefined;
	/** Called when selection changes */
	onValues?: ((value: Set<string>, event: Event) => void) | undefined;
	/** Called when typing happens */
	onValueInput?: ((value: string, event: Event) => void) | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
	/** Custom validation function for this element */
	onValidate?: ListBoxValidator | undefined;
}

export function SelectTypeahead(props: SelectTypeaheadProps) {
	const [local, inputProps, buttonProps, rest] = splitProps(
		props,
		[
			'children',
			'name',
			'placeholder',
			'values',
			'required',
			'aria-required',
			'onChange',
			'onInput',
			'onValues',
			'onValueInput',
			'onValidate',
			'multiple',
		],
		[VALIDATE_ATTR, 'invalid', 'aria-invalid'],
		['aria-describedby', 'aria-labelledby'],
	);

	const listId = createUniqueId();

	const handleInput = (event: InputEvent) => {
		const target = event.target as HTMLInputElement;
		props.onValueInput?.(target.value, event);
	};

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

	const id = createFormElementId(props);
	const selectInputTextId = createUniqueId();
	const selectUpdateTextId = createUniqueId();
	const selectRequiredId = createUniqueId();

	return (
		<SelectContainer
			listId={listId}
			inputId={id()}
			aria-busy={props.busy}
			{...rest}
			{...callbackAttrs(
				rest,
				selectMountText(selectUpdateTextId),
				selectUpdateText(selectUpdateTextId),
			)}
		>
			<Button
				{...buttonProps}
				{...callbackAttrs(buttonProps, selectTypeaheadButtonKeyDown)}
				class={cx('c-select__button', props.class)}
				aria-describedby={attrs(
					buttonProps['aria-describedby'],
					(props.required || props['aria-required']) && selectRequiredId,
				)}
				aria-haspopup="dialog"
				unstyled
			>
				<SelectText id={selectUpdateTextId} placeholder={local.placeholder} />
			</Button>
			{
				/*
					Mark required state with extra descriptive text because it's
					sort of semantically incorrect to use aria-required on what's
					just the popover trigger but it's also weird to stick it on
					the input (not required to have something in the search field,
					just that we select something) and the input is hidden anyways
					if the popover is closed.

					For error state, this should be also associated with the button
					using aria-describedby somehow (the one in LabelledInput works
					well for this).
				*/
				(props.required || props['aria-required']) && (
					<span id={selectRequiredId} class="t-sr-only">
						<T>(Required)</T>
					</span>
				)
			}
			<SelectPopover {...callbackAttrs(selectUpdateWithInput(selectInputTextId))}>
				<Input
					{...inputProps}
					{...callbackAttrs(
						inputProps,
						selectInputKeyDown,
						(props.required || props['aria-required']) && listBoxRequired,
					)}
					{...extendHandler(local, 'onChange', handleChange)}
					{...extendHandler(local, 'onInput', handleInput)}
					id={id()}
					role="combobox"
					class="c-select__input"
					onValidate={handleValidate}
					aria-autocomplete="list"
					aria-controls={listId}
					aria-haspopup="listbox"
					aria-multiselectable={props.multiple}
					autofocus={true}
					unstyled
				/>
				<SelectOptionList
					busy={props.busy}
					listBoxId={listId}
					selectInputTextId={selectInputTextId}
					name={local.name}
					multiple={local.multiple}
					values={local.values}
				>
					{local.children}
				</SelectOptionList>
			</SelectPopover>
		</SelectContainer>
	);
}
