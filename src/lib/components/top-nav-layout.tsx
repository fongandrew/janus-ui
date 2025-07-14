import cx from 'classix';
import { Menu, X } from 'lucide-solid';
import { type ComponentProps, useContext } from 'solid-js';

import {
	type ButtonProps,
	GhostButton,
	GhostButtonLink,
	IconButton,
} from '~/lib/components/button';
import {
	SIDEBAR_STATE_ATTR,
	sidebarEscape,
	sidebarFocusOut,
	sidebarTriggerClose,
	sidebarTriggerOpen,
} from '~/lib/components/callbacks/sidebar';
import { resetScrollPosition, topNavScroll } from '~/lib/components/callbacks/top-nav';
import { ErrorFallback } from '~/lib/components/error-fallback';
import { SpinnerSuspense } from '~/lib/components/spinner';
import { TopNavContext } from '~/lib/components/top-nav-context';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { createAuto } from '~/lib/utility/solid/auto-prop';
import { useT } from '~/lib/utility/solid/locale-context';

/**
 * A layout component that provides a top navigation context
 *
 * @example
 * ```tsx
 * 	<TopNavLayout>
 * 		<TopNav>
 * 			<h1>My Application</h1>
 * 		 	<TopNavList>
 * 				<TopNavListLink
 * 					href="/"
 * 					aria-current={currentPath === '/' ? 'page' : undefined}
 * 				>
 * 					Home
 * 				</TopNavListLink>
 * 				<TopNavListLink
 * 					href="/about"
 * 					aria-current={currentPath === '/about' ? 'page' : undefined}
 * 				>
 * 					About
 * 				</TopNavListLink>
 * 				<TopNavListButton onClick={handleSettings}>
 * 					<SettingsIcon />
 * 					Settings
 * 				</TopNavListButton>
 * 			</TopNavList>
 * 		</TopNav>
 * 		<main>
 * 			<h2>Page Content</h2>
 * 			<p>Your page content goes here.</p>
 * 		</main>
 * 	</TopNavLayout>
 * ```
 */
export function TopNavLayout(props: ComponentProps<'div'> & { navId?: string | undefined }) {
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
export function TopNav(props: ComponentProps<'header'>) {
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
export function TopNavList(props: Omit<ComponentProps<'nav'>, /* Use ID from context */ 'id'>) {
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
export function TopNavListItem(props: ComponentProps<'li'>) {
	return (
		<li {...props} class={cx('c-top-nav__list-item', props.class)}>
			{props.children}
		</li>
	);
}

/**
 * Nav item that is a button
 */
export function TopNavListButton(props: ComponentProps<'button'>) {
	return (
		<TopNavListItem>
			<GhostButton {...props} class={cx('c-top-nav__list-button', props.class)} />
		</TopNavListItem>
	);
}

/**
 * Nav item that is a link
 */
export function TopNavListLink(props: ComponentProps<'a'>) {
	return (
		<TopNavListItem>
			<GhostButtonLink {...props} class={cx('c-top-nav__list-link', props.class)} />
		</TopNavListItem>
	);
}
