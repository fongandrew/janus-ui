import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import { createSelectControl } from '~/shared/components/create-select-control';
import { SelectContainer } from '~/shared/components/select-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { SelectText } from '~/shared/components/select-text';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export interface SelectProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
	/** Ref must be callback */
	ref?: (element: HTMLButtonElement) => void;
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
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Disables clearing selection */
	required?: boolean;
	/** Make children required */
	children: JSX.Element;
}

export function Select(props: SelectProps) {
	const [listBoxProps, rest] = splitProps(props, [
		'values',
		'defaultValues',
		'onChange',
		'multiple',
		'required',
	]);
	const [local, buttonProps] = splitProps(rest, ['children', 'name', 'placeholder']);
	const [setControl, setListBox, selectControls] = createSelectControl(listBoxProps);

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => selectControls.getItems());
	const handleKeyDown = (event: KeyboardEvent) => {
		// If here, check if we're typing a character to filter the list (force open too)
		if (event.key.length === 1) {
			selectControls.getListBoxNode()?.showPopover();
			const node = matchText(event.key);
			selectControls.highlight(event, node);
		}
	};

	return (
		<>
			<SelectContainer onClear={selectControls.clear}>
				<Button
					{...buttonProps}
					ref={combineRefs(setControl, props.ref)}
					class={cx('c-select__button', props.class)}
					onBlur={selectControls.hideOnBlur}
					onKeyDown={handleKeyDown}
					aria-haspopup="listbox"
					aria-required={props.required}
					unstyled
				>
					<SelectText
						placeholder={local.placeholder}
						values={selectControls.values()}
						getItemByValue={selectControls.getItemByValue}
					/>
				</Button>
			</SelectContainer>
			<SelectOptionList ref={setListBox} name={local.name} values={selectControls.values()}>
				{local.children}
			</SelectOptionList>
		</>
	);
}
