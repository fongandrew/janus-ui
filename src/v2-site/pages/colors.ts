/*
	Colors section (§20.3). Section 1 is the variant grid: every v-colors-* palette
	rendered as a surface cell exercising its bg / fg / muted / link knobs, so a reviewer
	can confirm each tone reads correctly in light and dark. Below it, the v-surface-*
	treatments.

	Follow-ups (per PLAN): the APCA Lc score + pass/fail overlay on each cell, and the
	interactive color playground island — both Phase 9 (the playground needs the DOM/Solid
	layer; the APCA scorer is carried forward from v1 then).
*/
import { renderPage } from '~/v2-site/layout';

const TONAL = ['primary', 'secondary', 'success', 'warn', 'info', 'danger'] as const;
const SURFACE_ROLE = ['code', 'pre', 'callout', 'highlight', 'tooltip', 'popover'] as const;

function cell(variant: string): string {
	return `
	<div class="o-box p-color-cell v-colors-${variant}">
		<strong class="p-color-cell__name">v-colors-${variant}</strong>
		<p>Body text on this surface. <a href="#colors">A link</a>.</p>
		<p class="p-color-cell__muted">Muted / de-emphasised text.</p>
	</div>`;
}

function surfaceCell(surface: string): string {
	return `
	<div class="o-box p-color-cell v-surface-${surface}">
		<strong class="p-color-cell__name">v-surface-${surface}</strong>
		<p>Chrome on the current palette.</p>
	</div>`;
}

export function render(): string {
	return renderPage({
		section: 'colors',
		main: `
		<div class="o-stack">
			<header class="o-prose">
				<h1>Colors</h1>
				<p>
					Every <code>v-colors-*</code> palette and <code>v-surface-*</code> treatment, each
					exercising its background, foreground, muted, and link knobs. A variant re-sets the
					five root colour knobs for its subtree; <code>light-dark()</code> handles both
					schemes. <em>APCA Lc scoring and the interactive playground are Phase 9.</em>
				</p>
			</header>

			<section class="o-box p-card" id="tonal">
				<h2>Tonal variants</h2>
				<div class="o-grid" style="--o-grid__min: 14rem">
					${TONAL.map(cell).join('')}
				</div>
			</section>

			<section class="o-box p-card" id="surface-role">
				<h2>Surface-role variants</h2>
				<div class="o-grid" style="--o-grid__min: 14rem">
					${SURFACE_ROLE.map(cell).join('')}
				</div>
			</section>

			<section class="o-box p-card" id="surfaces">
				<h2>Surface treatments</h2>
				<div class="o-grid" style="--o-grid__min: 14rem">
					${['card', 'elevated', 'sunken', 'glass', 'gradient'].map(surfaceCell).join('')}
				</div>
			</section>
		</div>`,
	});
}
