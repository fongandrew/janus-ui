import { type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import {
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { dropdownCloseOnBlur } from '~/shared/handlers/dropdown';
import { menuCloseOnSelect, menuFocusOnOpen, menuKeyDown } from '~/shared/handlers/menu';
import { getItemValue } from '~/shared/handlers/option-list';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface MenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Called when a menu item is selected */
	onValue?: (value: string, event: Event) => void;
	/** Make children required */
	children: JSX.Element;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['children', 'onValue']);

	const handleClick = (event: Event) => {
		const value = getItemValue(event.target as HTMLElement);
		if (typeof value === 'string') {
			local.onValue?.(value, event);
		}
	};

	return (
		<DropdownContent
			{...handlerProps(menuFocusOnOpen, dropdownCloseOnBlur)}
			{...extendHandler(props, 'onClick', handleClick)}
			{...rest}
		>
			<OptionList role="menu" {...handlerProps(menuKeyDown, menuCloseOnSelect)}>
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
