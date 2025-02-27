import '~/shared/utility/use-data-kb-nav';

import cx from 'classix';
import { Check } from 'lucide-solid';
import { children, createMemo, type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { LIST_OPTION_VALUE_ATTR } from '~/shared/components/option-list-control';
import { spanify } from '~/shared/utility/solid/spanify';

export interface OptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Make role required */
	role: 'listbox' | 'menu';
	/** Make children required */
	children: JSX.Element;
}

/**
 * OptionList components is a base component with styling and should be used with a
 * `OptionListControl`. You probably want to use something like ListBox or Menu.
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

export type OptionListItemProps<TElement> = {
	/** Value of the option */
	value: string;
} & (TElement extends HTMLInputElement
	? JSX.InputHTMLAttributes<TElement>
	: JSX.HTMLAttributes<TElement>);

/** Option list selectable input item, meant for use in Listbox-like components */
export function OptionListSelectable(props: OptionListItemProps<HTMLInputElement>) {
	const [local, rest] = splitProps(props, ['children', 'class']);
	const id = createMemo(() => props.id || createUniqueId());
	return (
		<label class={cx('t-unstyled', 'c-option-list__item', local.class)}>
			<input
				type="checkbox"
				class="t-sr-only"
				aria-selected={String(!!rest.checked) as 'true' | 'false'}
				tabIndex={-1}
				{...useOptionListItemProps(id(), props.value)}
				{...rest}
			/>
			<div role="presentation" class="c-option-list__check-box">
				<Check />
			</div>
			<span>{local.children}</span>
		</label>
	);
}

/** Button list item, meant for use in Menu-like components */
export function OptionListButton(props: OptionListItemProps<HTMLButtonElement>) {
	const [local, rest] = splitProps(props, ['value']);
	const id = createMemo(() => props.id || createUniqueId());
	const resolved = children(() => props.children);
	return (
		<button
			{...useOptionListItemProps(id(), local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		>
			{spanify(resolved.toArray())}
		</button>
	);
}

/** Anchor link list item, meant for use in Menu-like components */
export function OptionListAnchor(props: OptionListItemProps<HTMLAnchorElement> & { href: string }) {
	const [local, rest] = splitProps(props, ['value']);
	const id = createMemo(() => props.id || createUniqueId());
	const resolved = children(() => props.children);
	return (
		<a
			{...useOptionListItemProps(id(), local.value)}
			{...rest}
			class={cx('c-option-list__item', props.class)}
		>
			{spanify(resolved.toArray())}
		</a>
	);
}

export interface OptionGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
	heading?: JSX.Element;
}

/** A group of option list items */
export function OptionListGroup(props: OptionGroupProps) {
	const headingId = createUniqueId();
	const [local, rest] = splitProps(props, ['heading']);
	const heading = children(() => local.heading);
	return (
		<>
			{props.heading && (
				<div class="c-option-list__heading" id={headingId}>
					{spanify(heading.toArray())}
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
