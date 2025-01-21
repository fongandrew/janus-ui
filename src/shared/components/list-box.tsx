import cx from 'classix';
import { Check } from 'lucide-solid';
import { For, type JSX, splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { ListBoxControl } from '~/shared/components/list-box-control';
import { OptionList, OptionListGroup, OptionListItem } from '~/shared/components/option-list';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { generateId } from '~/shared/utility/id-generator';

export interface ListBoxProps extends FormElementProps<'div'> {
	/** Name for form submission */
	name?: string | undefined;
	/** Is listbox disabled? */
	disabled?: boolean | undefined;
	/** Currently selected values (controlled) */
	values?: Set<string> | undefined;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onValues?: (values: Set<string>, event: MouseEvent | KeyboardEvent) => void;
	/** Autofocus listbox? */
	autofocus?: boolean | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
	/** Disables clearing selection */
	required?: boolean | undefined;
	/** Make children required */
	children: JSX.Element;
}

export function ListBox(props: ListBoxProps) {
	const [local, rest] = splitProps(props, [
		'children',
		'name',
		'values',
		'defaultValues',
		'onValues',
		'multiple',
		'required',
	]);
	const listBoxControl = new ListBoxControl(local);

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => listBoxControl.items());
	listBoxControl.handle('onKeyDown', (event: KeyboardEvent) => {
		// Check if we're typing a character to filter the list
		if (event.key.length === 1) {
			const node = matchText(event.key);
			node?.focus();
		}
	});

	return (
		<OptionList
			{...mergeFormElementProps<'div'>(listBoxControl.merge(rest))}
			role="listbox"
			tabIndex={0}
			class={cx('c-list-box', rest.class)}
		>
			{local.children}
			{local.name && <ListBoxSelections name={local.name} values={listBoxControl.values()} />}
		</OptionList>
	);
}

export interface ListBoxItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/**
	 * Option value for this prop -- if not set, will be autoassigned one for
	 * option list matching purposes
	 */
	value?: string;
}

/** A single list box item */
export function ListBoxItem(props: ListBoxItemProps) {
	return (
		<OptionListItem
			{...props}
			class={cx(props.class, 'c-list-box__item')}
			value={props.value ?? generateId('list-box-item')}
		>
			<div role="presentation" class="c-list-box__check-box">
				<Check />
			</div>
			<span class="c-list-box__item_text">{props.children}</span>
		</OptionListItem>
	);
}

/** No need for any changes to this. Just alias for use with list boxes */
export { OptionListGroup as ListBoxGroup };

/** Returns a list of hidden inputs so option list selections can be sent to forms */
export function ListBoxSelections(props: { name: string; values: Set<string> }) {
	return (
		<>
			<For each={Array.from(props.values)}>
				{(value) => <input type="hidden" name={props.name} value={value} />}
			</For>
		</>
	);
}
