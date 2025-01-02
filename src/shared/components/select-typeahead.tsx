import cx from 'classix';
import { createSignal, type JSX, splitProps } from 'solid-js';

import { createSelectControl } from '~/shared/components/create-select-control';
import { Input } from '~/shared/components/input';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { generateId } from '~/shared/utility/id-generator';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export interface SelectTypeaheadProps
	extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onInput'> {
	/** Ref must be callback */
	ref?: (element: HTMLInputElement) => void;
	/** Name for form submission */
	name?: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Currently selected values (controlled) */
	values?: Set<string>;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onChange?: (event: MouseEvent | KeyboardEvent, value: Set<string>) => void;
	/** Called when typing happens */
	onInput?: (event: InputEvent, value: string) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Disables clearing selection */
	required?: boolean;
}

export function SelectTypeahead(props: SelectTypeaheadProps) {
	const [listBoxProps, rest] = splitProps(props, [
		'values',
		'defaultValues',
		'onChange',
		'multiple',
		'required',
	]);
	const [local, buttonProps] = splitProps(rest, ['children', 'name', 'placeholder']);
	const [setControl, setListBox, selectControls] = createSelectControl(listBoxProps, {
		// Added offset to account for input focus rings
		offset: 8,
	});

	const descriptionId = generateId('select-description');

	const [input, setInput] = createSignal('');
	const handleInput = (event: InputEvent) => {
		const target = event.target as HTMLInputElement;

		// Force open if applicable
		if (target.value) {
			selectControls.getListBoxNode()?.showPopover();
		}

		// Update state callbacks
		setInput(target.value);
		props.onInput?.(event, target.value);
	};

	return (
		<SelectContainer onClear={selectControls.clear}>
			<Input
				{...buttonProps}
				ref={combineRefs(setControl, props.ref)}
				class={cx('c-select__input', props.class)}
				onBlur={selectControls.hideOnBlur}
				onInput={handleInput}
				aria-describedby={
					buttonProps['aria-describedby']
						? `${buttonProps['aria-describedby']} ${descriptionId}`
						: descriptionId
				}
				aria-haspopup="listbox"
				aria-required={props.required}
				unstyled
			/>
			<div id={descriptionId} class="c-select__input_description">
				<SelectText
					placeholder={local.placeholder}
					values={selectControls.values()}
					getItemByValue={selectControls.getItemByValue}
				/>
			</div>
			<SelectOptionList
				ref={setListBox}
				name={local.name}
				input={input()}
				values={selectControls.values()}
			>
				{local.children}
			</SelectOptionList>
		</SelectContainer>
	);
}
