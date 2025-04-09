import { type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { dropdownCloseOnBlur } from '~/shared/components/callbacks/dropdown';
import {
	menuAutoFocus,
	menuCloseOnSelect,
	menuKeyDown,
	menuTriggerClick,
	menuTriggerKeyDown,
} from '~/shared/components/callbacks/menu';
import { getItemValue } from '~/shared/components/callbacks/option-list';
import {
	Dropdown,
	DropdownContent,
	DropdownPopover,
	type DropdownPopoverProps,
	type DropdownProps,
} from '~/shared/components/dropdown';
import { FormElementButtonPropsProvider } from '~/shared/components/form-element-context';
import {
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { callbackAttrMods, callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

// Disallow ID since it should be set via context
export interface MenuProps extends DropdownPopoverProps {
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
		<DropdownPopover {...rest} {...callbackAttrs(rest, menuAutoFocus, dropdownCloseOnBlur)}>
			<DropdownContent onClick={handleClick}>
				<OptionList role="menu" {...callbackAttrs(menuKeyDown, menuCloseOnSelect)}>
					{local.children}
				</OptionList>
			</DropdownContent>
		</DropdownPopover>
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
	return <OptionListAnchor role="menuitem" {...props} />;
}

/** No need for any changes to this. Just alias for use with menus */
export { OptionListGroup as MenuGroup };

/**
 * MenuTrigger is a wrapper around Dropdown to match the menu button to a Menu element
 * and assign arrow key up/down handlers
 */
export function MenuTrigger(props: DropdownProps) {
	return (
		<Dropdown {...props}>
			<FormElementButtonPropsProvider
				{...callbackAttrMods(menuTriggerClick, menuTriggerKeyDown)}
			>
				{props.children}
			</FormElementButtonPropsProvider>
		</Dropdown>
	);
}
