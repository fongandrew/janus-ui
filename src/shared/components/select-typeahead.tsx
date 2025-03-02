import cx from 'classix';
import { createMemo, createUniqueId, splitProps } from 'solid-js';

import { Input, type InputProps } from '~/shared/components/input';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { listBoxValues } from '~/shared/handlers/list-box';
import { getList } from '~/shared/handlers/option-list';
import {
	selectFocusOut,
	selectHighlightOnInput,
	selectInputClick,
	selectInputKeyDown,
	selectMountText,
	selectUpdateText,
	selectUpdateWithInput,
} from '~/shared/handlers/select';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';
import { useMountAttrs } from '~/shared/utility/solid/use-mount-attrs';

export interface SelectTypeaheadProps extends Omit<InputProps, 'onValidate'> {
	/** Name for form submission */
	name?: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/**
	 * Currently selected values (or if never changed, default values -- see
	 * https://github.com/solidjs/solid/discussions/416 for Solid and controlled state
	 */
	values?: Set<string>;
	/** Called when selection changes */
	onValues?: (value: Set<string>, event: Event) => void;
	/** Called when typing happens */
	onValueInput?: (value: string, event: Event) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Custom validation function for this element */
	onValidate?: (
		values: Set<string>,
		event: Event & { delegateTarget: HTMLElement },
	) => string | undefined | null | Promise<string | undefined | null>;
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

	// Transform Set<string> validator to string validator for underlying control
	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) => {
		const listElm = getList(event.target as HTMLElement);
		if (!listElm) return;
		return local.onValidate?.(listBoxValues(listElm), event);
	};

	const id = createMemo(() => inputProps.id || createUniqueId());
	const mounterProps = useMountAttrs(selectMountText);

	return (
		<SelectContainer
			listId={listId}
			inputId={id()}
			{...handlerProps(selectUpdateText, selectUpdateWithInput)}
			{...mounterProps}
		>
			{(triggerProps) => (
				<>
					<Input
						{...triggerProps}
						{...inputProps}
						{...handlerProps(
							triggerProps,
							inputProps,
							selectInputClick,
							selectInputKeyDown,
							selectFocusOut,
							selectHighlightOnInput,
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
						<SelectText placeholder={local.placeholder} />
					</div>
				</>
			)}
			{(props) => (
				<SelectOptionList
					{...props}
					listBoxId={listId}
					input={inputProps.value ? String(inputProps.value) : undefined}
					name={local.name}
					multiple={local.multiple}
					values={local.values}
				>
					{local.children}
				</SelectOptionList>
			)}
		</SelectContainer>
	);
}
