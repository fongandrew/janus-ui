import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface MenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	anchor?: string;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['anchor', 'class', 'children']);
	return (
		<div
			class={attrs('c-menu o-menu', local.class)}
			role="menu"
			popover="auto"
			data-js="t-roving-focus t-typeahead-filter t-request-close"
			aria-orientation="vertical"
			style={local.anchor ? `position-anchor: --${local.anchor}` : undefined}
			{...rest}
		>
			{local.children}
		</div>
	);
}

export interface MenuItemProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	disabled?: boolean;
}

export function MenuItem(props: MenuItemProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<button
			class={attrs('o-menu-item', local.class)}
			role="menuitem"
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}
