import { For } from 'solid-js';

import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';
import { DocSection, TokenTable } from '~/lib2-site/token-table';

const SPACING_ROWS = [
	{
		name: '--v-spacing',
		default: '1rem',
		description: 'Base spacing unit — the master rhythm lever.',
		primary: true,
	},
	{
		name: '--v-input-height',
		default: '2rem',
		description: 'Height of interactive controls. Independent of --v-spacing.',
		primary: true,
	},
	{
		name: '--v-pad-block',
		default: 'calc(var(--v-spacing) * 1.25)',
		description: 'Default block padding for box objects (the pad scale).',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--v-pad-inline',
		default: 'calc(var(--v-spacing) * 1.25)',
		description: 'Default inline padding for box objects.',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--v-gap-block',
		default: 'var(--v-spacing)',
		description: 'Base within-group stack gap (o-stack).',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--v-gap-inline',
		default: 'calc(var(--v-spacing) * 0.5)',
		description: 'Gap between clustered inline items — toolbar buttons, tags.',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--v-gap-section',
		default: 'calc(var(--v-spacing) * 1.5)',
		description: 'Gap between cards / page sections (o-grid, o-container flow).',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--v-gap-tight',
		default: 'calc(var(--v-spacing) * 0.25)',
		description: 'Smallest gap: label→control in a form field.',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--v-control-inset',
		default: 'calc((var(--v-input-height) - 1em) / 2)',
		description: "A control's internal inline padding (text-to-border).",
		derivedFrom: '--v-input-height',
	},
];

const RADIUS_ROWS = [
	{
		name: '--v-radius',
		default: '2.5rem',
		description: 'The max radius — the assumed window/frame corner; the cascade anchor.',
		primary: true,
	},
	{
		name: '--v-radius-min',
		default: '0.375rem',
		description:
			'The radius floor. Nothing rounds below it. Flat look = set equal to --v-radius.',
		primary: true,
	},
	{
		name: '--v-border-width',
		default: '1px',
		description: 'Base border width.',
		primary: true,
	},
	{
		name: '--o-dialog__offset',
		default: 'calc(0.75 * var(--v-spacing))',
		description: "A dialog's viewport-edge breathing room.",
		derivedFrom: '--v-spacing',
	},
	{
		name: '--o-dialog__radius',
		default: 'max(min, radius − offset)',
		description: 'Dialog frame radius: window radius minus the inset (§8.3).',
		derivedFrom: '--v-radius, --o-dialog__offset',
	},
	{
		name: '--o-box__radius',
		default: 'max(min, radius − pad)',
		description: 'Box radius: one pad-step in from the frame.',
		derivedFrom: '--v-radius, --v-pad-inline',
	},
	{
		name: '--o-input-box__radius',
		default: 'max(min, radius − pad)',
		description: 'Control radius; boxes step it one pad deeper for their children.',
		derivedFrom: '--v-radius, --v-pad-inline',
	},
];

