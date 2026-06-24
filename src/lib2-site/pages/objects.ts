/*
 * Composition → Objects (§20.2.2).
 *
 * The review artifact + E2E target for the object layer. One demo card per
 * object with a live render (neutral placeholder content so structure is the
 * focus), its --o-<name>__* knobs, and a copyable markup snippet. Plus the
 * cross-cutting demos the layer hinges on: four-level concentric nesting under
 * radius presets, the v-align-edge / v-align-text modes side by side, o-grid /
 * o-split reflow, and an o-segmented settings group.
 */
import { compositionPage, esc, sectionCard } from '~/lib2-site/shell';

/** A box of neutral placeholder content. */
function ph(label: string): string {
	return `<span class="c-demo-ph">${esc(label)}</span>`;
}

function objectCard(
	name: string,
	knobs: string[],
	demo: string,
	snippet: string,
	id: string,
): string {
	const knobList = knobs.length
		? `<p class="c-obj__knobs">${knobs.map((k) => `<code>${esc(k)}</code>`).join(' ')}</p>`
		: '';
	return `
		<section class="c-card o-box v-surface-card c-obj" id="${id}">
			<header><h3>${esc(name)}</h3></header>
			<div class="c-obj__demo">${demo}</div>
			${knobList}
			<pre class="c-obj__snippet"><code>${esc(snippet)}</code></pre>
		</section>`;
}

/* ---- Cross-cutting demos (the E2E anchors) ---- */

function radiusNesting(preset: string, prefix: string): string {
	return `
		<div class="${preset}">
			<div class="o-dialog c-demo-frame" id="${prefix}-dialog">
				<span class="c-demo-tag">o-dialog</span>
				<div class="o-box c-demo-frame" id="${prefix}-box">
					<span class="c-demo-tag">o-box</span>
					<button class="o-input-box c-demo-frame" id="${prefix}-input" type="button">o-input-box</button>
				</div>
			</div>
		</div>`;
}

function radiusSection(): string {
	const body = `
		<p>
			The four-level nesting model (§9.1). Under <code>v-radius-concentric</code> each
			layer's corner = the inner radius + the padding between, so corners stay
			optically parallel and never go sharp. Under <code>v-radius-uniform</code> the
			radii are two flat values.
		</p>
		<div class="o-grid" style="--o-grid__min: 18rem">
			<figure id="radius-concentric">
				<figcaption><code>v-radius-concentric</code></figcaption>
				${radiusNesting('v-radius-concentric', 'cc')}
			</figure>
			<figure id="radius-uniform">
				<figcaption><code>v-radius-uniform</code></figcaption>
				${radiusNesting('v-radius-uniform', 'cu')}
			</figure>
		</div>`;
	return sectionCard('Radius presets & nesting', body, 'radius-presets');
}

function alignSection(): string {
	const row = (mode: string, id: string) => `
		<figure class="${mode}" id="${id}">
			<figcaption><code>${esc(mode)}</code></figcaption>
			<div class="o-box v-surface-card c-demo-align">
				<button class="o-input-box c-demo-frame" type="button">Control</button>
				<div class="o-text-box">Plain text in an o-text-box</div>
			</div>
		</figure>`;
	const body = `
		<p>
			The inline-alignment budget (§6.1), positive padding only. In
			<code>v-align-edge</code> the control's border-box lands at the container
			padding; in <code>v-align-text</code> the control's text and the plain text
			share one inline offset.
		</p>
		<div class="o-grid" style="--o-grid__min: 16rem">
			${row('v-align-edge', 'align-edge')}
			${row('v-align-text', 'align-text')}
		</div>`;
	return sectionCard('Alignment modes', body, 'alignment');
}

function reflowSection(): string {
	const grid = `
		<div class="o-grid" id="demo-grid" style="--o-grid__min: 12rem">
			${[1, 2, 3, 4, 5, 6].map((n) => `<div class="o-box v-surface-card">${ph('cell ' + n)}</div>`).join('')}
		</div>`;
	const split = `
		<div class="o-split" id="demo-split">
			<div class="o-box v-surface-card">${ph('sidebar')}</div>
			<div class="o-box v-surface-card">${ph('main')}</div>
		</div>`;
	const body = `
		<p>Both reflow with no media queries. Resize to watch the grid drop columns and the split stack.</p>
		<h4><code>o-grid</code></h4>
		${grid}
		<h4><code>o-split</code></h4>
		${split}`;
	return sectionCard('Responsive reflow', body, 'reflow');
}

