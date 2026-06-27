/*
	Variables sub-page (§20.2.1) — the reference for every public --v-* knob and the
	primary human-review surface for the token layer (PLAN Phase 1). Framework-free:
	static markup + index.css, zero JS. The per-token slider islands hydrate on top
	later (Phase 9) and are never a prerequisite for this page.

	Shell/demo styling uses the site's `s-` classes (see site.css); the LIVE RENDERS
	deliberately drive real --v-* tokens so a reviewer sees the token in effect.
*/
import { esc, renderPage } from '~/lib2-site/layout';

interface Knob {
	name: string;
	def: string;
	desc: string;
	derived?: boolean;
}

function knobTable(rows: Knob[]): string {
	const body = rows
		.map(
			(r) => `
			<tr>
				<td><code>${esc(r.name)}</code></td>
				<td><code>${esc(r.def)}</code></td>
				<td>${r.derived ? 'derived' : 'primary'}</td>
				<td>${esc(r.desc)}</td>
			</tr>`,
		)
		.join('');

	return `
	<table>
		<thead>
			<tr><th>Knob</th><th>Default</th><th>Tier</th><th>Description</th></tr>
		</thead>
		<tbody>${body}</tbody>
	</table>`;
}

function section(opts: { id: string; title: string; table: string; render: string }): string {
	return `
	<section class="s-card" id="${opts.id}">
		<h2>${esc(opts.title)}</h2>
		${opts.table}
		<div class="s-render">${opts.render}</div>
	</section>`;
}

function spacingSection(): string {
	const ruler = ['--v-gap-inline', '--v-gap-block', '--v-pad-inline', '--v-spacing']
		.map(
			(v) =>
				`<div class="s-bar-row"><span class="s-bar-row__label"><code>${v}</code></span><span class="s-bar" style="inline-size: var(${v})"></span></div>`,
		)
		.join('');

	return section({
		id: 'spacing',
		title: 'Spacing',
		table: knobTable([
			{ name: '--v-spacing', def: '1rem', desc: 'Base spacing unit — the scale lever.' },
			{
				name: '--v-input-height',
				def: '2.5rem',
				desc: 'Control height. Independent of --v-spacing.',
			},
			{
				name: '--v-border-width',
				def: '1px',
				desc: 'Base border width (bundled with spacing).',
			},
			{
				name: '--v-pad-block',
				def: 'var(--v-spacing)',
				desc: 'Box block padding.',
				derived: true,
			},
			{
				name: '--v-pad-inline',
				def: 'var(--v-spacing)',
				desc: 'Box inline padding.',
				derived: true,
			},
			{ name: '--v-gap-block', def: 'var(--v-spacing)', desc: 'Stack gap.', derived: true },
			{
				name: '--v-gap-inline',
				def: 'calc(var(--v-spacing) * 0.5)',
				desc: 'Group / row gap.',
				derived: true,
			},
			{
				name: '--v-control-inset',
				def: 'calc((var(--v-input-height) - 1em) / 2)',
				desc: 'Control text-to-border inset; the "inner text" alignment reference.',
				derived: true,
			},
		]),
		render: ruler,
	});
}

function radiusSection(): string {
	const row = ['0', '0.25rem', '0.5rem', '1rem', '2rem']
		.map(
			(r) =>
				`<span class="s-radius-tile" style="--v-radius: ${r}; border-radius: var(--v-radius)">${r}</span>`,
		)
		.join('');

	return section({
		id: 'radius',
		title: 'Radius & border',
		table: knobTable([
			{
				name: '--v-radius',
				def: '0.5rem',
				desc: 'The MAX radius — the assumed frame corner; the cascade anchor.',
			},
			{
				name: '--v-radius-min',
				def: '0.25rem',
				desc: 'The MIN radius — the floor. Nothing rounds below it.',
			},
			{
				name: '--v-border-color',
				def: 'color-mix(… --v-border-dynamic-* and --v-bg)',
				desc: 'Dynamic border, a fixed perceptual distance from any surface.',
				derived: true,
			},
			{
				name: '--o-dialog__radius',
				def: 'max(min, --v-radius − offset)',
				desc: 'Dialog corner (cascade).',
				derived: true,
			},
			{
				name: '--o-box__radius',
				def: 'max(min, --v-radius − pad)',
				desc: 'Box corner (cascade).',
				derived: true,
			},
			{
				name: '--o-input-box__radius',
				def: 'max(min, box − pad)',
				desc: 'Control corner, one step deeper than its box.',
				derived: true,
			},
		]),
		render: `<div class="s-tile-row">${row}</div>`,
	});
}

