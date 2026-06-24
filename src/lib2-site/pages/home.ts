/*
 * Janus v2 — Home page (Phase 0 placeholder).
 *
 * Enough to prove the SSR shell renders and deploys: a headline, one paragraph,
 * and nav cards that fill in as the section pages land. Full Home content is
 * finished in Phase 9 (§20.1).
 */
import { NAV_LINKS, renderPage, sectionCard } from '~/lib2-site/shell';

function navCards(): string {
	const cards = NAV_LINKS.map(
		(link) => `
			<a class="c-card o-box v-surface-card c-home__card" href="${link.href}">
				<h3>${link.label}</h3>
				<p>Documented with live, rendered examples.</p>
			</a>`,
	).join('');
	return `<div class="o-grid">${cards}</div>`;
}

export function render(): string {
	const main = `
		${sectionCard(
			'Janus v2',
			`<p class="c-home__lede">
				A CSS-first UI library. The shipped site is the documentation — every
				<code>--v-*</code> knob, <code>o-*</code> object, <code>t-*</code> tool,
				and <code>c-*</code> component is shown with a live render alongside its
				values. This page is built framework-free: plain HTML markup plus the
				CSS package's <code>index.css</code>, with no framework code.
			</p>`,
		)}
		<h2>Explore</h2>
		${navCards()}`;

	return renderPage({ section: null, main });
}