const COLOR_ROWS = [
	{
		name: '--v-bg',
		default: 'light-dark(hsl(30deg 12% 98.5%), hsl(216deg 16% 8%))',
		description: 'Body background — warm off-white light, deep blue-gray dark.',
		primary: true,
	},
	{
		name: '--v-link',
		default: 'light-dark(hsl(195deg 100% 20%), hsl(183deg 25% 85%))',
		description: 'Link color — saturated dark teal.',
		primary: true,
	},
	{
		name: '--v-accent',
		default: 'light-dark(hsl(195deg 100% 20%), hsl(183deg 25% 85%))',
		description: 'Accent / current-action color (focus ring, selection).',
		primary: true,
	},
	{
		name: '--v-muted',
		default: 'light-dark(hsl(30deg 7% 31%), hsl(30deg 7% 86.5%))',
		description: 'De-emphasized text color.',
		primary: true,
	},
	{
		name: '--v-fg',
		default: 'oklch(from var(--v-bg) calc((0.5 - l) * infinity) 0 0)',
		description: 'Foreground — binary black/white contrast derived from the bg lightness.',
		derivedFrom: '--v-bg',
	},
	{
		name: '--v-border-color',
		default: 'color-mix(in hsl, base mix%, var(--v-bg))',
		description: 'Dynamic border — a fixed perceptual distance from any surface.',
		derivedFrom: '--v-bg, --v-border-dynamic-*',
	},
	{
		name: '--v-border-color-strong',
		default: 'color-mix(in hsl, var(--v-fg) 28%, var(--v-bg))',
		description: 'Control border — visibly stronger than card seams.',
		derivedFrom: '--v-fg, --v-bg',
	},
	{
		name: '--v-card-bg',
		default: 'light-dark(hsl(0deg 0% 100%), hsl(216deg 16% 12%))',
		description: 'Raised surface: cards, popovers, modal body.',
	},
	{
		name: '--v-input-bg',
		default: 'light-dark(hsl(0deg 0% 100%), hsl(216deg 16% 10%))',
		description: 'Recessed control well (darker than cards in dark mode).',
	},
	{
		name: '--v-backdrop',
		default: 'light-dark(hsl(216deg 16% 8% / 50%), hsl(216deg 16% 2% / 60%))',
		description: 'Modal / drawer backdrop tint.',
	},
	{
		name: '--v-body-bg',
		default: 'two radial gradients over var(--v-bg)',
		description: 'Painted body background — subtle warm/cool depth.',
		derivedFrom: '--v-bg',
	},
	{
		name: '--v-ring',
		default: 'var(--v-accent)',
		description: 'Focus ring — crisp outline layer.',
		derivedFrom: '--v-accent',
	},
	{
		name: '--v-ring-alt',
		default: 'color-mix(in hsl, var(--v-accent) 35%, transparent)',
		description: 'Focus ring — soft halo layer.',
		derivedFrom: '--v-accent',
	},
	{
		name: '--v-link-weight-min / --v-accent-weight-min / --v-muted-weight-min',
		default: '500',
		description: 'Contrast-floor weight bump for text in each color (§7.1).',
	},
];

const TYPE_ROWS = [
	{
		name: '--v-font-family',
		default: 'ui-sans-serif, system-ui, …',
		description: 'Base font stack.',
		primary: true,
	},
	{
		name: '--v-font-family-mono',
		default: 'ui-monospace, …',
		description: 'Monospace stack for code.',
		primary: true,
	},
	{
		name: '--v-font-size-min / --v-font-size-max',
		default: '0.9375rem / 0.9375rem',
		description:
			'Body-size anchors. Equal by default — fixed 15px type; spread them for fluid.',
		primary: true,
	},
	{
		name: '--v-font-ratio-min / --v-font-ratio-max',
		default: '1.2 / 1.2',
		description: 'Modular-scale ratios at each viewport anchor. Equal = one fixed ratio.',
		primary: true,
	},
	{
		name: '--v-viewport-min / --v-viewport-max',
		default: '20rem / 80rem',
		description: 'Viewport anchors for all fluid interpolation.',
		primary: true,
	},
	{
		name: '--v-line-height',
		default: '1.5',
		description: 'Base (multiplicative) line height for body copy.',
		primary: true,
	},
	{
		name: '--v-font-size',
		default: 'clamp(min, slope·vw + intercept, max)',
		description: 'Resolved base body size — step 0 of the scale.',
		derivedFrom: 'anchors + ratios',
	},
	{
		name: '--v-font-size-h1 … -h6',
		default: 'steps +3, +2, +1, 0, 0, 0',
		description: 'Heading sizes by semantic level, not scale position.',
		derivedFrom: 'anchors + ratios',
	},
	{
		name: '--v-font-size-caption / --v-font-size-code',
		default: 'step −1 (floored ≥ ~13px)',
		description: 'Small text for captions/badges and monospace text.',
		derivedFrom: 'anchors + ratios',
	},
	{
		name: '--v-line-height-h1 … -code',
		default: 'calc(1em + 0.5 * var(--v-spacing))',
		description: 'Additive leading — constant space between lines at every size.',
		derivedFrom: '--v-spacing',
	},
	{
		name: '--o-prose__gap',
		default: 'calc(1 * var(--v-line-height) * 1em)',
		description: 'Paragraph rhythm — one full line (rides the line, not spacing).',
		derivedFrom: '--v-line-height',
	},
	{
		name: '--o-prose__heading-gap',
		default: 'calc(1 * var(--v-line-height) * 1em)',
		description: "The space a heading owns above itself (in the heading's em).",
		derivedFrom: '--v-line-height',
	},
	{
		name: '--v-list-rhythm',
		default: 'calc(0.5 * var(--o-prose__gap))',
		description: 'List-item spacing switch: grouped (default) vs continuous.',
		derivedFrom: '--o-prose__gap',
	},
	{
		name: '--v-font-weight-normal / -label / -subtitle / -strong / -title',
		default: '400 / 500 / 600 / 600 / 700',
		description: 'Semantic weight stack. Tinted surfaces bump the whole stack ~100.',
		primary: true,
	},
];

