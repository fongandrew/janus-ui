import cx from 'classix';
import { type JSX, onMount, splitProps } from 'solid-js';

import {
	LIST_OPTION_VALUE_ATTR,
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { generateId } from '~/shared/utility/id-generator';
import { nextIndex } from '~/shared/utility/next-index';

export interface MenuProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	/** Ref returned by createDropdown */
	ref: (el: HTMLDivElement) => void;
	/** Called when a menu item is selected */
	onSelect?: (event: KeyboardEvent | MouseEvent, value: string) => void;
	/** Make children required */
	children: JSX.Element;
}

/** Attribute used to identify value for menuitem */
export const MENU_ITEM_VALUE_ATTR = 'data-menu-item-value';

/** Selector for menu menu items in the menu */
const menuItemsSelector = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

export function Menu(props: MenuProps) {
	const [local, rest] = splitProps(props, ['onSelect']);

	let menu: HTMLElement | null = null;
	const ref = (el: HTMLDivElement) => {
		menu = el;
		props.ref(el);
	};

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => menu?.querySelectorAll(menuItemsSelector));

	onMount(() => {
		if (!menu) {
			return;
		}
		if (!menu.querySelector('[autofocus]')) {
			const first = menu.querySelector(menuItemsSelector) as HTMLElement | null;
			if (first) {
				first.autofocus = true;
			}
		}
	});

	/** Track whether focus is visible (used for keyboard navigation) */
	let isFocusVisible = false;
	const handleFocus = () => {
		isFocusVisible = !!menu?.ownerDocument.activeElement?.matches(':focus-visible');
	};

	const handleBlur = (event: FocusEvent) => {
		const target = event.relatedTarget as HTMLElement;
		if (!menu?.contains(target)) {
			isFocusVisible = false;
			menu?.hidePopover();
		}
		const onBlur = props.onBlur;
		if (typeof onBlur === 'function') {
			onBlur(event as FocusEvent & { currentTarget: HTMLDivElement; target: HTMLDivElement });
		}
	};

	const handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		const menuItem = target.closest(menuItemsSelector) as HTMLElement | null;
		if (menuItem) {
			local.onSelect?.(event, menuItem.getAttribute(LIST_OPTION_VALUE_ATTR) ?? '');
			menu?.hidePopover();
		}
		const onClick = props.onClick;
		if (typeof onClick === 'function') {
			onClick(
				event as MouseEvent & { currentTarget: HTMLDivElement; target: HTMLDivElement },
			);
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!menu) {
			return;
		}

		const items = Array.from(menu.querySelectorAll(menuItemsSelector) ?? []) as HTMLElement[];
		const currentIndex = Array.from(items).indexOf(event.target as HTMLElement);

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				// First item gets autofocused, but if focus isn't visible, this is
				// a bit weird since it'll jump to the second item when you hit down.
				// So explicitly focus it if not already visible
				if (isFocusVisible) {
					items[nextIndex(items, currentIndex)]?.focus();
				} else {
					// Manually setting `isFocusVisible` to true shouldn't be necessary
					// since the blur handler will handle it, but doing it here just
					// in case to avoid down-arrow behavior getting stuck
					isFocusVisible = true;
					items[0]?.focus();
				}
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				items[nextIndex(items, currentIndex, -1)]?.focus();
				break;
			}
			case 'Enter':
			case ' ': {
				event.preventDefault();
				local.onSelect?.(
					event,
					(event.target as HTMLElement | null)?.getAttribute(LIST_OPTION_VALUE_ATTR) ??
						'',
				);
				menu.hidePopover();
				break;
			}
			case 'Tab': {
				// We're assuming menu is in a popover right after the trigger so the
				// tab sequence will naturally go to the right thing. This might do
				// weird things in a portal though. Consider passing a reference
				// to the trigger to menu so we can correctly focus it.
				menu.hidePopover();
				break;
			}
			case 'Escape': {
				// Let popover light dismiss do its thing
				break;
			}
			default: {
				// If here, check if we're typing a character to filter the list
				if (event.key.length === 1) {
					const node = matchText(event.key);
					node?.focus();
				}
			}
		}

		const onKeyDown = props.onKeyDown;
		if (typeof onKeyDown === 'function') {
			onKeyDown(
				event as KeyboardEvent & { currentTarget: HTMLDivElement; target: HTMLDivElement },
			);
		}
	};

	return (
		<OptionList
			{...rest}
			role="menu"
			ref={ref}
			class={cx('c-dropdown', props.class)}
			onFocusIn={handleFocus}
			onFocusOut={handleBlur}
			onClick={handleClick}
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
