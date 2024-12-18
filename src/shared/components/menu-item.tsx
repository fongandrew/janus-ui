import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { MENU_ITEM_VALUE_ATTR } from '~/shared/components/menu';

export type MenuItemProps =
	| ({
			role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
	  } & (JSX.HTMLAttributes<HTMLButtonElement> & { value?: string; href?: undefined }))
	| (JSX.HTMLAttributes<HTMLAnchorElement> & { href: string; value?: undefined });

export function MenuItem(props: MenuItemProps) {
	const [local, rest] = splitProps(props, ['role', 'value', 'href']);

	return (
		<Dynamic
			component={local.href ? 'a' : 'button'}
			{...rest}
			class={cx('c-menu__item', rest.class)}
			role={local.role ?? 'menuitem'}
			tabIndex={0}
			href={local.href}
			{...{ [MENU_ITEM_VALUE_ATTR]: local.value }}
		>
			{props.children}
		</Dynamic>
	);
}
