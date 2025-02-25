import cx from 'classix';
import { Check } from 'lucide-solid';
import { For, type JSX, mergeProps, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { OptionList, OptionListGroup, OptionListItem } from '~/shared/components/option-list';
import { getControl } from '~/shared/utility/controls/control';
import { HIDDEN_INPUT_CONTAINER_ATTR } from '~/shared/utility/controls/list-box-base-control';
import { ListBoxControl } from '~/shared/utility/controls/list-box-control';
import { useControl } from '~/shared/utility/solid/use-control';

export interface ListBoxProps extends Omit<FormElementProps<'div'>, 'onValidate'> {
	/** Name for form submission */
	name?: string | undefined;
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
	/** Make children required */
	children: JSX.Element;
	/** Custom validation function for this element */
	onValidate?: (
		values: Set<string>,
		event: Event & { delegateTarget: HTMLElement },
	) => string | undefined | null | Promise<string | undefined | null>;
}

export function ListBox(props: ListBoxProps) {
	const [local, listBoxProps, rest] = splitProps(
		props,
		['children', 'onValidate'],
		['defaultValues', 'values', 'onValues', 'multiple'],
	);

	const listBoxAttrs = useControl(ListBoxControl, listBoxProps);

	// Transform Set<string> validator to string validator for underlying control
	const handleValidate = (_value: string, event: Event & { delegateTarget: HTMLElement }) => {
		const values = (
			getControl(event.delegateTarget as HTMLElement) as ListBoxControl
		)?.values();
		return local.onValidate?.(values, event);
	};
	const formElementProps = mergeProps(rest, { onValidate: handleValidate });
	const optionListProps = mergeFormElementProps<'div'>(formElementProps);

	return (
		<OptionList
			{...optionListProps}
			{...listBoxAttrs}
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
			<div {...{ [HIDDEN_INPUT_CONTAINER_ATTR]: '' }} />
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
			value={props.value ?? createUniqueId()}
		>
			<div role="presentation" class="c-list-box__check-box">
				<Check />
			</div>
			<span>{props.children}</span>
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
