import '~/shared/styles/index.css';

import { type JSX } from 'solid-js';

import {
	TopNav,
	TopNavLayout,
	TopNavList,
	TopNavListLink,
} from '~/shared/components/top-nav-layout';

export interface AppProps {
	/** Heading element */
	heading?: JSX.Element;
	/** What is the current path? */
	current?: string;
	/** Main page content */
	children: JSX.Element;
}

function NavLink(props: { current?: string; href: string; children: JSX.Element }) {
	const current = () => props.current ?? window.location.pathname;
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
					<NavLink href="/">Components</NavLink>
					<NavLink href="/colors">Colors</NavLink>
					<NavLink href="/typography">Typography</NavLink>
				</TopNavList>
			</TopNav>
			{props.children}
		</TopNavLayout>
	);
}
