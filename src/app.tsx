import '~/lib/styles/index.css';

import { Settings } from 'lucide-solid';
import { createMemo, type JSX } from 'solid-js';

import { ModalOpenTrigger } from '~/lib/components/modal';
import {
	TopNav,
	TopNavLayout,
	TopNavList,
	TopNavListButton,
	TopNavListLink,
} from '~/lib/components/top-nav-layout';
import { useWindow } from '~/lib/utility/solid/window-context';
import { PrefsModal } from '~/prefs-modal';

export const PREFS_MODAL_ID = 'prefs-modal-dialog-id';

export interface AppProps {
	/** Heading element */
	heading?: JSX.Element;
	/** What is the current path? */
	current?: string | undefined;
	/** Main page content */
	children: JSX.Element;
}

function NavLink(props: { current?: string | undefined; href: string; children: JSX.Element }) {
	const window = useWindow();
	const isCurrent = createMemo(() => {
		if (props.current === props.href) return true;
		if (!window) return false;
		return (
			(new URL(props.href, window.location.href).pathname ?? '') === window.location.pathname
		);
	});
	return (
		<TopNavListLink href={props.href} aria-current={isCurrent() ? 'page' : undefined}>
			{props.children}
		</TopNavListLink>
	);
}

export function App(props: AppProps) {
	return (
		<>
			<TopNavLayout>
				<TopNav>
					{props.heading ?? <h1>Janus UI</h1>}
					<TopNavList>
						<NavLink current={props.current} href="./">
							Components
						</NavLink>
						<NavLink current={props.current} href="./colors">
							Colors
						</NavLink>
						<NavLink current={props.current} href="./typography">
							Typography
						</NavLink>
						<NavLink current={props.current} href="./ssr">
							SSR
						</NavLink>
						<ModalOpenTrigger targetId={PREFS_MODAL_ID}>
							<TopNavListButton>
								<Settings class="t-hidden-lt-tablet-wide" />
								<span class="t-hidden-gte-tablet-wide">Settings</span>
							</TopNavListButton>
						</ModalOpenTrigger>
					</TopNavList>
				</TopNav>
				{props.children}
			</TopNavLayout>
			<PrefsModal id={PREFS_MODAL_ID} />
		</>
	);
}
