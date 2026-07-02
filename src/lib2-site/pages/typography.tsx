import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';
import { DocSection } from '~/lib2-site/token-table';

const TOC = [
	{ href: '#headings', label: 'Headings' },
	{ href: '#body', label: 'Body & links' },
	{ href: '#code', label: 'Code' },
	{ href: '#lists', label: 'Lists' },
	{ href: '#tables', label: 'Tables' },
	{ href: '#forms', label: 'Form defaults' },
	{ href: '#scale', label: 'The scale' },
];

function TypographyPage() {
	return (
		<CompositionLayout current="typography" toc={TOC}>
			<hgroup>
				<h1>Typography</h1>
				<p>
					Every base-layer element, styled by <code>base.css</code> and the token layer
					alone. The scale <strong>ships fixed</strong>: with the collapsed anchors, no
					size tracks the viewport — resizing the browser does not move this page, and
					that is correct for app UI. Fluid type is an opt-in for content sites.
				</p>
			</hgroup>

			<DocSection id="headings" title="Headings">
				<h1>Heading level one (step +3)</h1>
				<h2>Heading level two (step +2)</h2>
				<h3>Heading level three (step +1)</h3>
				<h4>Heading level four (step 0)</h4>
				<h5>Heading level five (step 0)</h5>
				<h6>Heading level six (step 0)</h6>
				<header class="p-demo-header">
					<h2>An h2 inside a &lt;header&gt; demotes to h3 scale</h2>
				</header>
			</DocSection>

			<DocSection id="body" title="Body & links">
				<p>
					Body copy sits at a fixed 15px with multiplicative 1.5 leading, a touch below
					the 16px spacing grid so chrome reads app-grade while text stays comfortable.
					Here is a <a href="#body">link with the weight floor</a> — focus it to see the
					double underline instead of a box outline. <strong>Strong text</strong> takes
					the strong weight, and <em>emphasis stays italic</em>.
				</p>
				<blockquote>
					A blockquote is a padded text box: box-style padding, a border accent, muted
					color with the weight floor, and text-box trim so the perimeter reads uniform.
				</blockquote>
			</DocSection>

			<DocSection id="code" title="Code">
				<p>
					Inline <code>code</code> sits on tinted paper — <code>--v-muted</code> mixed 8%
					into the background. Blocks are terminal-context:
				</p>
				<pre>{`.o-box {
  padding: var(--v-pad-block) var(--v-pad-inline);
  border-radius: var(--o-box__radius, var(--v-radius-min));
}`}</pre>
			</DocSection>

			<DocSection id="lists" title="Lists">
				<ul>
					<li>Unordered lists indent by 1em — em-relative, so nesting compounds.</li>
					<li>
						Items space at <code>--v-list-rhythm</code> (grouped by default).
						<ul>
							<li>Nested level two</li>
							<li>
								Marker cycling (disc → circle → square) arrives with{' '}
								<code>o-prose</code>.
							</li>
						</ul>
					</li>
					<li>A third top-level item.</li>
				</ul>
				<ol>
					<li>Ordered lists share the same base indent.</li>
					<li>
						Custom hanging counters arrive with <code>o-prose</code>.
					</li>
				</ol>
			</DocSection>

			<DocSection id="tables" title="Tables">
				<table>
					<thead>
						<tr>
							<th>Token</th>
							<th>Step</th>
							<th>Resolved (default config)</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>caption / code</td>
							<td>−1</td>
							<td>
								13px (12.5px floored up — legibility wins at the bottom of the ramp)
							</td>
						</tr>
						<tr>
							<td>body</td>
							<td>0</td>
							<td>15px / 22.5px line</td>
						</tr>
						<tr>
							<td>h3</td>
							<td>+1</td>
							<td>18px / 26px line (effective ratio 1.44)</td>
						</tr>
						<tr>
							<td>h2</td>
							<td>+2</td>
							<td>~21.6px / ~29.6px line (1.37)</td>
						</tr>
						<tr>
							<td>h1</td>
							<td>+3</td>
							<td>~25.9px / ~33.9px line (1.31)</td>
						</tr>
					</tbody>
				</table>
			</DocSection>

			<DocSection id="forms" title="Form defaults">
				<p>
					Bare form elements before the component layer — fonts inherit, chrome arrives
					with <code>c-input</code> / <code>c-button</code>:
				</p>
				<div class="p-form-sample">
					<label for="ty-sample-input">A label at the label weight</label>
					<input id="ty-sample-input" type="text" placeholder="Placeholder at 50% ink" />
					<button type="button">A bare button</button>
				</div>
			</DocSection>

			<DocSection id="scale" title="The scale is fluid-capable, fixed by default">
				<p>
					Underneath, every token is a Utopia-style <code>clamp()</code> between the
					viewport anchors. The shipped anchors are collapsed (
					<code>--v-font-size-min == --v-font-size-max</code>), so each clamp degrades to
					a constant. Spreading the anchors (and ratios) opts a scope into true fluid
					interpolation — the recommended configuration for marketing/content sites. The
					width-draggable fluid demo arrives with the interactive layer (Phase 9); the
					ramp above is the fixed default and stays put at every viewport.
				</p>
			</DocSection>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <TypographyPage />);
}
