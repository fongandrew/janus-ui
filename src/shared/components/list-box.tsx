import cx from 'classix';
import { createContext, createMemo, type JSX, mergeProps, splitProps, useContext } from 'solid-js';
import { createUniqueId } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { ListBoxControl } from '~/shared/components/list-box-control';
import { OptionList, OptionListGroup, OptionListSelectable } from '~/shared/components/option-list';
import { listBoxChange, listBoxKeyDown, listBoxValues } from '~/shared/handlers/list-box';
import { isList } from '~/shared/handlers/option-list';
import { handlerProps } from '~/shared/utility/event-handler-attrs';

export interface ListBoxProps extends Omit<FormElementProps<'div'>, 'onValidate'> {
	/** Name for form submission */
	name?: string | undefined;
	/**
	 * Currently selected values (or if never changed, default values -- see
	 * https://github.com/solidjs/solid/discussions/416 for Solid and controlled state
	 */
	values?: Set<string> | undefined;
	/** Called when selection changes */
	onValues?: (values: Set<string>, event: Event) => void;
	/** Autofocus listbox? */
	autofocus?: boolean | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
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
		'onValues',
		'onValidate',
		'multiple',
		'required',
	]);
	const listBoxControl = new ListBoxControl(local);

	// Trigger values callback on JS change event
	const handleChange = (event: Event) => {
		// Check if this is the list because change events inside the list may be triggered
		// by individual input changes and we're really just looking for the last "list-wide"
		// change event
		const target = event.target;
		if (!isList(target)) return;

		const values = listBoxValues(target);
		local.onValues?.(values, event);
	};

	// Transform Set<string> validator to string validator for underlying control
	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) =>
		local.onValidate?.(listBoxControl.values(), event);
	const formElementProps = mergeProps(rest, { onValidate: handleValidate });
	const optionListProps = mergeFormElementProps<'div'>(formElementProps);

	// Create default name for radio group if not provided
	const context = mergeProps(() => (props.multiple ? { name: createUniqueId() } : {}), props);

	return (
		<ListBoxContext.Provider value={context}>
			<OptionList
				{...handlerProps(listBoxChange, listBoxKeyDown)}
				{...optionListProps}
				role="listbox"
				class={cx('c-list-box', rest.class)}
				tabIndex={0}
				aria-multiselectable={props.multiple}
				onChange={handleChange}
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
