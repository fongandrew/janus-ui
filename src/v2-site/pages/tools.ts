/*
	Tools sub-page (§20.2.3, under Composition) — the t-* utility cheat-sheet. One tile per
	utility (name + one-line effect + a roomy live demo), laid out in a responsive grid so
	each demo has room to read; a table squished them. Completes the Composition section.
	The tools are the escape hatch (§11); the objects and component knobs cover the common
	cases, so the set is deliberately small.
*/
import { renderPage } from '~/v2-site/layout';

interface Tool {
	name: string;
	desc: string;
	demo: string;
}

/** The neutral block the utilities act on (an accent fill so padding/borders read). */
const BOX = (label: string, cls = '', style = '') =>
	`<span class="p-demo-box ${cls}"${style ? ` style="${style}"` : ''}>${label}</span>`;

function tile(t: Tool): string {
	return `
	<div class="p-tool" id="tool-${t.name}">
		<code class="p-tool__name">${t.name}</code>
		<span class="p-tool__desc">${t.desc}</span>
		<div class="p-tool__demo">${t.demo}</div>
	</div>`;
}

function group(title: string, rows: Tool[]): string {
	return `
	<section class="p-card">
		<h2>${title}</h2>
		<div class="o-grid" style="--o-grid__min: 13rem">${rows.map(tile).join('')}</div>
	</section>`;
}

export function render(): string {
	const spacing: Tool[] = [
		{ name: 't-p', desc: 'Pad both axes by the box pad.', demo: BOX('t-p', 't-p') },
		{ name: 't-px', desc: 'Pad the inline axis only.', demo: BOX('t-px', 't-px') },
		{ name: 't-py', desc: 'Pad the block axis only.', demo: BOX('t-py', 't-py') },
		{
			name: 't-p-0',
			desc: 'Zero all padding (vs a padded box).',
			demo: `${BOX('padded', 't-p')}${BOX('t-p-0', 't-p t-p-0')}`,
		},
	];
	const display: Tool[] = [
		{
			name: 't-flex',
			desc: 'Make a flex container.',
			demo: `<span class="t-flex" style="gap: 0.5rem">${BOX('a')}${BOX('b')}</span>`,
		},
		{
			name: 't-flex-fill',
			desc: 'Grow + shrink to fill (flex: 1 1 0).',
			demo: `<span class="t-flex" style="gap: 0.5rem; inline-size: 100%">${BOX('a')}${BOX('fill', 't-flex-fill')}</span>`,
		},
		{
			name: 't-flex-none',
			desc: 'Neither grow nor shrink.',
			demo: `<span class="t-flex" style="gap: 0.5rem; inline-size: 100%">${BOX('none', 't-flex-none')}${BOX('fill', 't-flex-fill')}</span>`,
		},
		{
			name: 't-hidden',
			desc: 'display: none.',
			demo: `${BOX('shown')}${BOX('gone', 't-hidden')}`,
		},
	];
	const chrome: Tool[] = [
		{
			name: 't-border',
			desc: 'Add the dynamic 1px border.',
			demo: BOX('t-border', 't-border', 'background: var(--v-bg)'),
		},
		{
			name: 't-border-inner',
			desc: 'Inset hairline (no layout shift).',
			demo: BOX('t-border-inner', 't-border-inner', 'background: var(--v-bg)'),
		},
		{
			name: 't-radius-none',
			desc: 'Square the corners.',
			demo: BOX('t-radius-none', 't-radius-none'),
		},
		{
			name: 't-radius-full',
			desc: 'Pill the corners.',
			demo: BOX('t-radius-full', 't-radius-full t-px'),
		},
		{
			name: 't-shadow',
			desc: 'Resting outer elevation.',
			demo: BOX('t-shadow', 't-shadow', 'background: var(--v-bg)'),
		},
		{
			name: 't-shadow-inner',
			desc: 'Embossed inner shadow.',
			demo: BOX('t-shadow-inner', 't-shadow-inner', 'background: var(--v-bg)'),
		},
	];
	const text: Tool[] = [
		{
			name: 't-align-center',
			desc: 'Center text.',
			demo: BOX('t-align-center', 't-align-center', 'display: block; inline-size: 100%'),
		},
		{
			name: 't-align-end',
			desc: 'End-align text.',
			demo: BOX('t-align-end', 't-align-end', 'display: block; inline-size: 100%'),
		},
		{
			name: 't-truncate',
			desc: 'Single-line ellipsis.',
			demo: BOX(
				'A long line that truncates with an ellipsis',
				't-truncate',
				'display: block; max-inline-size: 100%',
			),
		},
		{
			name: 't-sr-only',
			desc: 'Visually hidden, kept for AT.',
			demo: `<span class="p-tool__note">“present” + <span class="t-sr-only">screen-reader text</span>hidden text</span>`,
		},
	];

	return renderPage({
		section: 'composition',
		composition: 'tools',
		main: `
		<div class="o-stack">
			<header class="o-prose">
				<h1>Tools</h1>
				<p>
					The narrow <code>t-*</code> utility set (§11) — the escape hatch for one-off
					cases the objects and component knobs don't cover. They live in the last cascade
					layer, so a utility wins over a component without <code>!important</code>.
				</p>
			</header>
			${group('Spacing', spacing)}
			${group('Display &amp; flex', display)}
			${group('Border, radius, shadow', chrome)}
			${group('Text', text)}
		</div>`,
	});
}
