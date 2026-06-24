/*
 * Janus v2 documentation-site shell.
 *
 * Framework-free helpers that emit plain HTML strings for the SSR doc site. The
 * shell (top nav, page layout, Composition sidebar, footer) is deliberately
 * ad-hoc markup + whatever CSS classes exist — it is NOT built from real
 * `Nav`/`Sidebar`/`Card` components. Those are a later (Phase 9) refactor once
 * the Solid layer exists. See docs/v2/PLAN.md Phase 0.5.
 */

/** Top-nav section keys. Three is the ceiling — each section owns its own ToC. */
export type Section = 'composition' | 'colors' | 'components';

export interface NavLink {
	href: string;
	label: string;
	section: Section;
}

/** The three canonical top-nav destinations, in build order. */
export const NAV_LINKS: NavLink[] = [
	{ href: '/v2-variables.html', label: 'Composition', section: 'composition' },
	{ href: '/v2-colors.html', label: 'Colors', section: 'colors' },
	{ href: '/v2-components.html', label: 'Components', section: 'components' },
];

/** Composition sub-pages, surfaced in the section's own sidebar / ToC. */
export interface SidebarLink {
	href: string;
	label: string;
	key: string;
}

export const COMPOSITION_LINKS: SidebarLink[] = [
	{ href: '/v2-variables.html', label: 'Variables', key: 'variables' },
	{ href: '/v2-objects.html', label: 'Objects', key: 'objects' },
	{ href: '/v2-tools.html', label: 'Tools', key: 'tools' },
	{ href: '/v2-typography.html', label: 'Typography', key: 'typography' },
];

/** Minimal HTML-escape for interpolated text content. */
export function esc(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** The top nav: site title + three section links + an (inert) config trigger. */
export function topNav(active: Section | null): string {
	const links = NAV_LINKS.map((link) => {
		const current = link.section === active ? ' aria-current="page"' : '';
		return `<a class="c-button" href="${link.href}"${current}>${esc(link.label)}</a>`;
	}).join('\n\t\t\t\t');

	return `
		<header class="o-bar c-site-nav v-colors-secondary">
			<a class="c-site-nav__title" href="/v2.html">Janus <b>v2</b></a>
			<nav class="o-group" aria-label="Primary">
				${links}
			</nav>
			<button class="c-button c-button--icon" type="button" aria-label="Settings" disabled>
				&#9881;
			</button>
		</header>`;
}

/** The Composition section sidebar / ToC. `active` is a COMPOSITION_LINKS key. */
export function compositionSidebar(active: string): string {
	const items = COMPOSITION_LINKS.map((link) => {
		const current = link.key === active ? ' aria-current="page"' : '';
		return `<li><a href="${link.href}"${current}>${esc(link.label)}</a></li>`;
	}).join('\n\t\t\t\t');

	return `
		<nav class="c-site-sidebar o-box v-surface-card" aria-label="Composition">
			<p class="c-site-sidebar__heading">Composition</p>
			<ul class="o-stack">
				${items}
			</ul>
		</nav>`;
}

export function siteFooter(): string {
	return `
		<footer class="o-container c-site-footer">
			<p>Janus v2 — the site is the documentation. Built framework-free from the CSS package.</p>
		</footer>`;
}

export interface PageOptions {
	/** Active top-nav section (highlights the nav link). */
	section: Section | null;
	/** Optional sidebar HTML (Composition pages render their ToC here). */
	sidebar?: string;
	/** Main content HTML. */
	main: string;
}

/**
 * Assemble a full in-body page: top nav, an optional sidebar + main split, and
 * the footer. Returns the markup that the SSG plugin drops in place of a
 * `<!-- @render -->` comment (the `<head>`/`<title>` live in the .html entry).
 */
export function renderPage(opts: PageOptions): string {
	const body = opts.sidebar
		? `<div class="o-split o-container">
				${opts.sidebar}
				<main class="o-stack">${opts.main}</main>
			</div>`
		: `<main class="o-container o-stack">${opts.main}</main>`;

	return `${topNav(opts.section)}
		${body}
		${siteFooter()}`;
}

/** A neutral section card used throughout the doc pages (ad-hoc, not a component). */
export function sectionCard(title: string, body: string, id?: string): string {
	const idAttr = id ? ` id="${id}"` : '';
	return `
		<section class="c-card o-box v-surface-card"${idAttr}>
			<header><h2>${esc(title)}</h2></header>
			${body}
		</section>`;
}
