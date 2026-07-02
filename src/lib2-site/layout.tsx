import { type JSX } from 'solid-js';

import { TopNav } from './nav';
import { CompositionSidebar } from './sidebar';

/**
 * Shared page layout: top nav, an `o-container` main region, and a footer.
 * Every doc page renders through this so the shell stays consistent (§0.5).
 */
export function Layout(props: {
	section?: string | undefined;
	title: string;
	children: JSX.Element;
}) {
	return (
		<>
			<TopNav current={props.section} />
			<main class="o-container p-doc-main">
				<h1 class="p-doc-title">{props.title}</h1>
				{props.children}
			</main>
			<footer class="p-site-footer">
				<div class="o-container">
					<p>Janus UI v2 — the site is the documentation.</p>
				</div>
			</footer>
		</>
	);
}

/**
 * Composition-section layout: the shared page layout with a Composition
 * sidebar/ToC alongside the content (`o-split`).
 */
export function CompositionLayout(props: {
	current: string;
	title: string;
	children: JSX.Element;
}) {
	return (
		<>
			<TopNav current="composition" />
			<div class="o-split p-doc-split">
				<aside class="p-doc-sidebar">
					<CompositionSidebar current={props.current} />
				</aside>
				<main class="o-container p-doc-main">
					<h1 class="p-doc-title">{props.title}</h1>
					{props.children}
				</main>
			</div>
			<footer class="p-site-footer">
				<div class="o-container">
					<p>Janus UI v2 — the site is the documentation.</p>
				</div>
			</footer>
		</>
	);
}
