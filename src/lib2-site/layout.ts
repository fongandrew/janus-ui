/*
	Page-authoring pattern for the v2 documentation site.

	Each doc page is an SSR module that exports `render(): string` — it emits plain
	HTML carrying v2 classes (markup + `index.css`), with no Solid wrappers and no
	`data-js`. The SSG plugin (`vite-plugin-ssg.ts`) replaces the page's
	`<!-- @render ... -->` comment with the returned markup at build time.

	This module is the shared chrome: the top nav, the page layout (nav + main +
	footer), and the Composition sidebar / ToC. Per PLAN Phase 0.5 this chrome is
	intentionally ad-hoc markup + CSS classes — NOT finished Card/Nav/Sidebar Solid
	components. It is refactored into real components later (Phase 9).
*/

/** Minimal HTML attribute-value escaping for interpolated strings. */
export function esc(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** The three top-level sections. Three is the ceiling (§19). */
export const TOP_NAV = [
	{ label: 'Composition', href: '/lib2-variables.html', key: 'composition' },
	{ label: 'Colors', href: '/lib2-colors.html', key: 'colors' },
	{ label: 'Components', href: '/lib2-components.html', key: 'components' },
] as const;

/** The Composition section's internal sidebar / ToC (§20.2). */
export const COMPOSITION_NAV = [
	{ label: 'Variables', href: '/lib2-variables.html', key: 'variables' },
	{ label: 'Objects', href: '/lib2-objects.html', key: 'objects' },
	{ label: 'Tools', href: '/lib2-tools.html', key: 'tools' },
	{ label: 'Typography', href: '/lib2-typography.html', key: 'typography' },
] as const;

export type TopNavKey = (typeof TOP_NAV)[number]['key'];
export type CompositionKey = (typeof COMPOSITION_NAV)[number]['key'];

export interface PageOptions {
	/** Which top-level section is active (drives the nav highlight). */
	section?: TopNavKey;
	/** When set, renders the Composition sidebar with this sub-page active. */
	composition?: CompositionKey;
	/** The page's main content as an HTML string. */
	main: string;
}

function topNav(active?: TopNavKey): string {
	const links = TOP_NAV.map((item) => {
		const current = item.key === active ? ' aria-current="page"' : '';
		return `<a class="c-nav__link" href="${item.href}"${current}>${item.label}</a>`;
	}).join('');

	return `
	<header class="c-nav o-bar">
		<a class="c-nav__brand" href="/lib2-home.html">Janus <span class="c-nav__brand-v">v2</span></a>
		<nav class="c-nav__links" aria-label="Primary">
			${links}
		</nav>
		<button type="button" class="c-button c-button--icon c-nav__config" aria-label="Configure" disabled>
			<span aria-hidden="true">&#9881;</span>
		</button>
	</header>`;
}

function compositionSidebar(active?: CompositionKey): string {
	const links = COMPOSITION_NAV.map((item) => {
		const current = item.key === active ? ' aria-current="page"' : '';
		return `<li><a class="c-sidebar__link" href="${item.href}"${current}>${item.label}</a></li>`;
	}).join('');

	return `
	<aside class="c-sidebar" aria-label="Composition">
		<p class="c-sidebar__heading">Composition</p>
		<ul class="c-sidebar__list">
			${links}
		</ul>
	</aside>`;
}

/** Render a full doc-page body (nav + main + footer). */
export function renderPage(opts: PageOptions): string {
	const sidebar = opts.composition ? compositionSidebar(opts.composition) : '';
	const layoutClass = opts.composition ? 'o-split c-page c-page--with-sidebar' : 'c-page';

	return `
${topNav(opts.section)}
<div class="${layoutClass}">
	${sidebar}
	<main class="o-container c-page__main">
		${opts.main}
	</main>
</div>
<footer class="c-footer o-container">
	<p class="v-text-muted">Janus v2 — documentation site. This shell is ad-hoc markup; it becomes real components in Phase 9.</p>
</footer>`;
}

/** Convenience for the still-empty section stubs (Colors, Components, Tools). */
export function renderStub(opts: {
	section?: TopNavKey;
	composition?: CompositionKey;
	title: string;
	blurb: string;
}): string {
	return renderPage({
		...(opts.section ? { section: opts.section } : {}),
		...(opts.composition ? { composition: opts.composition } : {}),
		main: `
		<div class="c-card o-box">
			<header><h1>${esc(opts.title)}</h1></header>
			<p>${esc(opts.blurb)}</p>
		</div>`,
	});
}
