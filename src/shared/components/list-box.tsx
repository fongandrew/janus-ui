import cx from 'classix';
import { createContext, createMemo, type JSX, mergeProps, splitProps, useContext } from 'solid-js';
import { createUniqueId } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { ListBoxControl } from '~/shared/components/list-box-control';
import { OptionList, OptionListGroup, OptionListSelectable } from '~/shared/components/option-list';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';

export interface ListBoxProps extends Omit<FormElementProps<'div'>, 'onValidate'> {
	/** Name for form submission */
	name?: string | undefined;
	/** Is listbox disabled? */
	disabled?: boolean | undefined;
	/** Currently selected values (controlled) */
	values?: Set<string> | undefined;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onValues?: (values: Set<string>, event: Event) => void;
	/** Autofocus listbox? */
	autofocus?: boolean | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
	/** Disables clearing selection */
	required?: boolean | undefined;
	/** Make children required */
	children: JSX.Element;
	/** Custom validation function for this element */
	onValidate?: (
		values: Set<string>,
		event: Event & { delegateTarget: HTMLElement },
	) => string | undefined | null | Promise<string | undefined | null>;
}

const ListBoxContext = createContext<
	Pick<ListBoxProps, 'name' | 'values' | 'multiple'> | undefined
>();

export function ListBox(props: ListBoxProps) {
	const [local, rest] = splitProps(props, [
		'children',
		'name',
		'values',
		'defaultValues',
		'onValues',
		'onValidate',
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
			listBoxControl.highlight(node, event);
		}
	});

	// Transform Set<string> validator to string validator for underlying control
	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) =>
		local.onValidate?.(listBoxControl.values(), event);

	const optionListProps = mergeFormElementProps<'div'>(
		listBoxControl.merge({ ...rest, onValidate: handleValidate }),
	);

	// Create default name for radio group if not provided
	const context = mergeProps(() => (props.multiple ? { name: createUniqueId() } : {}), props);

	return (
		<ListBoxContext.Provider value={context}>
			<OptionList
				{...optionListProps}
				role="listbox"
				tabIndex={0}
				class={cx('c-list-box', rest.class)}
			>
				{/*
				Note that there's no option to clear a selection here -- assumption
				is that if we care about this, we'll have a separate button or list item
				with the right text
			*/}
				{local.children}
			</OptionList>
		</ListBoxContext.Provider>
	);
}

export interface ListBoxItemProps extends JSX.HTMLAttributes<HTMLInputElement> {
	/**
	 * Option value for this prop -- if not set, will be autoassigned one for
	 * option list matching purposes
	 */
	value?: string;
}

/** A single list box item */
export function ListBoxItem(props: ListBoxItemProps) {
	const context = useContext(ListBoxContext);
	const value = createMemo(() => props.value ?? createUniqueId());
	return (
		<OptionListSelectable
			{...props}
			name={context?.name}
			type={context?.multiple ? 'checkbox' : 'radio'}
			checked={context?.values?.has(value())}
			value={value()}
		/>
	);
}

/** No need for any changes to this. Just alias for use with list boxes */
export { OptionListGroup as ListBoxGroup };
