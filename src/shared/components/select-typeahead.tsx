import cx from 'classix';
import { createSignal, splitProps } from 'solid-js';

import { type FormElementProps } from '~/shared/components/form-element-props';
import { Input } from '~/shared/components/input';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectControl } from '~/shared/components/select-control';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { generateId } from '~/shared/utility/id-generator';

export interface SelectTypeaheadProps extends Omit<FormElementProps<'input'>, 'onValidate'> {
	/** Name for form submission */
	name?: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Currently selected values (controlled) */
	values?: Set<string>;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onValues?: (value: Set<string>, event: MouseEvent | KeyboardEvent) => void;
	/** Called when typing happens */
	onValueInput?: (value: string, event: InputEvent) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Disables clearing selection */
	required?: boolean;
	/** Custom validation function for this element */
	onValidate?: (
		values: Set<string>,
		event: Event & { delegateTarget: HTMLElement },
	) => string | undefined | null | Promise<string | undefined | null>;
}

export function SelectTypeahead(props: SelectTypeaheadProps) {
	const [listBoxProps, local, inputProps] = splitProps(
		props,
		['values', 'defaultValues', 'onValues', 'onValidate', 'multiple', 'required'],
		['children', 'name', 'onValueInput', 'placeholder'],
	);
	const selectControl = new SelectControl(listBoxProps);

	const descriptionId = generateId('select-description');
	selectControl.extAttr('aria-describedby', descriptionId);

	const [input, setInput] = createSignal('');
	const handleInput = (event: InputEvent) => {
		const target = event.target as HTMLInputElement;

		// Force open if applicable
		if (target.value) {
			selectControl.show();
		}

		// Update state callbacks
		setInput(target.value);
		props.onValueInput?.(target.value, event);

		// Queue microtask to ensure highlight happens after list is updated
		// from input() changes
		queueMicrotask(() => {
			const firstItem = selectControl.items()[0];
			if (!firstItem) return;
			selectControl.highlight(firstItem, event);
		});
	};
	selectControl.handle('onInput', handleInput);

	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) => {
		return listBoxProps.onValidate?.(selectControl.values(), event);
	};

	return (
		<SelectContainer
			onClear={selectControl.clear.bind(selectControl)}
			// Added offset to account for input focus rings
			dropdownOffset={8}
		>
			{() => (
				<>
					<Input
						{...selectControl.merge(inputProps)}
						class={cx('c-select__input', props.class)}
						onValidate={handleValidate}
						unstyled
					/>
					<div id={descriptionId} class="c-select__input_description">
						<SelectText
							placeholder={local.placeholder}
							values={selectControl.values()}
							getItemByValue={selectControl.item.bind(selectControl)}
						/>
					</div>
				</>
			)}
			{() => (
				<SelectOptionList
					name={local.name}
					input={input()}
					values={selectControl.values()}
					listCtrl={selectControl.listCtrl}
				>
					{local.children}
				</SelectOptionList>
			)}
		</SelectContainer>
	);
}
