import cx from 'classix';
import { type JSX, onMount, splitProps, useContext } from 'solid-js';

import { createOptionListControl } from '~/shared/components/create-option-list-control';
import { DROPDOWN_CONTENT_REF } from '~/shared/components/dropdown';
import {
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { RefContext } from '~/shared/components/ref-context';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { generateId } from '~/shared/utility/id-generator';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export interface MenuProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	/** Ref returned by createDropdown */
	ref?: (el: HTMLDivElement) => void;
	/** Called when a menu item is selected */
	onSelect?: (event: KeyboardEvent | MouseEvent, value: string) => void;
	/** Require onClick to be functional */
	onClick?: (event: KeyboardEvent | MouseEvent) => void;
	/** Make children required */
	children: JSX.Element;
}

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['onSelect']);

	/**
	 * Set up the menu as an option list control. Main differences from standard
	 * optionList -- focus to highlight, search on keypress, hide on tab, and
	 * hide on escape.
	 */
	const [setMenu, optionListControls] = createOptionListControl({
		onHighlight: (_event, elm) => {
			elm.focus();
		},
		onSelect: (event, _elm, target) => {
			local.onSelect?.(event, target);
			optionListControls.getNode()?.hidePopover();
		},
	});

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => optionListControls.getItems());

	onMount(() => {
		const menu = optionListControls.getNode();
		if (!menu) {
			return;
		}
		if (!menu.querySelector('[autofocus]')) {
			const first = optionListControls.getFirstItem();
			if (first) {
				first.autofocus = true;
			}
		}
	});

	const handleKeyDown = (event: KeyboardEvent) => {
		switch (event.key) {
			// Arrow keys handled by createOptionListControl
			// Escape key handled by poopver light dismiss

			case 'Tab': {
				// We're assuming menu is in a popover right after the trigger so the
				// tab sequence will naturally go to the right thing. This might do
				// weird things in a portal though. Consider passing a reference
				// to the trigger to menu so we can correctly focus it.
				optionListControls.getNode()?.hidePopover();
				break;
			}
			default: {
				// If here, check if we're typing a character to filter the list
				if (event.key.length === 1) {
					const node = matchText(event.key);
					optionListControls.highlight(event, node);
				}
			}
		}
	};

	const getRefs = useContext(RefContext);

	return (
		<OptionList
			{...rest}
			ref={combineRefs(setMenu, ...getRefs(DROPDOWN_CONTENT_REF), props.ref)}
			role="menu"
			class={cx('c-dropdown', props.class)}
			onKeyDown={handleKeyDown}
		/>
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
