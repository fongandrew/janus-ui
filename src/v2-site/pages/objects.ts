/*
	Objects sub-page (§20.2.2) — one demo per o-* object, each with a live render using
	neutral placeholder content so structural behavior is the focus. The review artifact
	for the object layer and the Phase 2 E2E target (PLAN 2.S / 2.T). Framework-free.

	The cascade demo (#cascade-root) re-roots --o-dialog__radius on the wrapper (the one
	cascade knob frozen at :root, §5.2) with the standard formula, so the inward radius
	stepping is visible here AND drivable by the E2E test via the wrapper's knobs.
*/
import { esc, renderPage } from '~/v2-site/layout';

function demo(opts: { id: string; title: string; note: string; render: string }): string {
	return `
	<section class="o-box p-card" id="${opts.id}">
		<h2>${esc(opts.title)}</h2>
		<p>${opts.note}</p>
		<div class="p-render">${opts.render}</div>
	</section>`;
}

/** A neutral placeholder block for filling layout objects. */
function ph(label: string, extra = ''): string {
	return `<div class="p-ph"${extra}>${esc(label)}</div>`;
}

// NOTE (Phase 9): the per-level radius readouts below ("o-dialog (2rem)", etc.) are
// STATIC strings hand-matched to this demo's --v-radius override — they don't track the
// real resolved radii or the shipped --v-radius anchor. Make this an interactive island:
// sliders for --v-radius / --v-radius-min driving the surfaces, with each label showing
// its element's *computed* border-radius live (read getComputedStyle). Until then the
// numbers are illustrative, not authoritative. (PLAN Phase 9 — slider islands, §20.2.)
function cascadeDemo(): string {
	return `
	<section class="o-box p-card" id="cascade">
		<h2>Radius cascade — four-level nesting</h2>
		<p>
			<code>o-dialog</code> &gt; <code>o-box</code> &gt; <code>o-input-box</code>. Each level
			steps inward from the frame by the padding between it and its parent, floored at
			<code>--v-radius-min</code> — so corners track <em>depth</em>, never go sharp, and
			<code>min == max</code> flattens the whole thing.
		</p>
		<div
			class="p-render"
			id="cascade-root"
			style="
				--v-radius: 2.5rem;
				--v-radius-min: 0.25rem;
				--v-pad-block: 0.5rem;
				--v-pad-inline: 0.5rem;
				--o-dialog__offset: 0.5rem;
				--o-dialog__radius: max(var(--v-radius-min), calc(var(--v-radius) - var(--o-dialog__offset)));
			"
		>
			<div class="o-dialog p-cascade-dialog" id="cascade-dialog">
				<span class="p-cascade-label">o-dialog (2rem)</span>
				<div class="o-box p-cascade-box" id="cascade-box">
					<span class="p-cascade-label">o-box (1.5rem)</span>
					<button type="button" class="o-input-box p-cascade-input" id="cascade-input">
						o-input-box (1rem)
					</button>
				</div>
			</div>
		</div>
	</section>`;
}

