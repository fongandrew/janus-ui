/*
 * Composition → Variables (§20.2.1).
 *
 * The primary human-review surface for the token layer: one section per token
 * group, each pairing a reference table with a live render. Framework-free —
 * plain markup + the CSS package's index.css.
 */
import { compositionPage, esc, sectionCard, tokenTable } from '~/lib2-site/shell';

function swatch(varName: string, label: string): string {
	return `<figure class="c-swatch">
			<div class="c-swatch__chip" style="background: var(${varName})"></div>
			<figcaption><code>${esc(varName)}</code><br /><span class="v-muted">${esc(label)}</span></figcaption>
		</figure>`;
}

function spacingSection(): string {
	const sizes = [
		['--v-spacing', 'base scale lever'],
		['--v-pad-block', 'box block padding'],
		['--v-pad-inline', 'box inline padding'],
		['--v-gap-block', 'stack gap'],
		['--v-gap-inline', 'group / row gap'],
		['--v-control-inset', 'control text inset'],
	];
	const ruler = sizes
		.map(
			([v, label]) =>
				`<div class="c-ruler__row">
					<span class="c-ruler__bar" style="inline-size: var(${v})"></span>
					<code>${esc(v as string)}</code> <span class="v-muted">${esc(label as string)}</span>
				</div>`,
		)
		.join('');
	const table = tokenTable([
		{ knob: '--v-spacing', default: '0.75rem', desc: 'Base spacing unit; the rhythm lever.' },
		{
			knob: '--v-pad-block',
			default: 'var(--v-spacing)',
			desc: 'Default block padding for box objects.',
		},
		{
			knob: '--v-pad-inline',
			default: 'var(--v-spacing)',
			desc: 'Default inline padding for box objects.',
		},
		{
			knob: '--v-gap-block',
			default: 'var(--v-spacing)',
			desc: 'Default block gap (o-stack).',
		},
		{
			knob: '--v-gap-inline',
			default: 'calc(var(--v-spacing) * 0.5)',
			desc: 'Default inline gap (o-group, o-row).',
		},
		{
			knob: '--v-control-inset',
			default: 'var(--v-pad-inline)',
			desc: 'A control’s internal inline padding (§6.1).',
		},
		{
			knob: '--v-input-height',
			default: '2.5rem',
			desc: 'Height of interactive controls. Independent of spacing.',
		},
	]);
	return sectionCard(
		'Spacing & rhythm',
		`<div class="c-ruler">${ruler}</div>${table}`,
		'spacing',
	);
}

function radiusSection(): string {
	const tiles = ['--v-radius-min', '--v-radius']
		.map(
			(v) =>
				`<div class="c-radius-tile" style="border-radius: var(${v}); border: var(--v-border-width) solid var(--v-border-color)">
					<code>${esc(v)}</code>
				</div>`,
		)
		.join('');
	const table = tokenTable([
		{ knob: '--v-radius', default: '0.5rem', desc: 'Window / dialog frame radius.' },
		{
			knob: '--v-radius-min',
			default: '0.25rem',
			desc: 'Innermost floor; controls never round below this.',
		},
		{ knob: '--v-border-width', default: '1px', desc: 'Base border width.' },
		{
			knob: '--v-border-color',
			default: 'color-mix(in hsl, base mix, var(--v-bg))',
			desc: 'Dynamic border, a fixed perceptual distance from any surface (§01).',
		},
		{
			knob: '--v-border-dynamic-base',
			default: 'light-dark(black, white)',
			desc: 'The ink the border mixes toward.',
		},
		{
			knob: '--v-border-dynamic-mix',
			default: 'light-dark(17.5%, 50%)',
			desc: 'How far toward the ink the border sits.',
		},
	]);
	return sectionCard(
		'Radius & border',
		`<div class="c-tile-row">${tiles}</div>${table}`,
		'radius',
	);
}

function colorSection(): string {
	const swatches = [
		['--v-bg', 'background'],
		['--v-fg', 'foreground'],
		['--v-link', 'links'],
		['--v-accent', 'accent / ring'],
		['--v-muted', 'muted text'],
		['--v-ring', 'focus outline'],
		['--v-ring-alt', 'focus halo'],
		['--v-border-color', 'border'],
	]
		.map(([v, label]) => swatch(v as string, label as string))
		.join('');
	const table = tokenTable([
		{
			knob: '--v-bg',
			default: 'light-dark(hsl(30 12% 98.5%), hsl(216 16% 8%))',
			desc: 'Warm off-white / deep blue-gray. Not pure white/black.',
		},
		{
			knob: '--v-fg',
			default: 'oklch(from var(--v-bg) …)',
			desc: 'Binary black-or-white derived from bg lightness (§5.1).',
		},
		{
			knob: '--v-link',
			default: 'light-dark(hsl(195 100% 20%), hsl(183 25% 85%))',
			desc: 'Saturated teal — distinctive, not generic blue.',
		},
		{
			knob: '--v-accent',
			default: 'matches --v-link',
			desc: 'Focus ring, selected state, primary action tint.',
		},
		{
			knob: '--v-muted',
			default: 'light-dark(hsl(30 7% 31%), hsl(30 7% 86.5%))',
			desc: 'De-emphasized text.',
		},
		{
			knob: '--v-ring / --v-ring-alt',
			default: 'var(--v-accent) / 35% halo',
			desc: 'Crisp outline + soft halo of the focus ring (§07).',
		},
	]);
	return sectionCard(
		'Color',
		`<div class="c-swatch-row o-group">${swatches}</div>${table}`,
		'color',
	);
}

