import cx from 'classix';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-solid';
import { createEffect, createMemo, createUniqueId, type JSX, splitProps } from 'solid-js';

import { GhostButton, GhostButtonLink, IconButton } from '~/shared/components/button';
import {
	createSidebarContext,
	SidebarContext,
	useSidebar,
} from '~/shared/components/sidebar-context';
import { firstFocusable } from '~/shared/utility/focusables';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { t } from '~/shared/utility/text/t-tag';

/**
 * A layout component that provides a sidebar context
 */
export function SidebarLayout(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const context = createSidebarContext();
	const [open, setOpen] = context.open;
	return (
		<SidebarContext.Provider value={context}>
			<div
				{...props}
				class={cx(
					'c-sidebar-layout',
					open() && 'c-sidebar-layout--open',
					open() === false && 'c-sidebar-layout--closed',
				)}
			>
				{props.children}
				<div class="c-sidebar__overlay" onClick={[setOpen, false]} />
			</div>
		</SidebarContext.Provider>
	);
}

/**
 * A sidebar component that uses the sidebar context to determine its visibility.
 */
export function Sidebar(props: JSX.HTMLAttributes<HTMLElement>) {
	const {
		open: [open, setOpen],
		toggleCtrl,
	} = useSidebar();

	let ref: HTMLElement | null;
	const setRef = (v: HTMLElement | null) => {
		ref = v;
	};

	createEffect(() => {
		if (open() && ref) {
			firstFocusable(ref)?.focus();
		}
	});

	// We want to close the sidebar on narrow widths when focus leaves it but only if focus was
	// previously visible (that is, focus is shifting via keypress rather than mouse click).
	const handleFocusOut = (e: FocusEvent) => {
		if (open() === true && !ref?.contains(e.relatedTarget as Node) && isFocusVisible()) {
			// Null will close sidebar on narrow mobile widths but leave it in its
			// default open state on wide desktop widths
			setOpen(null);
		}
	};

	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setOpen(false);
			toggleCtrl.ref()?.focus();
		}
	};

	const id = createMemo(() => props.id || createUniqueId());
	toggleCtrl.setAttr('aria-controls', () => id());

	return (
		<>
			<div
				role="complementary"
				{...props}
				id={id()}
				ref={combineRefs(setRef, props.ref)}
				class={cx('c-sidebar', props.class)}
				onFocusOut={handleFocusOut}
				onKeyDown={handleEscape}
			>
				{props.children}
			</div>
		</>
	);
}

/**
 * A button component that opens the sidebar. Place somewhere outside the sidebar.
 * Will hide itself when the sidebar is open on desktop.
 */
export function SidebarOpenButton() {
	const {
		open: [open, setOpen],
		toggleCtrl,
	} = useSidebar();
	return (
		<IconButton
			{...toggleCtrl.merge({
				'aria-expanded': open() === true,
				class: 'c-sidebar__open-button',
				label: t`Open Sidebar`,
				onClick: [setOpen, true],
			})}
		>
			<PanelLeftOpen />
		</IconButton>
	);
}

/**
 * A button component that closes the sidebar. Place somewhere inside the sidebar.
 * Will hide itself when the sidebar is open on desktop.
 */
export function SidebarCloseButton() {
	const {
		open: [, setOpen],
		toggleCtrl,
	} = useSidebar();
	const handleClick = () => {
		setOpen(false);
		toggleCtrl.ref()?.focus();
	};

	return (
		<IconButton onClick={handleClick} label={t`Close Sidebar`}>
			<PanelLeftClose />
		</IconButton>
	);
}

/**
 * A header component for the sidebar. Statically sized.
 */
export function SidebarHeader(props: JSX.HTMLAttributes<HTMLElement>) {
	return (
		<header {...props} class={cx('c-sidebar__header', props.class)}>
			{props.children}
		</header>
	);
}

/**
 * A footer component for the sidebar. Statically sized.
 */
export function SidebarFooter(props: JSX.HTMLAttributes<HTMLElement>) {
	return (
		<footer {...props} class={cx('c-sidebar__footer', props.class)}>
			{props.children}
		</footer>
	);
}

/**
 * A content component for the sidebar. Resizes and scrolls as needed.
 */
export function SidebarContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<div {...props} class={cx('c-sidebar__content', props.class)}>
			{props.children}
		</div>
	);
}

/**
 * A navigation component for the sidebar. An unordered list of links.
 */
export function SidebarList(props: JSX.HTMLAttributes<HTMLElement>) {
	return (
		<nav {...props} class={cx('c-sidebar__list', props.class)}>
			<ul>{props.children}</ul>
		</nav>
	);
}

/**
 * Nav item for sidebar navigation.
 */
export function SidebarListItem(props: JSX.HTMLAttributes<HTMLLIElement>) {
	return (
		<li {...props} class={cx('c-sidebar__list-item', props.class)}>
			{props.children}
		</li>
	);
}

/**
 * Nav item that is a button
 */
export function SidebarListButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<SidebarListItem>
			<GhostButton {...props} class={cx('c-sidebar__list-button', props.class)} />
		</SidebarListItem>
	);
}

/**
 * Nav item that is a link
 */
export function SidebarListLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<SidebarListItem>
			<GhostButtonLink {...props} class={cx('c-sidebar__list-link', props.class)} />
		</SidebarListItem>
	);
}

/**
 * Group links together
 */
export function SidebarListGroup(
	props: JSX.HTMLAttributes<HTMLLIElement> & { heading: JSX.Element },
) {
	const headingId = createUniqueId();
	const [local, rest] = splitProps(props, ['heading']);
	return (
		<SidebarListItem {...rest}>
			{props.heading && (
				<div class="c-sidebar-list__heading" id={headingId}>
					{local.heading}
				</div>
			)}
			<SidebarList role="group" aria-labelledby={headingId}>
				{props.children}
			</SidebarList>
		</SidebarListItem>
	);
}

/**
 * The non-sidebar content area of the layout
 */
export function SidebarLayoutContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<div {...props} class={cx('c-sidebar-layout__content', props.class)}>
			{props.children}
		</div>
	);
}
