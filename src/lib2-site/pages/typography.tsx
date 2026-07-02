import { CompositionLayout } from '../layout';
import { renderPage } from '../render';

/**
 * Composition › Typography (§20.2.4) — exercises every base-layer element so a
 * reviewer can confirm reset + base.css apply correctly: headings h1–h6,
 * paragraphs, links (incl. :focus double-underline), inline code, a code block,
 * a table, blockquote, lists, and form defaults. The fluid-type draggable
 * preview frame is a Phase 9 enhancement.
 */
function Typography() {
	return (
		<CompositionLayout current="typography" title="Typography">
			<div class="o-prose p-doc-section">
				<p>
					Everything below is styled by <code>base.css</code> and the reset — no component
					classes. Headings step down in size; body sits at a fixed 15px; leading is{' '}
					<em>additive</em> so inter-line space stays constant across sizes.
				</p>
			</div>

			<section class="p-doc-section" id="headings">
				<h1>Heading level 1</h1>
				<h2>Heading level 2</h2>
				<h3>Heading level 3</h3>
				<h4>Heading level 4</h4>
				<h5>Heading level 5</h5>
				<h6>Heading level 6</h6>
			</section>

			<section class="p-doc-section" id="prose">
				<div class="o-prose">
					<p>
						A paragraph of running text with a <a href="#prose">standard link</a> and some{' '}
						<strong>strong emphasis</strong>, <em>italic emphasis</em>, and inline{' '}
						<code>const code = true</code>. Focus the link with the keyboard to see the
						double-underline focus treatment.
					</p>
					<p>
						A second paragraph, to show the boundary-owned paragraph rhythm. Text wraps
						normally — truncation is opt-in, never a base default.
					</p>
					<ul>
						<li>First unordered item</li>
						<li>
							Second item with a nested list
							<ul>
								<li>Nested item (indent compounds per level)</li>
							</ul>
						</li>
					</ul>
					<ol>
						<li>First ordered item</li>
						<li>Second ordered item</li>
					</ol>
					<blockquote>
						A blockquote callout — a self-padded text box with a leading rule.
					</blockquote>
				</div>
			</section>

			<section class="p-doc-section" id="code">
				<pre>
					<code>{`function greet(name) {\n\treturn \`Hello, \${name}!\`;\n}`}</code>
				</pre>
			</section>

			<section class="p-doc-section" id="table">
				<table>
					<thead>
						<tr>
							<th>Token</th>
							<th>Role</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>--v-font-size</td>
							<td>Body</td>
						</tr>
						<tr>
							<td>--v-font-size-h1</td>
							<td>Page title</td>
						</tr>
					</tbody>
				</table>
			</section>

			<section class="p-doc-section" id="forms">
				<div class="o-stack">
					<label for="demo-input">A native input (form defaults)</label>
					<input id="demo-input" type="text" placeholder="Placeholder text" />
					<label for="demo-select">A native select</label>
					<select id="demo-select">
						<option>Option one</option>
						<option>Option two</option>
					</select>
				</div>
			</section>
		</CompositionLayout>
	);
}

export function render() {
	return renderPage(() => <Typography />);
}
