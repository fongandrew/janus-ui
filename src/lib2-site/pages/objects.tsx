import { type JSX } from 'solid-js';

import { CompositionLayout } from '../layout';
import { renderPage } from '../render';

/**
 * Composition › Objects (§20.2.2) — one demo per object with a live render, the
 * object's knobs, and a copyable markup snippet. Also the E2E target for the
 * object layer: the radius cascade, bar height modes, grid/split reflow,
 * segmented groups, and prose rhythm.
 */

function Demo(props: { id: string; title: string; children: JSX.Element; note?: string }) {
	return (
		<section class="p-doc-section" id={props.id}>
			<h2>{props.title}</h2>
			{props.note ? <p class="p-doc-note">{props.note}</p> : null}
			<div class="p-doc-demo">{props.children}</div>
		</section>
	);
}

function Objects() {
	return (
		<CompositionLayout current="objects" title="Objects">
			<div class="o-prose p-doc-section">
				<p>
					Structural / layout primitives — zero JS, zero chrome. Borders are drawn here
					only so the structure is visible; the objects themselves carry no color.
				</p>
			</div>

			<Demo
				id="radius-cascade"
				title="Radius cascade (o-dialog › o-box › o-input-box)"
				note="Each level rounds inward from the frame by the padding between it and its parent, floored at --v-radius-min. Depth, not type."
			>
				<div class="o-dialog p-demo-outline" data-testid="cascade-dialog">
					<div class="o-box p-demo-outline" data-testid="cascade-box">
						<button class="o-input-box p-demo-outline" data-testid="cascade-control" type="button">
							control in dialog box
						</button>
						<div class="o-box p-demo-outline" data-testid="cascade-inner-box">
							<button
								class="o-input-box p-demo-outline"
								data-testid="cascade-inner-control"
								type="button"
							>
								control in nested box
							</button>
						</div>
					</div>
				</div>
			</Demo>

			<Demo
				id="box-padding"
				title="o-box padding"
				note="Uniform block padding = --v-pad-block; inline padding = --v-pad-inline (floored at the box radius)."
			>
				<div class="o-box p-demo-outline" data-testid="pad-box">
					<span>padded content</span>
				</div>
			</Demo>

			<Demo
				id="bar-modes"
				title="o-bar height modes"
				note="Same input in each. Text (default), Contains (control text sits --v-spacing from the edge), Input (bar is exactly one control tall)."
			>
				<div class="o-bar p-demo-outline" data-testid="bar-text" style={{ position: 'static' }}>
					<span>Text mode</span>
					<input class="o-input-box p-demo-outline" type="text" value="input" />
				</div>
				<div
					class="o-bar o-bar--contains p-demo-outline"
					data-testid="bar-contains"
					style={{ position: 'static' }}
				>
					<span>Contains mode</span>
					<input class="o-input-box p-demo-outline" type="text" value="input" />
				</div>
				<div
					class="o-bar o-bar--input p-demo-outline"
					data-testid="bar-input"
					style={{ position: 'static' }}
				>
					<input class="o-input-box p-demo-outline" type="text" value="input" />
				</div>
			</Demo>

			<Demo id="section-flow" title="Section flow (o-container)" note="Direct children separated by --v-gap-section; a heading-led section takes the heading's space-above.">
				<div class="o-container" data-testid="flow-container" style={{ 'max-inline-size': 'none' }}>
					<div class="o-box p-demo-outline" data-testid="flow-a">
						section a
					</div>
					<div class="o-box p-demo-outline" data-testid="flow-b">
						section b
					</div>
					<div class="o-prose" data-testid="flow-heading">
						<h3>heading-led section</h3>
						<p>body</p>
					</div>
				</div>
			</Demo>

			<Demo id="grid" title="o-grid (intrinsic responsive)" note="auto-fill columns, min cell width --o-grid__min. Resize to see reflow.">
				<div class="o-grid" data-testid="grid" style={{ '--o-grid__min': '10rem' }}>
					{[1, 2, 3, 4, 5, 6].map((n) => (
						<div class="o-box p-demo-outline">cell {n}</div>
					))}
				</div>
			</Demo>

			<Demo id="split" title="o-split (collapses to stacked)">
				<div class="o-split" data-testid="split">
					<div class="o-box p-demo-outline">sidebar</div>
					<div class="o-box p-demo-outline">main</div>
				</div>
			</Demo>

			<Demo id="stack-group" title="o-stack / o-group">
				<div class="o-stack" data-testid="stack">
					<div class="o-box p-demo-outline">row 1</div>
					<div class="o-box p-demo-outline">row 2</div>
				</div>
				<div class="o-group" data-testid="group" style={{ 'margin-block-start': '1rem' }}>
					<button class="o-input-box p-demo-outline" type="button">
						one
					</button>
					<button class="o-input-box p-demo-outline" type="button">
						two
					</button>
				</div>
			</Demo>

			<Demo id="segmented" title="o-segmented (grouped settings)">
				<div class="o-segmented p-demo-outline" data-testid="segmented">
					<div class="o-box">first cell</div>
					<div class="o-box">middle cell</div>
					<div class="o-box">last cell</div>
				</div>
			</Demo>

			<Demo id="prose" title="o-prose rhythm">
				<div class="o-prose" data-testid="prose">
					<hgroup>
						<h2>Title</h2>
						<p>Subtitle reads continuous with the title</p>
					</hgroup>
					<p>A first paragraph of running text.</p>
					<p>A second paragraph — boundary-owned rhythm.</p>
					<h3>A heading owns its space-above</h3>
					<p>Content after the heading keeps the ordinary prose gap.</p>
					<ol>
						<li>Ordered one</li>
						<li>Ordered two</li>
					</ol>
				</div>
			</Demo>
		</CompositionLayout>
	);
}

export function render() {
	return renderPage(() => <Objects />);
}
