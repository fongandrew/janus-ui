import { type JSX, onMount, splitProps } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import {
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { OptionListControl } from '~/shared/components/option-list-control';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { generateId } from '~/shared/utility/id-generator';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export interface MenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Ref returned by createDropdown */
	ref?: (el: HTMLDivElement) => void;
	/** Called when a menu item is selected */
	onValue?: (value: string, event: KeyboardEvent | MouseEvent) => void;
	/** Require onClick to be functional */
	onClick?: (event: KeyboardEvent | MouseEvent) => void;
	/** Make children required */
	children: JSX.Element;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['children', 'onValue']);

	/** Refs for dropdown element (which may be container and not same as option list) */
	let dropdownRef: HTMLDivElement | null = null;
	const setDropdownRef = (el: HTMLDivElement) => {
		dropdownRef = el;
	};

	/**
	 * Set up the menu as an option list control. Main differences from standard
	 * optionList -- focus to highlight, search on keypress, hide on tab, and
	 * hide on escape.
	 */
	const optionListControl = new OptionListControl({
		onHighlight: (_id, elm) => {
			elm.focus();
		},
		onSelect: (val, _elm, event) => {
			local.onValue?.(val, event);
			dropdownRef?.hidePopover();
		},
	});

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => optionListControl.items());

	onMount(() => {
		const menu = optionListControl.listElm();
		if (!menu) {
			return;
		}
		if (!menu.querySelector('[autofocus]')) {
			const first = optionListControl.items()[0];
			if (first) {
				first.autofocus = true;
			}
		}
	});

	optionListControl.handle('onKeyDown', (event: KeyboardEvent) => {
		switch (event.key) {
			// Arrow keys handled by createOptionListControl
			// Escape key handled by poopver light dismiss

			case 'Tab': {
				// We're assuming menu is in a popover right after the trigger so the
				// tab sequence will naturally go to the right thing. This might do
				// weird things in a portal though. Consider passing a reference
				// to the trigger to menu so we can correctly focus it.
				dropdownRef?.hidePopover();
				break;
			}
			default: {
				// If here, check if we're typing a character to filter the list
				if (event.key.length === 1) {
					const node = matchText(event.key);
					optionListControl.highlight(node, event);
				}
			}
		}
	});

	return (
		<DropdownContent {...rest} ref={combineRefs(setDropdownRef, props.ref)}>
			<OptionList {...optionListControl.merge({ role: 'menu' })}>{local.children}</OptionList>
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
	return (
		<OptionListButton
			role="menuitem"
			{...props}
			value={props.value ?? generateId('menu-item')}
		/>
	);
}

/** Menu item variant that's a link */
export function MenuItemLink(props: JSX.HTMLAttributes<HTMLAnchorElement> & { href: string }) {
	return <OptionListAnchor role="menuitem" value={generateId('menu-item')} {...props} />;
}

/** No need for any changes to this. Just alias for use with menus */
export { OptionListGroup as MenuGroup };
