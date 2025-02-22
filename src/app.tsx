import '~/shared/styles/index.css';

import { type JSX } from 'solid-js';

import {
	TopNav,
	TopNavLayout,
	TopNavList,
	TopNavListLink,
} from '~/shared/components/top-nav-layout';
import { useWindow } from '~/shared/utility/solid/window-context';

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
		<TopNavLayout>
			<TopNav>
				{props.heading ?? <h1>Solid Base</h1>}
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
				</TopNavList>
			</TopNav>
			{props.children}
		</TopNavLayout>
	);
}
