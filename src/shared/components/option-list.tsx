/** A group */
import cx from 'classix';
import { type JSX, onCleanup, onMount, splitProps, useContext } from 'solid-js';

import { OptionListContext } from '~/shared/components/option-list-context';
import { generateId } from '~/shared/utility/id-generator';
import { normalizeText } from '~/shared/utility/normalize-text';

export interface OptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Force any refs to be callback refs */
	ref?: (el: HTMLDivElement) => void;
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
	return <div {...props} />;
}

/**
 * Data variable used to identify the associated value of an element since an actual
 * value attribute may be semantically incorrect.
 */
export const LIST_OPTION_VALUE_ATTR = 'data-list-option-value';

function useOptionListItemProps(value: string) {
	const context = useContext(OptionListContext);
	if (!context) return;

	const ref = (el: HTMLElement) => {
		context.refs.set(value, el);
	};

	onMount(() => {
		const text = context.refs.get(value)?.textContent ?? value;
		context.text.set(value, normalizeText(text));
	});

	onCleanup(() => {
		context.refs.delete(value);
	});

	return {
		ref,
		role: 'option' as const,
		'aria-selected': context.selectedValues().has(value),
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
	return (
		<div
			{...useOptionListItemProps(local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

/** Button list item, meant for use in Menu-like components */
export function OptionListButton(props: OptionListItemProps<HTMLButtonElement>) {
	const [local, rest] = splitProps(props, ['value']);
	return (
		<button
			{...useOptionListItemProps(local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		/>
	);
}

/** Anchor link list item, meant for use in Menu-like components */
export function OptionListAnchor(props: OptionListItemProps<HTMLAnchorElement> & { href: string }) {
	const [local, rest] = splitProps(props, ['value']);
	return (
		<a
			{...useOptionListItemProps(local.value)}
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
