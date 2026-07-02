import cx from 'classix';
import { type ComponentProps, createUniqueId, type JSX, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface MenuProps extends ComponentProps<'div'> {
	id?: string;
	/** `anchor-name` (without leading `--`) of the element this menu tracks. */
	anchor?: string;
}

/**
 * Menu (§10.2) — a `[popover] role="menu"` with roving focus, typeahead filter,
 * and request-close behaviors. Open it with a trigger carrying
 * `popovertarget={id}`.
 */
export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['id', 'anchor', 'class', 'style']);
	const id = local.id ?? createUniqueId();
	const style = (): JSX.CSSProperties => ({
		...(local.anchor ? { 'position-anchor': `--${local.anchor}` } : {}),
		...(local.style && typeof local.style === 'object' ? local.style : {}),
	});
	return (
		<div
			{...rest}
			id={id}
			popover
			role="menu"
			aria-orientation="vertical"
			data-js="t-roving-focus t-typeahead-filter t-request-close"
			class={cx('c-menu o-menu', local.class)}
			style={style()}
		/>
	);
}

export interface MenuItemProps extends Omit<ComponentProps<'button'>, 'disabled'> {
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
}

/** MenuItem (§10.2) — a `role="menuitem"` button. */
export function MenuItem(props: MenuItemProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<button
			{...rest}
			type="button"
			role="menuitem"
			{...ariaize({ disabled: local.disabled ?? false })}
			class={cx('o-menu-item', local.class)}
		/>
	);
}
