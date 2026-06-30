/** `Menu` / `MenuItem` (§13.7) — `c-menu o-menu`, a popover listbox-like menu. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { menu as menuAttrs, menuItem as menuItemAttrs } from '~/lib2/dom/components/menu';
import { ariaize } from '~/lib2/solid/aria';

export interface MenuProps extends ComponentProps<'div'> {
	id: string;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['class']);
	return <div {...menuAttrs()} {...rest} class={cx('c-menu o-menu', local.class)} />;
}

export interface MenuItemProps extends ComponentProps<'button'> {
	disabled?: boolean | undefined;
}

export function MenuItem(props: MenuItemProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<button
			type="button"
			{...menuItemAttrs()}
			{...rest}
			{...ariaize({ disabled: local.disabled })}
			class={cx('o-menu-item', local.class)}
		/>
	);
}