const SHADOW_ROWS = [
	{
		name: '--v-shadow-outer',
		default: '0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%)',
		description: 'Resting outer elevation — multi-layer for real depth.',
		primary: true,
	},
	{
		name: '--v-shadow-inner',
		default: 'inset 0 1px 2px 0 rgb(0 0 0 / 10%)',
		description: 'Embossed-input inset.',
		primary: true,
	},
	{
		name: '--v-shadow-inner-top / --v-shadow-inner-bottom',
		default: 'inset 0 ±6px 6px -4px rgb(0 0 0 / 15%)',
		description: 'Scroll-edge shadows for scrollable modal/drawer content.',
	},
	{
		name: '--v-shadow-focus',
		default: '0 0 0 0.125rem var(--v-ring-alt)',
		description: 'The halo layer of the focus ring.',
		derivedFrom: '--v-ring-alt',
	},
];

const MOTION_ROWS = [
	{
		name: '--v-duration',
		default: '240ms',
		description:
			'The standard pace. Components derive ×0.5 (hover) and ×2 (extended) via calc(). prefers-reduced-motion zeros it.',
		primary: true,
	},
	{
		name: '--v-ease',
		default: 'cubic-bezier(0.4, 0, 0.2, 1)',
		description: 'Standard easing (Material-style ease-out).',
		primary: true,
	},
];

const TOC = [
	{ href: '#spacing', label: 'Spacing' },
	{ href: '#radius', label: 'Radius & border' },
	{ href: '#color', label: 'Color' },
	{ href: '#typography', label: 'Typography' },
	{ href: '#shadow', label: 'Shadow' },
	{ href: '#motion', label: 'Motion' },
];

const GAP_TOKENS = [
	'--v-gap-tight',
	'--v-gap-inline',
	'--v-gap-block',
	'--v-pad-block',
	'--v-gap-section',
];

const SWATCHES = [
	'--v-bg',
	'--v-fg',
	'--v-link',
	'--v-accent',
	'--v-muted',
	'--v-card-bg',
	'--v-input-bg',
	'--v-border-color',
	'--v-border-color-strong',
	'--v-ring',
	'--v-ring-alt',
];

