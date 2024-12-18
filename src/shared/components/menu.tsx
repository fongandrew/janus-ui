import cx from 'classix';
import { type JSX, onMount, splitProps } from 'solid-js';

import { nextIndex } from '~/shared/utility/next-index';

export { createDropdown } from './create-dropdown';
export { MenuGroup } from './menu-group';
export { MenuItem } from './menu-item';

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
			local.onSelect?.(event, menuItem.getAttribute(MENU_ITEM_VALUE_ATTR) ?? '');
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
					(event.target as HTMLElement | null)?.getAttribute(MENU_ITEM_VALUE_ATTR) ?? '',
				);
				menu.hidePopover();
				break;
			}
			case 'Tab': {
				event.preventDefault();
				menu.hidePopover();
				break;
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
		<div
			{...rest}
			ref={(e) => ref(e)}
			class={cx('c-menu', props.class)}
			onFocusOut={handleBlur}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		/>
	);
}
