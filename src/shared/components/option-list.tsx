/** A group */
import cx from 'classix';
import { type JSX, splitProps, useContext } from 'solid-js';

import { OptionListContext } from '~/shared/components/option-list-context';
import { generateId } from '~/shared/utility/id-generator';

export interface OptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Force any refs to be callback refs */
	ref?: (el: HTMLDivElement) => void;
	/** Active item */
	activeId?: string | undefined;
	/** Selected items  */
	selectedValues?: Set<string> | undefined;
	/** Make role required */
	role: 'listbox' | 'menu';
	/** Make children required */
	children: JSX.Element;
}

/**
 * OptionList components is a base component with styling and should be wrapped by
 * OptionListContext.Provider. You probably want to use ListBox or Menu.
 */
export function OptionList(props: OptionListProps) {
	const [local, rest] = splitProps(props, ['activeId', 'selectedValues']);
	const emptySet = new Set<string>();
	return (
		<OptionListContext.Provider
			value={{
				activeId: () => local.activeId,
				selectedValues: () => local.selectedValues ?? emptySet,
			}}
		>
			<div {...rest} class={cx(props.class, 'c-option-list')} />
		</OptionListContext.Provider>
	);
}

/**
 * Data variable used to identify the associated value of an element since an actual
 * value attribute may be semantically incorrect.
 */
export const LIST_OPTION_VALUE_ATTR = 'data-list-option-value';

function useOptionListItemProps(id: string, value: string) {
	const context = useContext(OptionListContext);
	if (!context) return {};

	return {
		id,
		role: 'option' as const,
		'aria-current': context.activeId() === id ? ('true' as const) : undefined,
		'aria-selected': context.selectedValues().has(value) ? ('true' as const) : undefined,
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
	const defaultId = generateId('option');
	const getId = () => props.id || defaultId;
	return (
		<div
			{...useOptionListItemProps(getId(), local.value)}
			{...rest}
			id={getId()}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

/** Button list item, meant for use in Menu-like components */
export function OptionListButton(props: OptionListItemProps<HTMLButtonElement>) {
	const [local, rest] = splitProps(props, ['value']);
	const defaultId = generateId('option');
	const getId = () => props.id || defaultId;
	return (
		<button
			{...useOptionListItemProps(getId(), local.value)}
			{...rest}
			id={getId()}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

/** Anchor link list item, meant for use in Menu-like components */
export function OptionListAnchor(props: OptionListItemProps<HTMLAnchorElement> & { href: string }) {
	const [local, rest] = splitProps(props, ['value']);
	const defaultId = generateId('option');
	const getId = () => props.id || defaultId;
	return (
		<a
			{...useOptionListItemProps(getId(), local.value)}
			{...rest}
			id={getId()}
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
