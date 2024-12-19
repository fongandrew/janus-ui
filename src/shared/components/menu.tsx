import cx from 'classix';
import { type JSX, onMount, splitProps } from 'solid-js';

import {
	LIST_OPTION_VALUE_ATTR,
	OptionList,
	OptionListAnchor,
	OptionListButton,
	OptionListGroup,
} from '~/shared/components/option-list';
import {
	createOptionListContextValue,
	createOptionListTextMatcher,
	OptionListContext,
} from '~/shared/components/option-list-context';
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

	// Menu doesn't need to retain active / selected state. There's no selection per se
	// (or if there is, it's via aria checked states that the menu doesn't need to know
	// about) and we can just rely on the focus state for selection.
	const optionListContext = createOptionListContextValue(
		() => undefined,
		() => new Set(),
	);

	/** For matching user trying to type and match input */
	const matchText = createOptionListTextMatcher(optionListContext);

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

	const handleBlur = (event: FocusEvent) => {
		const target = event.relatedTarget as HTMLElement;
		if (!menu?.contains(target)) {
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
				items[nextIndex(items, currentIndex)]?.focus();
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
				event.preventDefault();
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
					const [_value, elm] = matchText(event.key);
					elm?.focus();
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
		<OptionListContext.Provider value={optionListContext}>
			<OptionList
				{...rest}
				role="menu"
				ref={ref}
				class={cx('c-dropdown', props.class)}
				onFocusOut={handleBlur}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
			/>
		</OptionListContext.Provider>
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