function colorSection(): string {
	const swatches = [
		{ id: 'swatch-bg', cssVar: '--v-bg', label: '--v-bg' },
		{ id: 'swatch-fg', cssVar: '--v-fg', label: '--v-fg' },
		{ id: 'swatch-link', cssVar: '--v-link', label: '--v-link' },
		{ id: 'swatch-accent', cssVar: '--v-accent', label: '--v-accent' },
		{ id: 'swatch-muted', cssVar: '--v-muted', label: '--v-muted' },
		{ id: 'swatch-border', cssVar: '--v-border-color', label: '--v-border-color' },
	]
		.map(
			(s) =>
				`<div class="s-swatch" id="${s.id}" style="background: var(${s.cssVar})"><code>${s.label}</code></div>`,
		)
		.join('');

	return section({
		id: 'color',
		title: 'Color',
		table: knobTable([
			{
				name: '--v-bg',
				def: 'light-dark(hsl(30 12% 98.5%), hsl(216 16% 8%))',
				desc: 'Body / base background.',
			},
			{
				name: '--v-link',
				def: 'light-dark(hsl(195 100% 20%), hsl(183 25% 85%))',
				desc: 'Link color.',
			},
			{
				name: '--v-accent',
				def: 'var(--v-link)',
				desc: 'Focus ring / selected / primary tint.',
			},
			{
				name: '--v-muted',
				def: 'light-dark(hsl(30 7% 31%), hsl(30 7% 86.5%))',
				desc: 'De-emphasized text.',
			},
			{
				name: '--v-fg',
				def: 'oklch(from var(--v-bg) calc((0.5 - l) * infinity) 0 0)',
				desc: 'Binary black/white contrast from --v-bg.',
				derived: true,
			},
			{
				name: '--v-ring',
				def: 'var(--v-accent)',
				desc: 'Crisp focus outline.',
				derived: true,
			},
			{
				name: '--v-ring-alt',
				def: 'color-mix(in hsl, var(--v-accent) 35%, transparent)',
				desc: 'Soft focus halo.',
				derived: true,
			},
			{
				name: '--v-link-weight-min',
				def: '500',
				desc: 'Contrast-floor weight bump for link text.',
				derived: true,
			},
		]),
		render: `<div class="s-swatch-grid">${swatches}</div>`,
	});
}

function typographySection(): string {
	const ramp = [
		['--v-font-size-h1', 'Heading 1'],
		['--v-font-size-h2', 'Heading 2'],
		['--v-font-size-h3', 'Heading 3'],
		['--v-font-size', 'Body text'],
		['--v-font-size-caption', 'Caption'],
		['--v-font-size-code', 'Code'],
	]
		.map(
			([v, label]) =>
				`<div class="s-ramp-row" style="font-size: var(${v})"><span class="s-ramp-row__label"><code>${v}</code></span> ${label}</div>`,
		)
		.join('');

	return section({
		id: 'typography',
		title: 'Typography',
		table: knobTable([
			{
				name: '--v-font-size-min',
				def: '0.9375rem',
				desc: 'Base body size at the min viewport.',
			},
			{
				name: '--v-font-size-max',
				def: '0.9375rem',
				desc: 'Base body size at the max viewport (equal → fixed 15px).',
			},
			{
				name: '--v-font-ratio-min',
				def: '1.2',
				desc: 'Modular-scale ratio at the min viewport.',
			},
			{
				name: '--v-font-ratio-max',
				def: '1.2',
				desc: 'Ratio at the max viewport (equal → fixed ramp).',
			},
			{ name: '--v-viewport-min', def: '20rem', desc: 'Lower fluid anchor.' },
			{ name: '--v-viewport-max', def: '80rem', desc: 'Upper fluid anchor.' },
			{ name: '--v-line-height', def: '1.5', desc: 'Base body line height.' },
			{
				name: '--v-font-size',
				def: 'clamp() step 0',
				desc: 'Resolved base body size; fixed by default.',
				derived: true,
			},
			{
				name: '--v-font-size-h1',
				def: 'clamp() step +3',
				desc: 'Page title.',
				derived: true,
			},
			{
				name: '--v-font-size-caption',
				def: 'clamp() step −1',
				desc: 'Caption / badge / tooltip text (floored ~13px).',
				derived: true,
			},
			{
				name: '--v-font-weight-title',
				def: '700',
				desc: 'Semantic weight: page title.',
				derived: true,
			},
		]),
		render: `<div class="s-stack">${ramp}</div>`,
	});
}

function shadowSection(): string {
	const tiles = [
		'--v-shadow-outer',
		'--v-shadow-inner',
		'--v-shadow-inner-top',
		'--v-shadow-inner-bottom',
	]
		.map(
			(v) =>
				`<div class="s-shadow-tile" style="box-shadow: var(${v})"><code>${v}</code></div>`,
		)
		.join('');

	return section({
		id: 'shadow',
		title: 'Shadow & motion',
		table: knobTable([
			{
				name: '--v-shadow-outer',
				def: '0 1px 3px 0 rgb(0 0 0 / 10%), …',
				desc: 'Resting outer elevation.',
			},
			{
				name: '--v-shadow-inner',
				def: 'inset 0 1px 2px 0 rgb(0 0 0 / 10%)',
				desc: 'Embossed-input inset.',
			},
			{
				name: '--v-shadow-inner-top',
				def: 'inset 0 6px 6px -4px …',
				desc: 'Scroll-edge shadow (top).',
			},
			{
				name: '--v-shadow-inner-bottom',
				def: 'inset 0 -6px 6px -4px …',
				desc: 'Scroll-edge shadow (bottom).',
			},
			{ name: '--v-duration', def: '240ms', desc: 'Standard transition pace.' },
			{ name: '--v-ease', def: 'cubic-bezier(0.4, 0, 0.2, 1)', desc: 'Standard easing.' },
		]),
		render: `<div class="s-tile-row">${tiles}</div>`,
	});
}

export function render(): string {
	return renderPage({
		section: 'composition',
		composition: 'variables',
		main: `
		<div class="s-stack">
			<header class="s-prose">
				<h1>Variables</h1>
				<p>
					Every public <code>--v-*</code> knob, with its default, tier, and a live
					render. This is the human-review surface for the token layer — primary knobs
					have static defaults; derived knobs fall out of them.
				</p>
			</header>
			${spacingSection()}
			${radiusSection()}
			${colorSection()}
			${typographySection()}
			${shadowSection()}
		</div>`,
	});
}
