/**
 * `Menu` / `MenuItem` (§13.7). The menu is a `[popover] role="menu"` wired for
 * roving focus, typeahead, and managed close; items are `[role="menuitem"]` buttons.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

export interface MenuProps extends Omit<ComponentProps<'div'>, 'id'> {
	id: string;
	/** ID of the trigger element this menu anchors to. */
	anchor?: string;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['anchor', 'class', 'style']);
	return (
		<div
			{...rest}
			popover="auto"
			role="menu"
			data-js="t-roving-focus t-typeahead-filter t-request-close"
			aria-orientation="vertical"
			class={cx('c-menu o-menu', local.class)}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.anchor ? { 'position-anchor': `--${local.anchor}` } : {}),
			}}
		/>
	);
}

export interface MenuItemProps extends Omit<ComponentProps<'button'>, 'disabled'> {
	disabled?: boolean;
	icon?: JSX.Element;
}

export function MenuItem(props: MenuItemProps) {
	const [local, rest] = splitProps(props, ['disabled', 'icon', 'class', 'children']);
	return (
		<button
			type="button"
			{...rest}
			role="menuitem"
			aria-disabled={local.disabled || undefined}
			class={cx('o-menu-item', local.class)}
		>
			<Show when={local.icon}>{local.icon}</Show>
			{local.children}
		</button>
	);
}
