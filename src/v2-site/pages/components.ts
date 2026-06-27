/*
	Components section (§20.4) — the framework-free CSS gallery. Every c-* component
	rendered in its major states with raw markup + the v2 classes (no Solid, no data-js),
	so it's both the human-review surface for the component CSS and the Phase 3 E2E target.
	Phase 9 rebuilds this on the real Solid wrappers with full interactivity.
*/
import { esc, renderPage } from '~/v2-site/layout';

/** A titled demo card: heading, note, and a bordered live-render frame. */
function demo(opts: { id: string; title: string; note: string; body: string }): string {
	return `
	<section class="p-card" id="${opts.id}">
		<h2>${esc(opts.title)}</h2>
		<p>${opts.note}</p>
		<div class="p-render">${opts.body}</div>
	</section>`;
}

const TONES = ['primary', 'secondary', 'success', 'warn', 'info', 'danger'] as const;

function buttons(): string {
	const tonal = TONES.map(
		(t) => `<button type="button" class="c-button v-colors-${t}">${t}</button>`,
	).join('');
	return demo({
		id: 'buttons',
		title: 'Buttons',
		note: 'Default is the secondary tone; a <code>v-colors-*</code> class re-tones. Hover for the shadow + filter, focus for the ring. Icon, link, and disabled variants below.',
		body: `
		<div class="o-stack">
			<div class="o-group"><button type="button" class="c-button">Default</button>${tonal}</div>
			<div class="o-group">
				<button type="button" class="c-button c-button--icon" aria-label="Add">+</button>
				<button type="button" class="c-button" disabled>Disabled</button>
				<button type="button" class="c-button c-button--link">Link button</button>
			</div>
		</div>`,
	});
}

function inputs(): string {
	return demo({
		id: 'inputs',
		title: 'Inputs',
		note: 'Embossed inner shadow, focus ring on <code>:focus-visible</code>, danger border on <code>[aria-invalid]</code>. Textarea and native select share the surface.',
		body: `
		<div class="o-stack" style="max-inline-size: 24rem">
			<input class="c-input" type="text" value="With a value" />
			<input class="c-input" type="email" placeholder="you@example.com" />
			<input class="c-input" type="text" aria-invalid="true" value="Invalid value" />
			<input class="c-input" type="text" value="Disabled" disabled />
			<textarea class="c-textarea" placeholder="Textarea…"></textarea>
			<select class="c-select-native">
				<option>Native select</option>
				<option>Second option</option>
			</select>
		</div>`,
	});
}

function checks(): string {
	const check = `<span class="c-checkbox__check">✓</span><span class="c-checkbox__indeterminate">–</span>`;
	return demo({
		id: 'checks',
		title: 'Checkboxes, radios, toggles',
		note: 'Custom controls over a visually-hidden native input. Checked flips to the primary/accent tone; focus mirrors the ring onto the control.',
		body: `
		<div class="o-stack">
			<label class="c-checkbox"><span class="c-checkbox__box"><input type="checkbox" checked />${check}</span> Checked</label>
			<label class="c-checkbox"><span class="c-checkbox__box"><input type="checkbox" />${check}</span> Unchecked</label>
			<label class="c-checkbox"><span class="c-checkbox__box"><input type="checkbox" disabled />${check}</span> Disabled</label>
			<label class="c-radio"><span class="c-radio__circle"><input type="radio" name="r" checked /></span><span class="c-radio__dot"></span> Selected</label>
			<label class="c-radio"><span class="c-radio__circle"><input type="radio" name="r" /></span><span class="c-radio__dot"></span> Unselected</label>
			<label class="o-row"><span class="c-toggle"><input type="checkbox" checked /><span class="c-toggle__thumb"></span></span> Toggle on</label>
			<label class="o-row"><span class="c-toggle"><input type="checkbox" /><span class="c-toggle__thumb"></span></span> Toggle off</label>
		</div>`,
	});
}

function cards(): string {
	const surfaces = ['card', 'elevated', 'sunken', 'glass', 'gradient']
		.map(
			(s) =>
				`<div class="o-box v-surface-${s}"><strong>v-surface-${s}</strong><p>Surface treatment on the current palette.</p></div>`,
		)
		.join('');
	return demo({
		id: 'cards',
		title: 'Cards & surfaces',
		note: 'A <code>c-card</code> is chrome only — pair with <code>o-box</code> for padding. <code>v-surface-*</code> are orthogonal treatments.',
		body: `
		<div class="o-grid" style="--o-grid__min: 12rem">
			<article class="c-card o-box"><strong>c-card</strong><p>Resting outer shadow + dynamic border.</p></article>
			${surfaces}
		</div>`,
	});
}

function alerts(): string {
	const body = ['success', 'warn', 'info', 'danger']
		.map(
			(t) =>
				`<div class="c-alert v-colors-${t}"><strong>${t}</strong> — a toned message with the readability weight bump.</div>`,
		)
		.join('');
	return demo({
		id: 'alerts',
		title: 'Alerts',
		note: 'Callout tone by default; re-toned per intent. Empty alerts collapse so forms carry no dead band.',
		body: `<div class="o-stack">${body}</div>`,
	});
}

