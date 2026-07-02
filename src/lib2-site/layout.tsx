import { For, type JSX } from 'solid-js';

export type SiteSection = 'composition' | 'colors' | 'components' | undefined;

/**
 * Top nav shell (SSR, zero JS). Exactly three section links — Composition,
 * Colors, Components — plus an inert theme-workbench trigger (wired in Phase 9).
 * The site title links to Home.
 */
export function SiteNav(props: { current?: SiteSection }) {
	return (
		<header class="o-bar p-site-nav">
			<div class="o-group p-site-nav__brand">
				<a href="/v2.html" class="p-site-nav__title">
					Janus
				</a>
			</div>
			<nav class="o-group p-site-nav__links" aria-label="Site">
				<a
					href="/v2-variables.html"
					aria-current={props.current === 'composition' ? 'page' : undefined}
				>
					Composition
				</a>
				<a
					href="/v2-colors.html"
					aria-current={props.current === 'colors' ? 'page' : undefined}
				>
					Colors
				</a>
				<a
					href="/v2-components.html"
					aria-current={props.current === 'components' ? 'page' : undefined}
				>
					Components
				</a>
				{/* Inert until Phase 9 — the theme workbench drawer needs the DOM layer */}
				<button
					type="button"
					class="c-button o-input-box"
					disabled
					aria-label="Theme workbench"
				>
					Workbench
				</button>
			</nav>
		</header>
	);
}

/**
 * Shared page layout: nav, o-container main, footer. Every doc page renders
 * through this so the site stays consistent.
 */
export function PageLayout(props: { current?: SiteSection; children: JSX.Element }) {
	return (
		<>
			<SiteNav current={props.current} />
			<main class="o-container p-site-main">{props.children}</main>
			<footer class="o-container p-site-footer">
				<p>Janus v2 — a CSS-first design system. Fork-and-copy, modern browsers only.</p>
			</footer>
		</>
	);
}

const COMPOSITION_PAGES = [
	{ href: '/v2-variables.html', slug: 'variables', label: 'Variables' },
	{ href: '/v2-objects.html', slug: 'objects', label: 'Objects' },
	{ href: '/v2-tools.html', slug: 'tools', label: 'Tools' },
	{ href: '/v2-typography.html', slug: 'typography', label: 'Typography' },
] as const;

export type CompositionPage = (typeof COMPOSITION_PAGES)[number]['slug'];

export interface TocEntry {
	href: string;
	label: string;
}

/**
 * Composition section layout: persistent sidebar/ToC + scrolling main column.
 * ToC entries are plain anchor links — zero JS navigation.
 */
export function CompositionLayout(props: {
	current: CompositionPage;
	toc?: TocEntry[];
	children: JSX.Element;
}) {
	return (
		<PageLayout current="composition">
			<div class="o-split p-doc-split">
				<aside class="p-doc-toc" aria-label="Composition">
					<nav>
						<ul class="o-stack">
							<For each={COMPOSITION_PAGES}>
								{(page) => (
									<li>
										<a
											href={page.href}
											aria-current={
												page.slug === props.current ? 'page' : undefined
											}
										>
											{page.label}
										</a>
										{page.slug === props.current && props.toc?.length ? (
											<ul>
												<For each={props.toc}>
													{(entry) => (
														<li>
															<a href={entry.href}>{entry.label}</a>
														</li>
													)}
												</For>
											</ul>
										) : null}
									</li>
								)}
							</For>
						</ul>
					</nav>
				</aside>
				<div class="p-doc-main o-stack">{props.children}</div>
			</div>
		</PageLayout>
	);
}
