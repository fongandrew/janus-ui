import cx from 'classix';
import { Check } from 'lucide-solid';
import { children, type ComponentProps, type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { mountAttr } from '~/lib/utility/callback-attrs/no-js';
import { createAutoId } from '~/lib/utility/solid/auto-prop';
import { spanify } from '~/lib/utility/solid/spanify';

export interface OptionListProps extends ComponentProps<'div'> {
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
	return <div {...props} class={cx('c-option-list', props.class)} />;
}

export type OptionListItemProps<TElement> = {
	/** Value of the option */
	value: string;
} & (TElement extends HTMLInputElement ? ComponentProps<'input'> : ComponentProps<'div'>);

/** Option list selectable input item, meant for use in Listbox-like components */
export function OptionListSelectable(props: ComponentProps<'input'>) {
	const [local, rest] = splitProps(props, ['children', 'class', 'style', 'id']);
	const id = createAutoId(local);
	return (
		<label class={cx('t-unstyled', 'c-option-list__item', local.class)} style={local.style}>
			<input
				id={id()}
				role="option"
				type="checkbox"
				class="t-sr-only"
				aria-selected={String(!!rest.checked) as 'true' | 'false'}
				tabIndex={isServer ? 0 : -1}
				{...rest}
				{...callbackAttrs(rest, isServer && mountAttr('tabindex', '-1'))}
			/>
			<div role="presentation" class="c-option-list__check-box">
				<Check />
			</div>
			<span>{local.children}</span>
		</label>
	);
}

/** Button list item, meant for use in Menu-like components */
export function OptionListButton(props: ComponentProps<'button'>) {
	const id = createAutoId(props);
	const resolved = children(() => props.children);
	return (
		<button role="option" {...props} id={id()} class={cx('c-option-list__item', props.class)}>
			{spanify(resolved.toArray())}
		</button>
	);
}

/** Anchor link list item, meant for use in Menu-like components */
export function OptionListAnchor(props: ComponentProps<'a'>) {
	const id = createAutoId(props);
	const resolved = children(() => props.children);
	return (
		<a {...props} id={id()} class={cx('c-option-list__item', props.class)}>
			{spanify(resolved.toArray())}
		</a>
	);
}

export interface OptionGroupProps extends ComponentProps<'div'> {
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
