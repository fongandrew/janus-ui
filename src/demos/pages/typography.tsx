import { type JSX } from 'solid-js';

export function TypographyPage(): JSX.Element {
	return (
		<div class="o-stack">
			<h1>Typography</h1>

			<section class="o-stack">
				<h2>Headings</h2>
				<h1>Heading 1</h1>
				<h2>Heading 2</h2>
				<h3>Heading 3</h3>
				<h4>Heading 4</h4>
				<h5>Heading 5</h5>
				<h6>Heading 6</h6>
			</section>

			<section class="o-stack">
				<h2>Prose</h2>
				<p>
					Body text at the default font size. The system uses fluid type scaling derived
					from a single root token. Paragraphs flow naturally with consistent line
					height. <a href="#">Links are styled</a> with the accent color and
					underline offset.
				</p>
				<p>
					<strong>Strong text</strong> uses the title weight. <em>Emphasized text</em>{' '}
					uses italic. <code>Inline code</code> renders on a tinted surface.
				</p>
			</section>

			<section class="o-stack">
				<h2>Lists</h2>
				<ul>
					<li>Unordered list item one</li>
					<li>Unordered list item two</li>
					<li>
						Nested list
						<ul>
							<li>Nested item</li>
						</ul>
					</li>
				</ul>
				<ol>
					<li>Ordered list item one</li>
					<li>Ordered list item two</li>
					<li>Ordered list item three</li>
				</ol>
			</section>

			<section class="o-stack">
				<h2>Code</h2>
				<pre><code>{`function hello(name: string) {
  return \`Hello, \${name}!\`;
}`}</code></pre>
			</section>

			<section class="o-stack">
				<h2>Table</h2>
				<table>
					<thead>
						<tr>
							<th>Token</th>
							<th>Default</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>--v-font-size</code></td>
							<td>1rem</td>
							<td>Base font size</td>
						</tr>
						<tr>
							<td><code>--v-line-height</code></td>
							<td>1.5</td>
							<td>Base line height</td>
						</tr>
						<tr>
							<td><code>--v-font-family</code></td>
							<td>system-ui</td>
							<td>Primary font stack</td>
						</tr>
					</tbody>
				</table>
			</section>
		</div>
	);
}
