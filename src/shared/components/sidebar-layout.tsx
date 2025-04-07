import cx from 'classix';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-solid';
import { createUniqueId, type JSX, splitProps, useContext } from 'solid-js';

import {
	type ButtonProps,
	GhostButton,
	GhostButtonLink,
	IconButton,
} from '~/shared/components/button';
import {
	SIDEBAR_STATE_ATTR,
	sidebarEscape,
	sidebarFocusOut,
	sidebarLinkClick,
	sidebarTriggerClose,
	sidebarTriggerOpen,
} from '~/shared/components/callbacks/sidebar';
import { ErrorFallback } from '~/shared/components/error-fallback';
import { SidebarContext } from '~/shared/components/sidebar-context';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createAuto } from '~/shared/utility/solid/auto-prop';
import { useT } from '~/shared/utility/solid/locale-context';

/**
 * A layout component that provides a sidebar context
 */
export function SidebarLayout(
	props: JSX.HTMLAttributes<HTMLDivElement> & { sidebarId?: string | undefined },
) {
	const [local, rest] = splitProps(props, ['sidebarId']);
	const sidebarId = createAuto(local, 'sidebarId');
	return (
		<SidebarContext.Provider value={sidebarId}>
			<div {...rest} class={cx('c-sidebar-layout', rest.class)}>
				<ErrorFallback>{props.children}</ErrorFallback>
				<div
					class="c-sidebar__overlay"
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
	props: Omit<
		JSX.HTMLAttributes<HTMLDivElement>,
		/* No ID here, set within context provider */ 'id'
	>,
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
export function SidebarHeader(props: JSX.HTMLAttributes<HTMLElement>) {
	return <header {...props} class={cx('c-sidebar__header', props.class)} />;
}

/**
 * A footer component for the sidebar. Statically sized.
 */
export function SidebarFooter(props: JSX.HTMLAttributes<HTMLElement>) {
	return <footer {...props} class={cx('c-sidebar__footer', props.class)} />;
}

/**
 * A content component for the sidebar. Resizes and scrolls as needed.
 */
export function SidebarContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} class={cx('c-sidebar__content', props.class)} />;
}

/**
 * A navigation component for the sidebar. An unordered list of links.
 */
export function SidebarList(props: JSX.HTMLAttributes<HTMLElement>) {
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
export function SidebarListItem(props: JSX.HTMLAttributes<HTMLLIElement>) {
	return <li {...props} class={cx('c-sidebar__list-item', props.class)} />;
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
	return <div {...props} class={cx('c-sidebar-layout__content', props.class)} />;
}
