import cx from 'classix';
import { createUniqueId, splitProps } from 'solid-js';

import {
	createListBoxValidator,
	type ListBoxValidator,
	listBoxValues,
} from '~/shared/components/callbacks/list-box';
import { getList } from '~/shared/components/callbacks/option-list';
import {
	selectFocusOut,
	selectInputClick,
	selectInputKeyDown,
	selectInputPointer,
	selectMountText,
	selectUpdateText,
	selectUpdateWithInput,
} from '~/shared/components/callbacks/select';
import { createFormElementId } from '~/shared/components/form-element-context';
import { Input, type InputProps } from '~/shared/components/input';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectPopover } from '~/shared/components/select-popover';
import { SelectText } from '~/shared/components/select-text';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface SelectTypeaheadProps extends Omit<InputProps, 'onValidate'> {
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
	const [local, inputProps] = splitProps(props, [
		'children',
		'name',
		'placeholder',
		'values',
		'onValues',
		'onValueInput',
		'onValidate',
		'multiple',
	]);

	const descriptionId = createUniqueId();
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

	return (
		<SelectContainer
			listId={listId}
			inputId={id()}
			aria-busy={props.busy}
			{...callbackAttrs(
				selectMountText(selectUpdateTextId),
				selectUpdateText(selectUpdateTextId),
				selectUpdateWithInput(selectInputTextId),
			)}
		>
			<Input
				{...inputProps}
				{...callbackAttrs(
					inputProps,
					selectInputClick,
					selectInputPointer,
					selectInputKeyDown,
					selectFocusOut,
				)}
				{...extendHandler(props, 'onChange', handleChange)}
				{...extendHandler(props, 'onInput', handleInput)}
				id={id()}
				role="combobox"
				class={cx('c-select__input', props.class)}
				onValidate={handleValidate}
				aria-autocomplete="list"
				aria-controls={listId}
				aria-describedby={descriptionId}
				aria-haspopup="listbox"
				aria-multiselectable={props.multiple}
				unstyled
			/>
			<div id={descriptionId} class="c-select__input_description">
				<SelectText id={selectUpdateTextId} placeholder={local.placeholder} />
			</div>
			<SelectPopover>
				<SelectOptionList
					busy={props.busy}
					listBoxId={listId}
					selectInputTextId={selectInputTextId}
					input={inputProps.value ? String(inputProps.value) : undefined}
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
