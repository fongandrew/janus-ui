import { type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import {
	Dropdown,
	DropdownContent,
	type DropdownProps,
	type PopoverRenderProps,
	type TriggerRenderProps,
} from '~/shared/components/dropdown';
import {
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { dropdownCloseOnBlur } from '~/shared/handlers/dropdown';
import {
	menuCloseOnSelect,
	menuFocusOnOpen,
	menuKeyDown,
	menuTriggerClick,
	menuTriggerKeyDown,
} from '~/shared/handlers/menu';
import { getItemValue } from '~/shared/handlers/option-list';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface MenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID is required */
	id: string;
	/** Called when a menu item is selected */
	onValue?: (value: string, event: Event) => void;
	/** Make children required */
	children: JSX.Element;
}

export interface MenuTriggerProps extends DropdownProps {
	/** Two render func children -- first for trigger, second for menu */
	children: [
		(props: TriggerRenderProps) => JSX.Element,
		(props: PopoverRenderProps) => JSX.Element,
	];
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
			{...rest}
			{...handlerProps(props, menuFocusOnOpen, dropdownCloseOnBlur)}
			{...extendHandler(props, 'onClick', handleClick)}
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
	return <OptionListAnchor role="menuitem" {...props} />;
}

/** No need for any changes to this. Just alias for use with menus */
export { OptionListGroup as MenuGroup };

/**
 * MenuTrigger is a wrapper around Dropdown to match the menu button to a Menu element
 * and assign arrow key up/down handlers
 */
export function MenuTrigger(props: MenuTriggerProps) {
	return (
		<Dropdown {...props}>
			{(triggerProps) =>
				props.children[0]({
					...triggerProps,
					...handlerProps(triggerProps, menuTriggerClick, menuTriggerKeyDown),
				})
			}
			{(popoverPros) => props.children[1](popoverPros)}
		</Dropdown>
	);
}
