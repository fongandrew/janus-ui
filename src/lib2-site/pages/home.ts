/*
	Home page (placeholder — PLAN Phase 0.5 step 3).

	Enough to prove the shell renders and deploys: headline, one paragraph, and
	navigation cards that fill in as the section pages land. Full Home content
	(§20.1) is finished in Phase 9.
*/
import { esc, renderPage, TOP_NAV } from '~/lib2-site/layout';

function navCards(): string {
	const blurbs: Record<string, string> = {
		composition:
			'The building blocks: --v-* variables, o-* objects, t-* tools, and typography.',
		colors: 'The APCA contrast grid and the color playground.',
		components: 'The c-* component catalogue (built last, once objects and variants exist).',
	};

	return TOP_NAV.map(
		(item) => `
		<a class="s-card s-card--link" href="${item.href}">
			<h2>${item.label}</h2>
			<p>${esc(blurbs[item.key] ?? '')}</p>
		</a>`,
	).join('');
}

export function render(): string {
	return renderPage({
		main: `
		<div class="s-stack">
			<header class="s-hero">
				<h1>A CSS-first design system</h1>
				<p>
					Janus v2 is a fork-and-copy design system for modern browsers. Its core is
					plain CSS — knobs over utilities, semantic names, a small public surface —
					with optional vanilla-JS and SolidJS layers on top.
				</p>
			</header>
			<section class="s-grid" aria-label="Sections">
				${navCards()}
			</section>
		</div>`,
	});
}