function typographySection(): string {
	const ramp = [
		'--v-font-size-h1',
		'--v-font-size-h2',
		'--v-font-size-h3',
		'--v-font-size',
		'--v-font-size-caption',
	]
		.map(
			(v) =>
				`<div class="c-ramp__row" style="font-size: var(${v})">
					Aa <code>${esc(v)}</code>
				</div>`,
		)
		.join('');
	const table = tokenTable([
		{
			knob: '--v-font-size-min',
			default: '1rem',
			desc: 'Base body size at / below the min viewport.',
		},
		{
			knob: '--v-font-size-max',
			default: '1.125rem',
			desc: 'Base body size at / above the max viewport.',
		},
		{
			knob: '--v-font-ratio-min',
			default: '1.2',
			desc: 'Modular scale ratio at the min viewport.',
		},
		{
			knob: '--v-font-ratio-max',
			default: '1.25',
			desc: 'Modular scale ratio at the max viewport.',
		},
		{ knob: '--v-viewport-min', default: '20rem', desc: 'Lower fluid anchor.' },
		{ knob: '--v-viewport-max', default: '80rem', desc: 'Upper fluid anchor.' },
		{ knob: '--v-line-height', default: '1.5', desc: 'Base (body) line height, unitless.' },
		{
			knob: '--v-font-size',
			default: 'clamp() step 0',
			desc: 'Resolved fluid base size (secondary).',
		},
		{
			knob: '--v-font-size-h1…-h6',
			default: 'clamp() steps +3…0',
			desc: 'Heading sizes, named by level not magnitude.',
		},
		{
			knob: '--v-font-size-caption / -code',
			default: 'clamp() step −1',
			desc: 'Small text and monospace sizes.',
		},
		{
			knob: '--v-font-family / -mono',
			default: 'system stacks',
			desc: 'Sans and monospace families.',
		},
	]);
	return sectionCard('Typography', `<div class="c-ramp">${ramp}</div>${table}`, 'typography');
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
				`<div class="c-shadow-tile" style="box-shadow: var(${v})"><code>${esc(v)}</code></div>`,
		)
		.join('');
	const table = tokenTable([
		{
			knob: '--v-shadow-outer',
			default: '0 1px 3px …, 0 1px 2px -1px …',
			desc: 'Realistic outer depth (cards, buttons on hover).',
		},
		{ knob: '--v-shadow-inner', default: 'inset 0 1px 2px …', desc: 'Embossed inputs.' },
		{
			knob: '--v-shadow-inner-top / -bottom',
			default: 'inset scroll-edge',
			desc: 'Scroll-edge shadows for modal/drawer content (§16).',
		},
		{
			knob: '--v-shadow-focus',
			default: '0 0 0 0.125rem var(--v-ring-alt)',
			desc: 'Inner halo layer of the focus ring.',
		},
	]);
	return sectionCard(
		'Shadow',
		`<div class="c-tile-row c-tile-row--pad">${tiles}</div>${table}`,
		'shadow',
	);
}

function motionSection(): string {
	const table = tokenTable([
		{
			knob: '--v-duration',
			default: '240ms',
			desc: 'Base transition pace. Derive faster/slower via calc().',
		},
		{
			knob: '--v-ease',
			default: 'cubic-bezier(0.4, 0, 0.2, 1)',
			desc: 'Material-style ease-out.',
		},
	]);
	return sectionCard(
		'Motion',
		`<p class="v-muted">prefers-reduced-motion zeros <code>--v-duration</code> and everything follows.</p>${table}`,
		'motion',
	);
}

export function render(): string {
	const main = `
		<h1>Variables</h1>
		<p class="c-home__lede">
			Every primary and secondary <code>--v-*</code> knob from §5.1, paired with a
			live render. This is where the palette is confirmed to read warm and
			intentional rather than browser-default.
		</p>
		${spacingSection()}
		${radiusSection()}
		${colorSection()}
		${typographySection()}
		${shadowSection()}
		${motionSection()}`;
	return compositionPage('variables', main);
}
