import cx from 'classix';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-solid';
import { type ComponentProps, createUniqueId, type JSX, splitProps, useContext } from 'solid-js';

import {
	type ButtonProps,
	GhostButton,
	GhostButtonLink,
	IconButton,
} from '~/lib/components/button';
import {
	SIDEBAR_OVERLAY_ATTR,
	SIDEBAR_STATE_ATTR,
	sidebarEscape,
	sidebarFocusOut,
	sidebarLinkClick,
	sidebarTriggerClose,
	sidebarTriggerOpen,
} from '~/lib/components/callbacks/sidebar';
import { ErrorFallback } from '~/lib/components/error-fallback';
import { SidebarContext } from '~/lib/components/sidebar-context';
import { SpinnerSuspense } from '~/lib/components/spinner';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { createAuto } from '~/lib/utility/solid/auto-prop';
import { useT } from '~/lib/utility/solid/locale-context';

/**
 * A layout component that provides a sidebar context
 *
 * @example
 * ```tsx
 * 	<SidebarLayout>
 * 		<Sidebar>
 * 			<SidebarHeader>
 * 				<h2>Navigation</h2>
 * 				<SidebarCloseButton />
 * 			</SidebarHeader>
 * 			<SidebarContent>
 * 				<SidebarList>
 * 					<SidebarListLink href="/dashboard">
 * 						<DashboardIcon />
 * 						Dashboard
 * 					</SidebarListLink>
 * 					<SidebarListLink href="/settings">
 * 						<SettingsIcon />
 * 						Settings
 * 					</SidebarListLink>
 * 					<SidebarListGroup heading="Admin">
 * 						<SidebarListLink href="/users">
 * 							<UsersIcon />
 * 							Users
 * 						</SidebarListLink>
 * 						<SidebarListButton onClick={handleLogout}>
 * 							<LogoutIcon />
 * 							Logout
 * 						</SidebarListButton>
 * 					</SidebarListGroup>
 * 				</SidebarList>
 * 			</SidebarContent>
 * 			<SidebarFooter>
 * 				<p>© 2025 My App</p>
 * 			</SidebarFooter>
 * 		</Sidebar>
 * 		<SidebarLayoutContent>
 * 			<header>
 * 				<SidebarOpenButton />
 * 				<h1>My Application</h1>
 * 			</header>
 * 			<main>Content goes here</main>
 * 		</SidebarLayoutContent>
 * 	</SidebarLayout>
 * ```
 */
export function SidebarLayout(props: ComponentProps<'div'> & { sidebarId?: string | undefined }) {
	const [local, rest] = splitProps(props, ['sidebarId']);
	const sidebarId = createAuto(local, 'sidebarId');
	return (
		<SidebarContext.Provider value={sidebarId}>
			<div {...rest} class={cx('c-sidebar-layout', rest.class)}>
				<ErrorFallback>{props.children}</ErrorFallback>
				<div
					class="c-sidebar__overlay"
					{...{ [SIDEBAR_OVERLAY_ATTR]: '' }}
					{...callbackAttrs(sidebarTriggerClose)}
					// Not really necessary for screenreader since overlay isn't focusable
					// but this is used by `sidebarTriggerClose`
					aria-controls={sidebarId()}
				/>
			</div>
		</SidebarContext.Provider>
	);
}

/**
 * A sidebar component that uses the sidebar context to determine its visibility.
 */
export function Sidebar(
	props: Omit<ComponentProps<'div'>, /* No ID here, set within context provider */ 'id'>,
) {
	const contextId = useContext(SidebarContext);
	if (!contextId) {
		throw new Error('Sidebar must be a child of SidebarLayout');
	}

	return (
		<>
			<div
				role="complementary"
				{...props}
				{...{ [SIDEBAR_STATE_ATTR]: '' }}
				{...callbackAttrs(props, sidebarEscape, sidebarFocusOut)}
				id={contextId()}
				class={cx('c-sidebar', props.class)}
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
export function SidebarOpenButton(props: ButtonProps) {
	const contextId = useContext(SidebarContext);
	const t = useT();
	return (
		<IconButton
			aria-controls={contextId?.()}
			aria-expanded={false}
			label={t`Open Sidebar`}
			{...props}
			{...callbackAttrs(props, sidebarTriggerOpen)}
			class={cx('c-sidebar__open-button', props.class)}
		>
			<PanelLeftOpen />
		</IconButton>
	);
}

/**
 * A button component that closes the sidebar. Place somewhere inside the sidebar.
 * Will hide itself when the sidebar is open on desktop.
 */
export function SidebarCloseButton(props: ButtonProps) {
	const t = useT();
	return (
		<IconButton
			label={t`Close Sidebar`}
			{...props}
			{...callbackAttrs(props, sidebarTriggerClose)}
		>
			<PanelLeftClose />
		</IconButton>
	);
}

/**
 * A header component for the sidebar. Statically sized.
 */
export function SidebarHeader(props: ComponentProps<'header'>) {
	return <header {...props} class={cx('c-sidebar__header', props.class)} />;
}

/**
 * A footer component for the sidebar. Statically sized.
 */
export function SidebarFooter(props: ComponentProps<'footer'>) {
	return <footer {...props} class={cx('c-sidebar__footer', props.class)} />;
}

/**
 * A content component for the sidebar. Resizes and scrolls as needed.
 */
export function SidebarContent(props: ComponentProps<'div'>) {
	return <div {...props} class={cx('c-sidebar__content', props.class)} />;
}

/**
 * A navigation component for the sidebar. An unordered list of links.
 */
export function SidebarList(props: ComponentProps<'nav'>) {
	return (
		<nav
			{...props}
			{...callbackAttrs(props, sidebarLinkClick)}
			class={cx('c-sidebar__list', props.class)}
		>
			<ul>{props.children}</ul>
		</nav>
	);
}

/**
 * Nav item for sidebar navigation.
 */
export function SidebarListItem(props: ComponentProps<'li'>) {
	return <li {...props} class={cx('c-sidebar__list-item', props.class)} />;
}

/**
 * Nav item that is a button
 */
export function SidebarListButton(props: ComponentProps<'button'>) {
	return (
		<SidebarListItem>
			<GhostButton {...props} class={cx('c-sidebar__list-button', props.class)} />
		</SidebarListItem>
	);
}

/**
 * Nav item that is a link
 */
export function SidebarListLink(props: ComponentProps<'a'>) {
	return (
		<SidebarListItem>
			<GhostButtonLink {...props} class={cx('c-sidebar__list-link', props.class)} />
		</SidebarListItem>
	);
}

/**
 * Group links together
 */
export function SidebarListGroup(props: ComponentProps<'li'> & { heading: JSX.Element }) {
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
export function SidebarLayoutContent(props: ComponentProps<'div'>) {
	return (
		<div {...props} class={cx('c-sidebar-layout__content', props.class)}>
			<SpinnerSuspense>{props.children}</SpinnerSuspense>
		</div>
	);
}
