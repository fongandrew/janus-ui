/*
	Tools sub-page (§20.2.3, under Composition) — the t-* utility cheat-sheet. One tile per
	utility (name + one-line effect + a roomy live demo), in a responsive grid.

	Demo note: the doc-site p-* classes are UNLAYERED, so they win over the layered tools
	(the cascade can't help here — tools is the last LAYER, but unlayered beats every
	layer). So a removal/override tool (t-p-0, t-radius-none) is demoed against a baseline
	whose property comes from a LAYERED source (the o-box object) that the tool can
	override, and the alignment tools act on a clean flex row (only t-* classes) rather
	than the p-tool__demo surface, which sets its own align-items.
*/
import { renderPage } from '~/v2-site/layout';

interface Tool {
	name: string;
	desc: string;
	demo: string;
}

/** The neutral block the utilities act on (an accent fill so the effect reads). */
const BOX = (label: string, cls = '', style = '') =>
	`<span class="p-demo-box ${cls}"${style ? ` style="${style}"` : ''}>${label}</span>`;

/** A clean flex row (only t-* classes) so alignment tools aren't overridden by p-*. */
const ROW = (cls: string, items: string, style = '') =>
	`<div class="t-flex ${cls}" style="inline-size: 100%; gap: 0.5rem; ${style}">${items}</div>`;

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
			desc: 'Zero padding (here, off an o-box).',
			demo: `${BOX('o-box', 'o-box')}${BOX('t-p-0', 'o-box t-p-0')}`,
		},
	];
	const display: Tool[] = [
		{
			name: 't-flex',
			desc: 'Make a flex container.',
			demo: ROW('', `${BOX('a')}${BOX('b')}`),
		},
		{
			name: 't-flex-fill',
			desc: 'Grow + shrink to fill (flex: 1 1 0).',
			demo: ROW('', `${BOX('a')}${BOX('fill', 't-flex-fill')}`),
		},
		{
			name: 't-flex-none',
			desc: 'Neither grow nor shrink.',
			demo: ROW('', `${BOX('none', 't-flex-none')}${BOX('fill', 't-flex-fill')}`),
		},
		{
			name: 't-hidden',
			desc: 'display: none.',
			demo: ROW('', `${BOX('shown')}${BOX('gone', 't-hidden')}`),
		},
	];
	const align: Tool[] = [
		{
			name: 't-items-start / -center / -end',
			desc: 'Flex CROSS-axis (align-items).',
			demo: ROW('t-items-end', `${BOX('a')}${BOX('b')}`, 'block-size: 4rem'),
		},
		{
			name: 't-justify-center',
			desc: 'Flex MAIN-axis: center.',
			demo: ROW('t-justify-center', `${BOX('a')}${BOX('b')}`),
		},
		{
			name: 't-justify-between',
			desc: 'Flex MAIN-axis: space-between.',
			demo: ROW('t-justify-between', `${BOX('a')}${BOX('b')}`),
		},
		{
			name: 't-text-center',
			desc: 'TEXT align: center.',
			demo: BOX('t-text-center', 't-text-center', 'display: block; inline-size: 100%'),
		},
		{
			name: 't-text-end',
			desc: 'TEXT align: end.',
			demo: BOX('t-text-end', 't-text-end', 'display: block; inline-size: 100%'),
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
			desc: 'Square an o-box’s corners.',
			demo: `${BOX('o-box', 'o-box')}${BOX('t-radius-none', 'o-box t-radius-none')}`,
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
			name: 't-shadow-none',
			desc: 'Remove a shadow (off t-shadow).',
			demo: `${BOX('t-shadow', 't-shadow', 'background: var(--v-bg)')}${BOX('none', 't-shadow t-shadow-none', 'background: var(--v-bg)')}`,
		},
	];
	const misc: Tool[] = [
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
			demo: `<span class="p-tool__note">Reads “Save changes” to a screen reader, shows only: <strong>Save</strong><span class="t-sr-only"> changes</span></span>`,
		},
	];

	return renderPage({
		section: 'composition',
		composition: 'tools',
		main: `
		<div class="o-container o-stack">
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
			${group('Alignment', align)}
			${group('Border, radius, shadow', chrome)}
			${group('Text &amp; a11y', misc)}
		</div>`,
	});
}
