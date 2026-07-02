import { type JSX } from 'solid-js';

import { CompositionLayout } from '../layout';
import { renderPage } from '../render';

/**
 * Composition › Variables (§20.2.1) — the primary human-review surface for the
 * token layer. One section per token group: a reference table (knob, default,
 * description) paired with a live render. Zero client JS — the static reference
 * + render is the artifact; workbench affordances arrive in Phase 9.
 */

interface Knob {
	name: string;
	def: string;
	desc: string;
}

function KnobTable(props: { knobs: Knob[] }) {
	return (
		<table class="p-doc-table">
			<thead>
				<tr>
					<th>Knob</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{props.knobs.map((k) => (
					<tr>
						<td>
							<code>{k.name}</code>
						</td>
						<td>
							<code>{k.def}</code>
						</td>
						<td>{k.desc}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

function Section(props: { id: string; title: string; knobs: Knob[]; children: JSX.Element }) {
	return (
		<section class="p-doc-section" id={props.id}>
			<h2>{props.title}</h2>
			<KnobTable knobs={props.knobs} />
			<div class="p-doc-demo" data-testid={`demo-${props.id}`}>
				{props.children}
			</div>
		</section>
	);
}

function Variables() {
	return (
		<CompositionLayout current="variables" title="Variables">
			<div class="o-prose p-doc-section">
				<p>
					A handful of documented custom-property "knobs" drive the whole system.
					Primary knobs have static defaults; secondary knobs derive from them via{' '}
					<code>calc()</code> / <code>color-mix()</code>. Everything below resolves to a
					concrete value on <code>:root</code>.
				</p>
			</div>

			<Section
				id="spacing"
				title="Spacing & rhythm"
				knobs={[
					{ name: '--v-spacing', def: '1rem', desc: 'Base spacing lever.' },
					{ name: '--v-pad-block', def: '1.25 × spacing', desc: 'Box block padding.' },
					{ name: '--v-pad-inline', def: '1.25 × spacing', desc: 'Box inline padding.' },
					{ name: '--v-gap-block', def: '1 × spacing', desc: 'Base stack gap.' },
					{ name: '--v-gap-inline', def: '0.5 × spacing', desc: 'Cluster gap.' },
					{ name: '--v-gap-section', def: '1.5 × spacing', desc: 'Section / card gap.' },
					{ name: '--v-gap-tight', def: '0.25 × spacing', desc: 'Label → control gap.' },
					{ name: '--v-input-height', def: '2rem', desc: 'Control height (independent of spacing).' },
					{ name: '--v-control-inset', def: '(height − 1em) / 2', desc: 'Control inline text inset.' },
				]}
			>
				<div class="p-demo-ruler">
					{[
						['tight', 'var(--v-gap-tight)'],
						['inline', 'var(--v-gap-inline)'],
						['block', 'var(--v-gap-block)'],
						['pad', 'var(--v-pad-block)'],
						['section', 'var(--v-gap-section)'],
					].map(([label, value]) => (
						<div class="p-demo-ruler__row">
							<span class="p-demo-ruler__label">{label}</span>
							<span class="p-demo-ruler__bar" style={{ 'inline-size': value }} />
						</div>
					))}
				</div>
			</Section>

			<Section
				id="radius"
				title="Radius & border"
				knobs={[
					{ name: '--v-radius', def: '2.5rem', desc: 'Max radius (frame anchor).' },
					{ name: '--v-radius-min', def: '0.375rem', desc: 'Radius floor.' },
					{ name: '--v-border-width', def: '1px', desc: 'Base border width.' },
					{ name: '--v-border-color', def: 'color-mix(…)', desc: 'Dynamic card border.' },
					{ name: '--v-border-color-strong', def: 'color-mix(fg 28%)', desc: 'Control border.' },
				]}
			>
				<div class="p-demo-row">
					{[
						['min', 'var(--v-radius-min)'],
						['box', 'var(--o-box__radius)'],
						['dialog', 'var(--o-dialog__radius)'],
						['max', 'var(--v-radius)'],
					].map(([label, value]) => (
						<div class="p-demo-swatch" style={{ 'border-radius': value, border: '1px solid var(--v-border-color)' }}>
							{label}
						</div>
					))}
				</div>
			</Section>

			<Section
				id="color"
				title="Color"
				knobs={[
					{ name: '--v-bg', def: 'light-dark(warm off-white, deep blue-gray)', desc: 'Base background.' },
					{ name: '--v-fg', def: 'oklch(from bg …)', desc: 'Binary contrast foreground.' },
					{ name: '--v-link', def: 'saturated teal', desc: 'Link color.' },
					{ name: '--v-accent', def: 'var(--v-link)', desc: 'Accent / focus / selection.' },
					{ name: '--v-muted', def: 'warm gray', desc: 'De-emphasized text.' },
					{ name: '--v-card-bg', def: 'light-dark(white, +light)', desc: 'Raised surface.' },
					{ name: '--v-input-bg', def: 'light-dark(white, −dark)', desc: 'Control well.' },
					{ name: '--v-backdrop', def: 'light-dark(…/50%, …/60%)', desc: 'Modal backdrop tint.' },
				]}
			>
				<div class="p-demo-row">
					{[
						['bg', 'var(--v-bg)'],
						['fg', 'var(--v-fg)'],
						['link', 'var(--v-link)'],
						['accent', 'var(--v-accent)'],
						['muted', 'var(--v-muted)'],
						['card', 'var(--v-card-bg)'],
						['input', 'var(--v-input-bg)'],
					].map(([label, value]) => (
						<div class="p-demo-color">
							<span class="p-demo-color__chip" style={{ background: value }} />
							<span class="p-demo-color__label">{label}</span>
						</div>
					))}
				</div>
			</Section>

			<Section
				id="typography"
				title="Typography"
				knobs={[
					{ name: '--v-font-size-min', def: '0.9375rem', desc: 'Body size at min viewport.' },
					{ name: '--v-font-size-max', def: '0.9375rem', desc: 'Body size at max viewport (= min → fixed).' },
					{ name: '--v-font-ratio-min', def: '1.2', desc: 'Modular ratio at min viewport.' },
					{ name: '--v-font-ratio-max', def: '1.2', desc: 'Ratio at max viewport (= min → single ratio).' },
					{ name: '--v-viewport-min', def: '20rem', desc: 'Fluid lower anchor.' },
					{ name: '--v-viewport-max', def: '80rem', desc: 'Fluid upper anchor.' },
					{ name: '--v-line-height', def: '1.5', desc: 'Body line height.' },
					{ name: '--v-font-size-h1…h6', def: 'steps +3…0', desc: 'Semantic heading sizes.' },
					{ name: '--v-font-size-caption / -code', def: 'step −1', desc: 'Small text sizes.' },
				]}
			>
				<div class="p-demo-ramp">
					<p style={{ 'font-size': 'var(--v-font-size-h1)' }}>h1 — The quick brown fox</p>
					<p style={{ 'font-size': 'var(--v-font-size-h2)' }}>h2 — The quick brown fox</p>
					<p style={{ 'font-size': 'var(--v-font-size-h3)' }}>h3 — The quick brown fox</p>
					<p style={{ 'font-size': 'var(--v-font-size)' }}>body — The quick brown fox</p>
					<p style={{ 'font-size': 'var(--v-font-size-caption)' }}>caption — The quick brown fox</p>
				</div>
			</Section>

			<Section
				id="shadow"
				title="Shadow"
				knobs={[
					{ name: '--v-shadow-outer', def: 'multi-layer drop', desc: 'Resting elevation.' },
					{ name: '--v-shadow-inner', def: 'inset', desc: 'Embossed input.' },
					{ name: '--v-shadow-inner-top / -bottom', def: 'inset edge', desc: 'Scroll-edge shadows.' },
				]}
			>
				<div class="p-demo-row">
					<div class="p-demo-tile" style={{ 'box-shadow': 'var(--v-shadow-outer)' }}>outer</div>
					<div class="p-demo-tile" style={{ 'box-shadow': 'var(--v-shadow-inner)' }}>inner</div>
				</div>
			</Section>

			<Section
				id="motion"
				title="Motion"
				knobs={[
					{ name: '--v-duration', def: '240ms', desc: 'Standard pace (reduced-motion → 0).' },
					{ name: '--v-ease', def: 'cubic-bezier(0.4,0,0.2,1)', desc: 'Standard easing.' },
				]}
			>
				<p>
					Components derive faster/slower paces via <code>calc()</code>:{' '}
					<code>× 0.5</code> for hover/active, <code>× 2</code> for extended transitions.
				</p>
			</Section>
		</CompositionLayout>
	);
}

export function render() {
	return renderPage(() => <Variables />);
}