function VariablesPage() {
	return (
		<CompositionLayout current="variables" toc={TOC}>
			<hgroup>
				<h1>Variables</h1>
				<p>
					Every public <code>--v-*</code> knob: primary knobs have static defaults you set
					to define a design; secondary knobs derive from them and exist so you can break
					one relationship without touching the primary.
				</p>
			</hgroup>

			<DocSection id="spacing" title="Spacing">
				<TokenTable rows={SPACING_ROWS} />
				<div class="p-token-render">
					<p class="p-token-render__label">
						The rhythm scales as spacer bars (each drawn at its token's width):
					</p>
					<For each={GAP_TOKENS}>
						{(token) => (
							<div class="p-spacing-ruler">
								<code>{token}</code>
								<span
									class="p-spacing-ruler__bar"
									style={{ width: `var(${token})` }}
								/>
							</div>
						)}
					</For>
				</div>
			</DocSection>

			<DocSection id="radius" title="Radius & border">
				<TokenTable rows={RADIUS_ROWS} />
				<div class="p-token-render">
					<p class="p-token-render__label">
						The cascade steps inward from the frame anchor and floors at the min —
						depth, not element type, decides how round a corner is:
					</p>
					<div class="p-radius-row">
						<div class="p-radius-tile" style={{ 'border-radius': 'var(--v-radius)' }}>
							<code>--v-radius</code>
						</div>
						<div
							class="p-radius-tile"
							style={{ 'border-radius': 'var(--o-dialog__radius)' }}
						>
							<code>--o-dialog__radius</code>
						</div>
						<div
							class="p-radius-tile"
							style={{ 'border-radius': 'var(--o-box__radius)' }}
						>
							<code>--o-box__radius</code>
						</div>
						<div
							class="p-radius-tile"
							style={{ 'border-radius': 'var(--v-radius-min)' }}
						>
							<code>--v-radius-min</code>
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection id="color" title="Color">
				<TokenTable rows={COLOR_ROWS} />
				<div class="p-token-render">
					<p class="p-token-render__label">
						Resolved swatches (light/dark follows the page):
					</p>
					<div class="p-swatch-grid">
						<For each={SWATCHES}>
							{(token) => (
								<div class="p-swatch">
									<span
										class="p-swatch__chip"
										style={{ background: `var(${token})` }}
									/>
									<code>{token}</code>
								</div>
							)}
						</For>
					</div>
				</div>
			</DocSection>

			<DocSection id="typography" title="Typography">
				<TokenTable rows={TYPE_ROWS} />
				<div class="p-token-render">
					<p class="p-token-render__label">
						The type ramp at the current viewport (fixed by default — resizing the
						window does not move it):
					</p>
					<div class="p-type-ramp">
						<span style={{ 'font-size': 'var(--v-font-size-h1)' }}>h1 · step +3</span>
						<span style={{ 'font-size': 'var(--v-font-size-h2)' }}>h2 · step +2</span>
						<span style={{ 'font-size': 'var(--v-font-size-h3)' }}>h3 · step +1</span>
						<span style={{ 'font-size': 'var(--v-font-size)' }}>body · step 0</span>
						<span style={{ 'font-size': 'var(--v-font-size-caption)' }}>
							caption · step −1 (floored)
						</span>
					</div>
				</div>
			</DocSection>

			<DocSection id="shadow" title="Shadow">
				<TokenTable rows={SHADOW_ROWS} />
				<div class="p-token-render">
					<div class="p-shadow-row">
						<div
							class="p-shadow-tile"
							style={{ 'box-shadow': 'var(--v-shadow-outer)' }}
						>
							outer
						</div>
						<div
							class="p-shadow-tile"
							style={{ 'box-shadow': 'var(--v-shadow-inner)' }}
						>
							inner
						</div>
						<div
							class="p-shadow-tile"
							style={{ 'box-shadow': 'var(--v-shadow-inner-top)' }}
						>
							scroll top
						</div>
						<div
							class="p-shadow-tile"
							style={{ 'box-shadow': 'var(--v-shadow-inner-bottom)' }}
						>
							scroll bottom
						</div>
						<div
							class="p-shadow-tile"
							style={{ 'box-shadow': 'var(--v-shadow-focus)' }}
						>
							focus halo
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection id="motion" title="Motion">
				<TokenTable rows={MOTION_ROWS} />
			</DocSection>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <VariablesPage />);
}