export function render(): string {
	return renderPage({
		section: 'composition',
		composition: 'objects',
		main: `
		<div class="o-stack">
			<header class="o-prose">
				<h1>Objects</h1>
				<p>
					The structural / layout primitives (<code>o-*</code>). Each owns spacing,
					sizing, padding, and radius — never visual chrome. Neutral placeholder content
					keeps the focus on structure.
				</p>
			</header>

			${cascadeDemo()}

			${demo({
				id: 'box',
				title: 'o-box',
				note: 'The universal padded container. Uniform block padding (<code>text-box-trim</code> keeps it optically uniform around raw text — no 1lh compensation), inline padding = <code>--v-pad-inline</code> (the radius-cascade step). It holds components/rows <em>or</em> raw text — there is no separate text-box; perimeter text alignment is <code>o-prose</code>’s job.',
				render: `<div class="o-box p-outline" id="demo-box">${ph('component contents')}</div>
					<div class="o-box p-outline" id="demo-box-text" style="margin-block-start: var(--v-gap-block)">A standalone block of raw text in an o-box. Its block padding reads optically uniform thanks to text-box trimming.</div>`,
			})}

			${demo({
				id: 'input-box',
				title: 'o-input-box',
				note: 'Shared base for text-bearing controls. Height = <code>--v-input-height</code>; inline padding = <code>--v-control-inset</code>.',
				render: `<button type="button" class="o-input-box p-outline" id="demo-input-box">o-input-box</button>`,
			})}

			${demo({
				id: 'square',
				title: 'o-square',
				note: '1:1 content (icons, avatars). Reads <code>--v-radius</code> directly; circle via <code>--v-radius: 50%</code>.',
				render: `<div class="o-square p-outline" style="inline-size: 4rem; background: color-mix(in hsl, var(--v-accent) 18%, var(--v-bg))">1:1</div>`,
			})}

			${demo({
				id: 'stack',
				title: 'o-stack',
				note: 'Vertical flow with a consistent <code>--o-stack__gap</code>.',
				render: `<div class="o-stack" id="demo-stack">${ph('one')}${ph('two')}${ph('three')}</div>`,
			})}

			${demo({
				id: 'group',
				title: 'o-group / o-row',
				note: 'Horizontal flow that wraps. <code>o-group</code> is top-aligned; <code>o-row</code> is center-aligned.',
				render: `<div class="o-group" id="demo-group">${ph('a')}${ph('b')}${ph('c')}</div>`,
			})}

			${demo({
				id: 'grid',
				title: 'o-grid',
				note: 'Intrinsic responsive grid — no breakpoints. Resize the window: columns fit to <code>--o-grid__min</code> (16rem).',
				render: `<div class="o-grid" id="demo-grid">${ph('1')}${ph('2')}${ph('3')}${ph('4')}${ph('5')}${ph('6')}</div>`,
			})}

			${demo({
				id: 'split',
				title: 'o-split',
				note: 'Two-up that collapses to stacked below a threshold — no media queries. Resize to see it wrap.',
				render: `<div class="o-split" id="demo-split">${ph('main', ' style="background: color-mix(in hsl, var(--v-accent) 12%, var(--v-bg))"')}${ph('aside')}</div>`,
			})}

			${demo({
				id: 'segmented',
				title: 'o-segmented',
				note: 'Cells sharing one border with dividers — the iOS-style grouped settings list. Replaces card-in-card.',
				render: `<div class="o-segmented p-outline" style="background: var(--v-bg)">
					<div class="o-bar">First row</div>
					<div class="o-bar">Second row</div>
					<div class="o-bar">Third row</div>
				</div>`,
			})}

			${demo({
				id: 'prose',
				title: 'o-prose',
				note: 'Boundary-owned vertical rhythm (the lower element owns the gap), trimmed text children, and depth-cycled list markers.',
				render: `<div class="o-prose">
					<hgroup>
						<h3>Title</h3>
						<p>Subtitle in an hgroup — additive leading, outer-edge trim.</p>
					</hgroup>
					<p>A paragraph. The gap above the next heading is the section break.</p>
					<h4>A heading</h4>
					<p>Body after a heading keeps the ordinary prose gap.</p>
					<ol>
						<li>Ordered, hanging tabular marker</li>
						<li>
							Second
							<ol>
								<li>Nested cycles to lower-alpha</li>
							</ol>
						</li>
					</ol>
				</div>`,
			})}

			${demo({
				id: 'menu',
				title: 'o-menu / o-menu-item',
				note: 'Popover frame + compact rows. Structural only — chrome comes from the composing component.',
				render: `<div class="o-menu p-outline" style="background: var(--v-bg); max-inline-size: 16rem">
					<div class="o-menu-item">First item</div>
					<div class="o-menu-item">Second item</div>
					<div class="o-menu-item">Third item</div>
				</div>`,
			})}

			${demo({
				id: 'caption-code',
				title: 'o-caption / o-code',
				note: 'Small-text and monospace structural primitives.',
				render: `<p class="o-caption">o-caption — small caption text.</p>
					<p class="o-code">o-code — monospaced text.</p>`,
			})}
		</div>`,
	});
}
