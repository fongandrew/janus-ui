import cx from 'classix';
import { Menu, X } from 'lucide-solid';
import { type JSX, useContext } from 'solid-js';

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
	sidebarTriggerClose,
	sidebarTriggerOpen,
} from '~/shared/components/callbacks/sidebar';
import { resetScrollPosition, topNavScroll } from '~/shared/components/callbacks/top-nav';
import { ErrorFallback } from '~/shared/components/error-fallback';
import { SpinnerSuspense } from '~/shared/components/spinner';
import { TopNavContext } from '~/shared/components/top-nav-context';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createAuto } from '~/shared/utility/solid/auto-prop';
import { useT } from '~/shared/utility/solid/locale-context';

/**
 * A layout component that provides a top navigation context
 */
export function TopNavLayout(
	props: JSX.HTMLAttributes<HTMLDivElement> & { navId?: string | undefined },
) {
	let ref: HTMLDivElement | undefined;
	const navId = createAuto(props, 'navId');

	return (
		<TopNavContext.Provider value={navId}>
			<div
				ref={ref}
				{...props}
				{...callbackAttrs(props, topNavScroll)}
				class={cx('c-top-nav-layout', props.class)}
			>
				<ErrorFallback>
					<SpinnerSuspense onEnd={() => ref && resetScrollPosition(ref)}>
						{props.children}
					</SpinnerSuspense>
				</ErrorFallback>
			</div>
		</TopNavContext.Provider>
	);
}

/**
 * A top navigation component that adapts between horizontal nav and drawer
 */
export function TopNav(props: JSX.HTMLAttributes<HTMLElement>) {
	const navId = useContext(TopNavContext);
	return (
		<header {...props} class={cx('c-top-nav', props.class)}>
			{props.children}
			{/*
				Overlay is inside header because it needs to go under the nav list (header child),
				above everything else in the header, and also everything not in the header.
				Some issues with stack context if we move it outside the header.
			*/}
			<div
				class="c-top-nav__overlay"
				{...callbackAttrs(sidebarTriggerClose)}
				// Not actually used by screenreader but used by sidebarTriggerClose
				aria-controls={navId?.()}
			/>
		</header>
	);
}

/**
 * A button component that opens the nav drawer. Only visible on mobile.
 */
export function TopNavMenuButton(props: ButtonProps) {
	const t = useT();
	return (
		<IconButton
			label={t`Open Menu`}
			class="c-top-nav__list-open"
			{...props}
			{...callbackAttrs(props, sidebarTriggerOpen)}
		>
			<Menu />
		</IconButton>
	);
}

/**
 * Separate button to close top nav on mobile
 */
export function TopNavCloseButton(props: ButtonProps) {
	const t = useT();
	const navId = useContext(TopNavContext);
	return (
		<div class="c-top-nav__list-close">
			<IconButton
				label={t`Close Menu`}
				aria-controls={navId?.()}
				aria-expanded="true"
				{...props}
				{...callbackAttrs(props, sidebarTriggerClose)}
			>
				<X />
			</IconButton>
		</div>
	);
}

/**
 * A navigation list component for the top nav
 */
export function TopNavList(
	props: Omit<JSX.HTMLAttributes<HTMLElement>, /* Use ID from context */ 'id'>,
) {
	const navId = useContext(TopNavContext);

	return (
		<>
			<nav
				{...props}
				{...callbackAttrs(sidebarFocusOut, sidebarEscape)}
				{...{ [SIDEBAR_STATE_ATTR]: '' }}
				id={navId?.()}
				class={cx('c-top-nav__list', props.class)}
			>
				<ul>{props.children}</ul>
			</nav>
			<TopNavMenuButton aria-controls={navId?.()} aria-expanded="false" />
			<TopNavCloseButton />
		</>
	);
}

/**
 * Nav item for top navigation
 */
export function TopNavListItem(props: JSX.HTMLAttributes<HTMLLIElement>) {
	return (
		<li {...props} class={cx('c-top-nav__list-item', props.class)}>
			{props.children}
		</li>
	);
}

/**
 * Nav item that is a button
 */
export function TopNavListButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<TopNavListItem>
			<GhostButton {...props} class={cx('c-top-nav__list-button', props.class)} />
		</TopNavListItem>
	);
}

/**
 * Nav item that is a link
 */
export function TopNavListLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<TopNavListItem>
			<GhostButtonLink {...props} class={cx('c-top-nav__list-link', props.class)} />
		</TopNavListItem>
	);
}
