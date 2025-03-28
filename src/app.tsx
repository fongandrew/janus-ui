import '~/shared/styles/index.css';

import { Settings } from 'lucide-solid';
import { type JSX } from 'solid-js';

import { PrefsModal } from '~/prefs-modal';
import { ModalOpenTrigger } from '~/shared/components/modal';
import {
	TopNav,
	TopNavLayout,
	TopNavList,
	TopNavListButton,
	TopNavListLink,
} from '~/shared/components/top-nav-layout';
import { useWindow } from '~/shared/utility/solid/window-context';

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
	const current = () => props.current ?? window?.location.pathname;
	return (
		<TopNavListLink
			href={props.href}
			aria-current={current() === props.href ? 'page' : undefined}
		>
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
						<NavLink current={props.current} href="/">
							Components
						</NavLink>
						<NavLink current={props.current} href="/colors">
							Colors
						</NavLink>
						<NavLink current={props.current} href="/typography">
							Typography
						</NavLink>
						<NavLink current={props.current} href="/ssr">
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
