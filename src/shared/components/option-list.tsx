/** A group */
import cx from 'classix';
import { createMemo, type JSX, splitProps } from 'solid-js';

import { LIST_OPTION_VALUE_ATTR } from '~/shared/components/option-list-control';
import { generateId } from '~/shared/utility/id-generator';

export interface OptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Make role required */
	role: 'listbox' | 'menu';
	/** Make children required */
	children: JSX.Element;
}

/**
 * OptionList components is a base component with styling and should be used with a
 * `createOptionListControl`. You probably want to use something like ListBox or Menu.
 */
export function OptionList(props: OptionListProps) {
	return <div {...props} class={cx(props.class, 'c-option-list')} />;
}

function useOptionListItemProps(id: string, value: string) {
	return {
		id,
		role: 'option' as const,
		[LIST_OPTION_VALUE_ATTR]: value,
	};
}

export interface OptionListItemProps<TElement> extends JSX.HTMLAttributes<TElement> {
	/** Value of the option */
	value: string;
}

/** Option list item, meant for use in Listbox-like components */
export function OptionListItem(props: OptionListItemProps<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['value']);
	const id = createMemo(() => props.id || generateId('option'));
	return (
		<div
			{...useOptionListItemProps(id(), local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

/** Button list item, meant for use in Menu-like components */
export function OptionListButton(props: OptionListItemProps<HTMLButtonElement>) {
	const [local, rest] = splitProps(props, ['value']);
	const id = createMemo(() => props.id || generateId('option'));
	return (
		<button
			{...useOptionListItemProps(id(), local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

/** Anchor link list item, meant for use in Menu-like components */
export function OptionListAnchor(props: OptionListItemProps<HTMLAnchorElement> & { href: string }) {
	const [local, rest] = splitProps(props, ['value']);
	const id = createMemo(() => props.id || generateId('option'));
	return (
		<a
			{...useOptionListItemProps(id(), local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

export interface OptionGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
	heading?: JSX.Element;
}

/** A group of option list items */
export function OptionListGroup(props: OptionGroupProps) {
	const headingId = generateId('option-group-heading');
	const [local, rest] = splitProps(props, ['heading']);
	return (
		<>
			{props.heading && (
				<div class="c-option-list__heading" id={headingId}>
					{local.heading}
				</div>
			)}
			<div
				{...rest}
				class={cx('c-option-list__group', props.class)}
				role="group"
				aria-labelledby={headingId}
			>
				{props.children}
			</div>
		</>
	);
}
