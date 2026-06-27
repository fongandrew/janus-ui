/*
	Tools sub-page (§20.2.3, under Composition) — one row per t-* utility with a one-line
	description and a live example. Completes the Composition section. The tools are the
	escape hatch (§11); the objects and component knobs cover the common cases, so this set
	is deliberately small and fits on roughly one screen.
*/
import { renderPage } from '~/v2-site/layout';

interface Tool {
	name: string;
	desc: string;
	demo: string;
}

/** A neutral block the utilities act on. */
const BLOCK = '<span class="p-ph">box</span>';

function toolRow(t: Tool): string {
	return `
	<tr id="tool-${t.name}">
		<td><code>${t.name}</code></td>
		<td>${t.desc}</td>
		<td>${t.demo}</td>
	</tr>`;
}

function group(title: string, rows: Tool[]): string {
	return `
	<section class="o-box p-card">
		<h2>${title}</h2>
		<table>
			<thead><tr><th>Tool</th><th>Effect</th><th>Example</th></tr></thead>
			<tbody>${rows.map(toolRow).join('')}</tbody>
		</table>
	</section>`;
}

export function render(): string {
	const spacing: Tool[] = [
		{
			name: 't-p',
			desc: 'Apply the box pad on both axes.',
			demo: `<span class="p-ph t-p">t-p</span>`,
		},
		{
			name: 't-px',
			desc: 'Apply inline pad only.',
			demo: `<span class="p-ph t-px">t-px</span>`,
		},
		{
			name: 't-py',
			desc: 'Apply block pad only.',
			demo: `<span class="p-ph t-py">t-py</span>`,
		},
		{ name: 't-p-0', desc: 'Zero all padding.', demo: `<span class="p-ph t-p-0">t-p-0</span>` },
	];
	const display: Tool[] = [
		{
			name: 't-flex',
			desc: 'Flex container.',
			demo: `<span class="t-flex" style="gap: 0.5rem">${BLOCK}${BLOCK}</span>`,
		},
		{
			name: 't-flex-fill',
			desc: 'Grow + shrink to fill (flex: 1 1 0).',
			demo: `<span class="t-flex" style="gap: 0.5rem">${BLOCK}<span class="p-ph t-flex-fill">fill</span></span>`,
		},
		{
			name: 't-flex-none',
			desc: 'Neither grow nor shrink.',
			demo: `<span class="t-flex" style="gap: 0.5rem"><span class="p-ph t-flex-none">none</span>${BLOCK}</span>`,
		},
		{
			name: 't-hidden',
			desc: 'display: none.',
			demo: `${BLOCK}<span class="p-ph t-hidden">gone</span>`,
		},
	];
	const chrome: Tool[] = [
		{
			name: 't-border',
			desc: 'Dynamic 1px border.',
			demo: `<span class="p-ph t-border">t-border</span>`,
		},
		{
			name: 't-border-inner',
			desc: 'Inset hairline (no layout shift).',
			demo: `<span class="p-ph t-border-inner">t-border-inner</span>`,
		},
		{
			name: 't-radius-none',
			desc: 'Square the corners.',
			demo: `<span class="p-ph t-radius-none">t-radius-none</span>`,
		},
		{
			name: 't-radius-full',
			desc: 'Pill the corners.',
			demo: `<span class="p-ph t-radius-full t-px">t-radius-full</span>`,
		},
		{
			name: 't-shadow',
			desc: 'Resting elevation.',
			demo: `<span class="p-ph t-shadow">t-shadow</span>`,
		},
		{
			name: 't-shadow-inner',
			desc: 'Embossed inner shadow.',
			demo: `<span class="p-ph t-shadow-inner">t-shadow-inner</span>`,
		},
	];
	const text: Tool[] = [
		{
			name: 't-align-center',
			desc: 'Center text.',
			demo: `<span class="p-ph t-align-center" style="display: block">t-align-center</span>`,
		},
		{
			name: 't-truncate',
			desc: 'Single-line ellipsis.',
			demo: `<span class="p-ph t-truncate" style="display: block; max-inline-size: 9rem">A long line that truncates with an ellipsis</span>`,
		},
		{
			name: 't-sr-only',
			desc: 'Visually hidden, kept for AT.',
			demo: `(hidden)<span class="t-sr-only">screen-reader text</span>`,
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
