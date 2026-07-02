/**
 * Menu / MenuItem (§13.7) — `[popover] role="menu"` (`c-menu o-menu`) with
 * roving focus, typeahead, and the request-close chain; items are
 * `<button role="menuitem" class="o-menu-item">`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { ariaize, attrs } from '~/lib2/solid/aria';

export interface MenuProps extends ComponentProps<'div'> {
	/** Required so popovertarget triggers can target it. */
	id: string;
	'data-js'?: string | undefined;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['class', 'data-js']);
	return (
		<div
			{...rest}
			popover
			role="menu"
			aria-orientation="vertical"
			class={cx('c-menu o-menu', local.class)}
			data-js={attrs(
				't-roving-focus t-typeahead-filter t-request-close t-restore-focus',
				local['data-js'],
			)}
		/>
	);
}

export interface MenuItemProps extends ComponentProps<'button'> {}

export function MenuItem(props: MenuItemProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<button
			type="button"
			{...rest}
			role="menuitem"
			class={cx('o-menu-item', local.class)}
			{...ariaize({ disabled: local.disabled })}
		/>
	);
}