function pills(): string {
	const tags = TONES.map((t) => `<span class="c-tag v-colors-${t}">${t}</span>`).join('');
	return demo({
		id: 'pills',
		title: 'Tags, badges, avatars',
		note: 'Small chips composing <code>o-caption</code>; avatars compose <code>o-square</code>.',
		body: `
		<div class="o-stack">
			<div class="o-group">${tags}</div>
			<div class="o-row">
				<span class="c-badge">3</span>
				<span class="c-badge v-colors-danger">12</span>
				<span class="c-badge c-badge--dot v-colors-success"></span>
				<span class="c-avatar">AF</span>
				<span class="c-avatar" style="--v-radius: 50%">JD</span>
			</div>
		</div>`,
	});
}

function loaders(): string {
	return demo({
		id: 'loaders',
		title: 'Spinner & skeleton',
		note: 'CSS-only motion that settles to a static frame under <code>prefers-reduced-motion</code>.',
		body: `
		<div class="o-stack">
			<div class="o-row"><span class="c-spinner"></span> Loading…</div>
			<div class="o-stack" style="gap: 0.5rem; max-inline-size: 20rem">
				<span class="c-skeleton c-skeleton--text" style="inline-size: 80%"></span>
				<span class="c-skeleton c-skeleton--text" style="inline-size: 60%"></span>
				<span class="c-skeleton c-skeleton--circle" style="inline-size: 3rem"></span>
			</div>
		</div>`,
	});
}

function disclosureTabsMenu(): string {
	return demo({
		id: 'disclosure-tabs-menu',
		title: 'Disclosure, tabs, menu',
		note: 'Native <code>&lt;details&gt;</code> chrome; an inset-shadow tab indicator; a popover menu (the highlight is demo chrome — <code>data-active</code> / hover).',
		body: `
		<div class="o-stack">
			<details class="c-disclosure">
				<summary>Disclosure summary <span class="c-disclosure__chevron">›</span></summary>
				<div class="c-disclosure__content">Hidden content revealed on toggle.</div>
			</details>
			<div>
				<div class="c-tabs__list" role="tablist">
					<button type="button" class="c-tab" role="tab" aria-selected="true">First</button>
					<button type="button" class="c-tab" role="tab" aria-selected="false">Second</button>
					<button type="button" class="c-tab" role="tab" aria-disabled="true">Disabled</button>
				</div>
				<div class="c-tab__panel">Panel content for the selected tab.</div>
			</div>
			<div class="c-menu o-menu p-menu-demo" style="max-inline-size: 16rem">
				<button type="button" class="o-menu-item">First item</button>
				<button type="button" class="o-menu-item" data-active>Active item</button>
				<button type="button" class="o-menu-item">Third item</button>
			</div>
		</div>`,
	});
}

function overlays(): string {
	return demo({
		id: 'overlays',
		title: 'Modal, popover, tooltip',
		note: 'Overlays render statically here (opening + anchor positioning are JS, Phase 5). The modal shows its tiling header/body/footer surfaces on the transparent scroller.',
		body: `
		<div class="o-stack">
			<div class="c-modal" style="position: static; max-block-size: 18rem; inline-size: 100%; margin: 0">
				<div class="c-modal__header"><strong>Modal title</strong></div>
				<div class="c-modal__body"><p>The header rounds the top and scrolls away; the body fills and rounds the bottom. The frame is a transparent scroller.</p></div>
				<div class="c-modal__footer"><button type="button" class="c-button">Cancel</button><button type="button" class="c-button v-colors-primary">Confirm</button></div>
			</div>
			<div class="c-popover" style="position: static; max-inline-size: 18rem"><p>A popover matches the surrounding chrome.</p></div>
			<span class="c-tooltip" style="position: static; display: inline-block">A floating tooltip — always inverted.</span>
		</div>`,
	});
}

function tones(): string {
	return demo({
		id: 'tones',
		title: 'Surface-role tones',
		note: 'The non-tonal palettes: code / pre (terminal), callout, highlight, tooltip.',
		body: `
		<div class="o-stack">
			<p>Inline <code class="v-colors-code" style="padding: 0 0.3em; border-radius: 0.25rem">--v-bg</code> on tinted paper.</p>
			<pre class="v-colors-pre o-box" style="margin: 0">:root { --v-radius-min: 0.375rem; }</pre>
			<div class="o-box v-colors-callout">A callout aside with the weight bump for readability on a mid-tone surface.</div>
			<div class="o-box v-colors-highlight">A selected / highlighted row.</div>
		</div>`,
	});
}

export function render(): string {
	return renderPage({
		section: 'components',
		main: `
		<div class="o-stack">
			<header class="o-prose">
				<h1>Components</h1>
				<p>
					The <code>c-*</code> component catalogue rendered framework-free — raw markup +
					CSS, no JavaScript. Each composes the objects, variants, and state mixins. This is
					the review surface for the component CSS; Phase 9 rebuilds it on the Solid wrappers.
				</p>
			</header>
			${buttons()}
			${inputs()}
			${checks()}
			${cards()}
			${alerts()}
			${pills()}
			${loaders()}
			${disclosureTabsMenu()}
			${overlays()}
			${tones()}
		</div>`,
	});
}
