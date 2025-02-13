import cx from 'classix';
import { Menu } from 'lucide-solid';
import { createEffect, createMemo, createUniqueId, type JSX, onCleanup } from 'solid-js';

import { Button, type ButtonProps, IconButton } from '~/shared/components/button';
import { createTopNavContext, TopNavContext, useTopNav } from '~/shared/components/top-nav-context';
import { firstFocusable } from '~/shared/utility/focusables';
import { getScrollableParent } from '~/shared/utility/get-scrollable-parent';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { t } from '~/shared/utility/text/t-tag';

/**
 * A layout component that provides a top navigation context
 */
export function TopNavLayout(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const context = createTopNavContext();
	const [isOpen] = context.open;
	const [isHidden, setHidden] = context.hidden;

	let ref: HTMLElement | null = null;

	/** Memoized height + last measure for a given container */
	const memoizedHeaderHeight = new WeakMap<HTMLElement, [number, number]>();

	/** Get height of header within container */
	const measureHeaderHeight = (container: HTMLElement) => {
		const lastMeasure = memoizedHeaderHeight.get(container);
		if (lastMeasure) {
			const [measure, time] = lastMeasure;
			if (Date.now() - time < 1000) return measure;
			return measure;
		}

		const header = container.querySelector('header');
		if (!header) return 0;

		const height = header.getBoundingClientRect().height;
		memoizedHeaderHeight.set(container, [height, Date.now()]);
		return height;
	};

	/** Last measured scoll top position of container */
	let lastScrollTop = 0;

	const handleScroll = (e: Event) => {
		const container = e.target as HTMLElement | null;
		if (!container) return;
		if (!ref) return;

		const headerHeight = measureHeaderHeight(ref);
		const scrollDiff = container.scrollTop - lastScrollTop;
		if (Math.abs(scrollDiff) < headerHeight) return;

		lastScrollTop = container.scrollTop;
		setHidden(scrollDiff > 0);
	};

	createEffect(() => {
		getScrollableParent(ref)?.addEventListener('scroll', handleScroll, { passive: true });
		onCleanup(() => {
			getScrollableParent(ref)?.removeEventListener('scroll', handleScroll);
		});
	});

	return (
		<TopNavContext.Provider value={context}>
			<div
				{...props}
				ref={combineRefs((v) => {
					ref = v;
				}, props.ref)}
				class={cx(
					'c-top-nav-layout',
					isHidden() && 'c-top-nav-layout--hidden',
					isOpen() && 'c-top-nav-layout--open',
				)}
			>
				{props.children}
			</div>
		</TopNavContext.Provider>
	);
}

/**
 * A top navigation component that adapts between horizontal nav and drawer
 */
export function TopNav(props: JSX.HTMLAttributes<HTMLElement>) {
	const [, setOpen] = useTopNav().open;
	return (
		<header {...props} class={cx('c-top-nav', props.class)}>
			{props.children}
			<div class="c-top-nav__overlay" onClick={[setOpen, false]} />
		</header>
	);
}

/**
 * A button component that opens the nav drawer. Only visible on mobile.
 */
export function TopNavMenuButton(props: ButtonProps) {
	const [, setOpen] = useTopNav().open;
	return (
		<IconButton
			onClick={[setOpen, true]}
			label={t`Open Menu`}
			class="c-top-nav__list-toggle"
			{...props}
		>
			<Menu />
		</IconButton>
	);
}

/**
 * A navigation list component for the top nav
 */
export function TopNavList(props: JSX.HTMLAttributes<HTMLElement>) {
	let navRef: HTMLElement | undefined;
	const setNavRef = (v: HTMLElement | undefined) => {
		navRef = v;
	};

	// No setter necessary since it's not wrapped in combineRefs
	let toggleRef: HTMLButtonElement | undefined;

	const [open, setOpen] = useTopNav().open;
	createEffect(() => {
		if (open() && navRef) {
			firstFocusable(navRef)?.focus();
		}
	});

	// We want to close the sidebar on narrow widths when focus leaves it but only if focus was
	// previously visible (that is, focus is shifting via keypress rather than mouse click).
	const handleFocusOut = (e: FocusEvent) => {
		if (open() === true && !navRef?.contains(e.relatedTarget as Node) && isFocusVisible()) {
			// Null = default (so closed on narrow). We could set it to false since it has
			// no effect on desktop, but do it this way for consistency with how we do sidebar
			setOpen(null);
		}
	};

	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setOpen(false);
			toggleRef?.focus();
		}
	};

	const navId = createMemo(() => props.id || createUniqueId());

	return (
		<>
			<nav
				{...props}
				id={navId()}
				ref={combineRefs(setNavRef, props.ref)}
				class={cx('c-top-nav__list', props.class)}
				onFocusOut={handleFocusOut}
				onKeyDown={handleEscape}
			>
				<ul>{props.children}</ul>
			</nav>
			<TopNavMenuButton
				ref={toggleRef}
				aria-controls={navId()}
				aria-expanded={open() ?? undefined}
			/>
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
			<Button {...props} class={cx('c-top-nav__list-button', props.class)} unstyled>
				{props.children}
			</Button>
		</TopNavListItem>
	);
}

/**
 * Nav item that is a link
 */
export function TopNavListLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<TopNavListItem>
			<a {...props} class={cx('c-top-nav__list-link', props.class)}>
				{props.children}
			</a>
		</TopNavListItem>
	);
}
