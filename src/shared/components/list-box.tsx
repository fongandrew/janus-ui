import cx from 'classix';
import { createContext, type JSX, mergeProps, splitProps, useContext } from 'solid-js';
import { createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import {
	connectListBoxValidator,
	listBoxChange,
	listBoxKeyDown,
	listBoxMount,
	listBoxRequired,
	listBoxReset,
	type ListBoxValidator,
	listBoxValues,
} from '~/shared/components/callbacks/list-box';
import { isList } from '~/shared/components/callbacks/option-list';
import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { OptionList, OptionListGroup, OptionListSelectable } from '~/shared/components/option-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { mountAttr } from '~/shared/utility/callback-attrs/no-js';
import { INCOMPLETE_ATTR } from '~/shared/utility/callback-attrs/validate';
import { createAuto } from '~/shared/utility/solid/auto-prop';

export interface ListBoxProps extends Omit<FormElementProps<'div'>, 'onValidate'> {
	/** Name for form submission */
	name?: string | undefined;
	/**
	 * Currently selected values (or if never changed, default values -- see
	 * https://github.com/solidjs/solid/discussions/416 for Solid and controlled state
	 */
	values?: Set<string> | undefined;
	/** Called when selection changes */
	onValues?: ((values: Set<string>, event: Event) => void) | undefined;
	/** Autofocus listbox? */
	autofocus?: boolean | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
	/** Make children required */
	children: JSX.Element;
	/** A rendered set to pass to list box context */
	rendered?: Set<string>;
	/** Unstyled version of listbox? This is used by select. */
	unstyled?: boolean | undefined;
	/** Custom validation function for this element */
	onValidate?: ListBoxValidator | undefined;
}

export const ListBoxContext = createContext<
	(Pick<ListBoxProps, 'name' | 'values' | 'multiple'> & { rendered?: Set<string> }) | undefined
>();

export function ListBox(props: ListBoxProps) {
	const [local, contextProps, rest] = splitProps(
		props,
		['children', 'onValues', 'onValidate', 'required', 'unstyled'],
		['name', 'values', 'multiple', 'rendered'],
	);

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

	// Add values to validator
	const formElementProps = mergeProps(rest, {
		onValidate: connectListBoxValidator((values, event) => local.onValidate?.(values, event)),
	});
	const optionListProps = mergeFormElementProps<'div'>(formElementProps);

	// Create default name for radio group if not provided
	const context = mergeProps({ name: createUniqueId() }, contextProps);

	return (
		<ListBoxContext.Provider value={context}>
			<OptionList
				{...optionListProps}
				{...callbackAttrs(
					optionListProps,
					listBoxChange,
					listBoxMount,
					optionListProps['aria-required'] && listBoxRequired,
					listBoxKeyDown,
					listBoxReset,
					isServer && mountAttr('tabindex', String(optionListProps['tabIndex'] ?? 0)),
				)}
				role="listbox"
				class={cx(local.unstyled ? 't-unstyled' : 'c-list-box', rest.class)}
				tabIndex={optionListProps['tabIndex'] ?? (isServer ? -1 : 0)}
				aria-multiselectable={props.multiple}
				onChange={handleChange}
				{...{
					[INCOMPLETE_ATTR]:
						optionListProps['aria-required'] && !props.values?.size ? '' : undefined,
				}}
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
	const value = createAuto(props, 'value');

	// Track initial rendered state so we can populate hidden inputs for initial render
	context?.rendered?.add(value());

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
