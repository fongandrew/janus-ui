import '~/shared/components/sidebar-layout.css';

import cx from 'classix';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-solid';
import { createSignal, type JSX } from 'solid-js';

import { IconButton } from '~/shared/components/button';
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
export function Sidebar(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [, setOpen] = useSidebar();
	return (
		<>
			<div {...props} class="c-sidebar">
				{props.children}
			</div>
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
		<IconButton
			onClick={[setOpen, false]}
			label={t`Close Sidebar`}
			class="c-sidebar__close-button"
		>
			<PanelLeftClose />
		</IconButton>
	);
}