function segmentedSection(): string {
	const cells = ['Wi-Fi', 'Bluetooth', 'Airplane mode']
		.map((c) => `<div class="o-bar o-bar--contains-input">${esc(c)}</div>`)
		.join('');
	const body = `
		<p>Shared-border cells with dividers instead of gaps; only first/last corners round (§9.8).</p>
		<div class="o-segmented v-surface-card" id="demo-segmented" style="max-inline-size: 22rem">
			${cells}
		</div>`;
	return sectionCard('Segmented group', body, 'segmented');
}

/* ---- Per-object catalogue ---- */

function catalogue(): string {
	const cards = [
		objectCard(
			'o-box',
			['--o-box__pad-block', '--o-box__pad-inline', '--o-box__radius'],
			`<div class="o-box v-surface-card" id="demo-box">${ph('box content')}</div>`,
			'<div class="o-box">…</div>',
			'cat-box',
		),
		objectCard(
			'o-text-box',
			['--o-text-box__pad-block', '--o-text-box__pad-inline', '--o-text-box__radius'],
			`<div class="o-text-box v-surface-card" id="demo-text-box">Prose in an o-text-box.</div>`,
			'<div class="o-text-box">Prose…</div>',
			'cat-text-box',
		),
		objectCard(
			'o-input-box',
			['--o-input-box__radius'],
			`<button class="o-input-box c-demo-frame" type="button">o-input-box</button>`,
			'<button class="o-input-box">…</button>',
			'cat-input-box',
		),
		objectCard(
			'o-square',
			[],
			`<div class="o-square v-surface-card" style="inline-size: 3rem">${ph('1:1')}</div>`,
			'<div class="o-square">…</div>',
			'cat-square',
		),
		objectCard(
			'o-stack',
			['--o-stack__gap'],
			`<div class="o-stack" id="demo-stack">${ph('one')}${ph('two')}${ph('three')}</div>`,
			'<div class="o-stack">…</div>',
			'cat-stack',
		),
		objectCard(
			'o-group',
			['--o-group__gap'],
			`<div class="o-group" id="demo-group">${ph('one')}${ph('two')}${ph('three')}</div>`,
			'<div class="o-group">…</div>',
			'cat-group',
		),
		objectCard(
			'o-row',
			['--o-row__gap'],
			`<div class="o-row">${ph('one')}${ph('two')}</div>`,
			'<div class="o-row">…</div>',
			'cat-row',
		),
		objectCard(
			'o-bar',
			['--o-bar__height', '--o-bar__pad-block', '--o-bar__pad-inline'],
			`<div class="o-bar v-surface-card">${ph('title')}${ph('action')}</div>`,
			'<header class="o-bar">…</header>',
			'cat-bar',
		),
		objectCard(
			'o-caption',
			['--o-caption__font-size'],
			`<span class="o-caption v-muted">caption text</span>`,
			'<span class="o-caption">…</span>',
			'cat-caption',
		),
		objectCard(
			'o-code',
			['--o-code__font-size'],
			`<span class="o-code">const x = 1;</span>`,
			'<code class="o-code">…</code>',
			'cat-code',
		),
		objectCard(
			'o-menu',
			['--o-menu__pad-block', '--o-menu__pad-inline'],
			`<div class="o-menu v-surface-card" style="max-inline-size: 14rem">
				<div class="o-menu-item">${ph('Item one')}</div>
				<div class="o-menu-item">${ph('Item two')}</div>
			</div>`,
			'<div class="o-menu">…</div>',
			'cat-menu',
		),
	].join('');
	return `<div class="o-grid" style="--o-grid__min: 18rem">${cards}</div>`;
}

export function render(): string {
	const main = `
		<h1>Objects</h1>
		<p class="c-home__lede">
			The pure-CSS structural primitives (§9). Each owns spacing, sizing, and
			radius — never visual chrome. Neutral placeholder content keeps the focus on
			structure.
		</p>
		${radiusSection()}
		${alignSection()}
		${reflowSection()}
		${segmentedSection()}
		<h2>Catalogue</h2>
		${catalogue()}`;
	return compositionPage('objects', main);
}
