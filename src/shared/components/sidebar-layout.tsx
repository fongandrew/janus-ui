import cx from 'classix';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-solid';
import { createSignal, createUniqueId, type JSX, splitProps } from 'solid-js';

import { Button, IconButton } from '~/shared/components/button';
import { SidebarContext, useSidebar } from '~/shared/components/sidebar-context';
import { t } from '~/shared/utility/text/t-tag';

/**
 * A layout component that provides a sidebar context
 */
export function SidebarLayout(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [isOpen, setOpen] = createSignal<boolean | null>(null);
	return (
		<SidebarContext.Provider value={[isOpen, setOpen]}>
			<div
				{...props}
				class={cx(
					'c-sidebar-layout',
					isOpen() && 'c-sidebar-layout--open',
					isOpen() === false && 'c-sidebar-layout--closed',
				)}
			>
				{props.children}
			</div>
		</SidebarContext.Provider>
	);
}

/**
 * A sidebar component that uses the sidebar context to determine its visibility.
 */
export function Sidebar(props: JSX.HTMLAttributes<HTMLElement>) {
	const [, setOpen] = useSidebar();
	return (
		<>
			<nav {...props} class="c-sidebar">
				{props.children}
			</nav>
			<div class="c-sidebar__overlay" onClick={[setOpen, false]} />
		</>
	);
}

/**
 * A button component that opens the sidebar. Place somewhere outside the sidebar.
 * Will hide itself when the sidebar is open on desktop.
 */
export function SidebarOpenButton() {
	const [, setOpen] = useSidebar();
	return (
		<IconButton
			onClick={[setOpen, true]}
			label={t`Open Sidebar`}
			class="c-sidebar__open-button"
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
	const [, setOpen] = useSidebar();
	return (
		<IconButton onClick={[setOpen, false]} label={t`Close Sidebar`}>
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
export function SidebarList(props: JSX.HTMLAttributes<HTMLUListElement>) {
	return (
		<ul {...props} class={cx('c-sidebar__list', props.class)}>
			{props.children}
		</ul>
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
			<Button {...props} class={cx('c-sidebar__list-button', props.class)} unstyled>
				{props.children}
			</Button>
		</SidebarListItem>
	);
}

/**
 * Nav item that is a link
 */
export function SidebarListLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<SidebarListItem>
			<a {...props} class={cx('c-sidebar__list-link', props.class)}>
				{props.children}
			</a>
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
