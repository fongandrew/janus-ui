/*
	Typography sub-page (§20.2.4) — the visual proof that reset.css + base.css apply
	correctly. It exercises every base-layer element: headings h1–h6, paragraphs,
	links (including the :focus double-underline), <code>, <pre>, a <table>, lists,
	blockquotes, and native form defaults. Framework-free; zero JS.

	The scale ships FIXED by default (§5.4): with the collapsed anchors every level is
	a constant size that does NOT track the viewport — resizing the browser does not
	move it, and that is correct. The closing section demos BOTH configs side by side:
	"Default fixed" (the shipped config) and "Sliding scale" (the same clamp() engine
	with the anchors/ratios spread back out via .p-fluid-demo + the library's
	.v-font-fluid, scoped to that one section) — resize the browser window and only the
	second one moves. A width-draggable demo frame (so it doesn't require resizing the
	whole window) is a Phase 9 enhancement layered on top.
*/
import { renderPage } from '~/v2-site/layout';

function rampTable(): string {
	const rows = [
		['caption / code', '−1', '13px (12.5px floored up)', '21px', '1.62'],
		['body', '0', '15px', '22.5px', '1.50'],
		['h3', '+1', '18px', '26px', '1.44'],
		['h2', '+2', '~21.6px', '~29.6px', '1.37'],
		['h1', '+3', '~25.9px', '~33.9px', '1.31'],
	]
		.map(
			([role, step, size, lh, ratio]) =>
				`<tr><td>${role}</td><td>${step}</td><td>${size}</td><td>${lh}</td><td>${ratio}</td></tr>`,
		)
		.join('');

	return `
	<table>
		<thead>
			<tr><th>Role</th><th>Step</th><th>Font size (fixed)</th><th>Line height</th><th>Effective ratio</th></tr>
		</thead>
		<tbody>${rows}</tbody>
	</table>`;
}

/** Endpoints of the .p-fluid-demo anchors (0.875rem/1.125rem, ratio 1.125/1.333) at the
 *  shared viewport anchors (20rem / 80rem) — hand-computed for reference; the live
 *  elements above resolve the same clamp() formula against the real viewport. */
function rampTableFluid(): string {
	const rows = [
		['caption / code', '−1', '13px (floored up)', '13.5px'],
		['body', '0', '14px', '18px'],
		['h3', '+1', '15.75px', '24px'],
		['h2', '+2', '~17.7px', '~32px'],
		['h1', '+3', '~19.9px', '~42.6px'],
	]
		.map(
			([role, step, lo, hi]) =>
				`<tr><td>${role}</td><td>${step}</td><td>${lo}</td><td>${hi}</td></tr>`,
		)
		.join('');

	return `
	<table>
		<thead>
			<tr><th>Role</th><th>Step</th><th>@ 20rem (320px)</th><th>@ 80rem (1280px)</th></tr>
		</thead>
		<tbody>${rows}</tbody>
	</table>`;
}

export function render(): string {
	return renderPage({
		section: 'composition',
		composition: 'typography',
		main: `
		<div class="o-container o-stack">
			<header class="o-prose">
				<h1>Typography</h1>
				<p>
					The base-layer type system rendered on real elements. The scale ships
					<strong>fixed by default</strong> — with the collapsed size anchors every
					level is a constant size that does not track the viewport. The mechanism
					underneath is fluid-capable, but fluidity is an opt-in.
				</p>
			</header>

			<section class="p-card" id="headings">
				<h2>Headings</h2>
				<h1>Heading level 1</h1>
				<h2>Heading level 2</h2>
				<h3>Heading level 3</h3>
				<h4>Heading level 4</h4>
				<h5>Heading level 5</h5>
				<h6>Heading level 6</h6>
				<header>
					<h2>Heading inside &lt;header&gt; (demoted one step)</h2>
				</header>
			</section>

			<section class="p-card" id="prose">
				<h2>Body &amp; links</h2>
				<p>
					Body text sits at a fixed 15px on the 16px spacing grid. It wraps normally —
					truncation is opt-in, never a base default. Here is an
					<a href="#prose">inline link</a> (tab to it to see the double-underline
					focus treatment instead of a box outline), some <strong>strong text</strong>,
					and <code>inline code</code> on a tinted paper surface.
				</p>
				<blockquote>
					A blockquote is a padded text box; its block padding reads optically uniform
					thanks to text-box trimming.
				</blockquote>
			</section>

			<section class="p-card" id="lists">
				<h2>Lists</h2>
				<ul>
					<li>Unordered item</li>
					<li>
						Nested list (indent compounds per level via the em unit)
						<ul>
							<li>Deeper item</li>
							<li>Deeper item</li>
						</ul>
					</li>
				</ul>
				<ol>
					<li>Ordered item</li>
					<li>
						Ordered item with nested levels
						<ol>
							<li>Second-level item</li>
							<li>
								Second-level item
								<ol>
									<li>Third-level item</li>
								</ol>
							</li>
						</ol>
					</li>
				</ol>
			</section>

			<section class="p-card" id="code">
				<h2>Code block</h2>
				<pre><code>:root {
  --v-font-size: clamp(/* min */, /* fluid */, /* max */);
  --v-spacing: 1rem;
}</code></pre>
			</section>

			<section class="p-card" id="table">
				<h2>Table</h2>
				<table>
					<thead>
						<tr><th>Token</th><th>Default</th></tr>
					</thead>
					<tbody>
						<tr><td>--v-spacing</td><td>1rem</td></tr>
						<tr><td>--v-radius</td><td>2.375rem</td></tr>
						<tr><td>--v-font-size</td><td>15px (fixed)</td></tr>
					</tbody>
				</table>
			</section>

			<section class="p-card" id="forms">
				<h2>Form defaults</h2>
				<p><input type="text" placeholder="Text input" /></p>
				<p><input type="email" placeholder="you@example.com" /></p>
				<p><textarea placeholder="Textarea"></textarea></p>
				<p>
					<select>
						<option>Option one</option>
						<option>Option two</option>
					</select>
				</p>
			</section>

			<section class="p-card" id="ramp-fixed">
				<h2>Default fixed</h2>
				<p>
					The shipped config: <code>--v-font-size-min</code> and
					<code>--v-font-size-max</code> collapse to one value, so every step below is
					a constant — resize the window and nothing here moves.
				</p>
				${rampTable()}
			</section>

			<section class="p-card v-font-fluid p-fluid-demo" id="ramp-fluid">
				<h2>Sliding scale</h2>
				<p>
					Same engine, anchors spread back out
					(<code>--v-font-size-min: 0.875rem</code> →
					<code>--v-font-size-max: 1.125rem</code>, ratio <code>1.125</code> →
					<code>1.333</code>), scoped to this section only via <code>.v-font-fluid</code>.
					Resize the browser window — every size below tracks it live between a
					<code>20rem</code> and <code>80rem</code> viewport.
				</p>
				<h1>Heading 1</h1>
				<h2>Heading 2</h2>
				<h3>Heading 3</h3>
				<p>Body text at the resolved base size.</p>
				<p style="font-size: var(--v-font-size-caption)">Caption-size text.</p>
				${rampTableFluid()}
			</section>
		</div>`,
	});
}
