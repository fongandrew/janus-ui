/*
	Typography sub-page (§20.2.4) — the visual proof that reset.css + base.css apply
	correctly. It exercises every base-layer element: headings h1–h6, paragraphs,
	links (including the :focus double-underline), <code>, <pre>, a <table>, lists,
	blockquotes, and native form defaults. Framework-free; zero JS.

	The scale ships FIXED by default (§5.4): with the collapsed anchors every level is
	a constant size that does NOT track the viewport — resizing the browser does not
	move it, and that is correct. The fluid opt-in (a width-draggable frame) is a
	Phase 9 enhancement layered on top.
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

export function render(): string {
	return renderPage({
		section: 'composition',
		composition: 'typography',
		main: `
		<div class="o-stack">
			<header class="o-prose">
				<h1>Typography</h1>
				<p>
					The base-layer type system rendered on real elements. The scale ships
					<strong>fixed by default</strong> — with the collapsed size anchors every
					level is a constant size that does not track the viewport. The Utopia
					mechanism underneath is fluid-capable, but fluidity is an opt-in.
				</p>
			</header>

			<section class="o-box p-card" id="headings">
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

			<section class="o-box p-card" id="prose">
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

			<section class="o-box p-card" id="lists">
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
					<li>Ordered item</li>
				</ol>
			</section>

			<section class="o-box p-card" id="code">
				<h2>Code block</h2>
				<pre><code>:root {
  --v-font-size: clamp(/* min */, /* fluid */, /* max */);
  --v-spacing: 1rem;
}</code></pre>
			</section>

			<section class="o-box p-card" id="table">
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

			<section class="o-box p-card" id="forms">
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

			<section class="o-box p-card" id="ramp">
				<h2>Resolved scale (default fixed config)</h2>
				${rampTable()}
			</section>
		</div>`,
	});
}
