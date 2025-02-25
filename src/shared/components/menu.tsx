import { type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import {
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { MenuControl } from '~/shared/utility/controls/menu-control';
import { useControl } from '~/shared/utility/solid/use-control';

export interface MenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Called when a menu item is selected */
	onValue?: (value: string, event: Event) => void;
	/** Require onClick to be functional */
	onClick?: (event: Event) => void;
	/** Make children required */
	children: JSX.Element;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['children', 'onValue']);

	const ctrlProps = useControl(MenuControl, {
		onSelect: (value, _elm, event) => {
			local.onValue?.(value, event);
		},
	});

	return (
		<DropdownContent {...rest}>
			<OptionList role="menu" {...ctrlProps}>
				{local.children}
			</OptionList>
		</DropdownContent>
	);
}

export interface MenuItemProps extends JSX.HTMLAttributes<HTMLButtonElement> {
	/** URL for the menu item */
	role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
	/**
	 * Option value for this prop -- if not set, will be autoassigned one for
	 * option list matching purposes
	 */
	value?: string;
}

/** A single menu item */
export function MenuItem(props: MenuItemProps) {
	return <OptionListButton role="menuitem" {...props} value={props.value ?? createUniqueId()} />;
}

/** Menu item variant that's a link */
export function MenuItemLink(props: JSX.HTMLAttributes<HTMLAnchorElement> & { href: string }) {
	return <OptionListAnchor role="menuitem" value={createUniqueId()} {...props} />;
}

/** No need for any changes to this. Just alias for use with menus */
export { OptionListGroup as MenuGroup };
