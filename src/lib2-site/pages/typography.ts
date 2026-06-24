/*
 * Composition → Typography (§20.2.4).
 *
 * Exercises every base-layer element so a reviewer can confirm reset.css and
 * base.css apply correctly: headings h1–h6, paragraphs, links (including the
 * :focus double-underline), inline <code>, <pre> blocks, a <table>, and form
 * defaults. Framework-free.
 */
import { compositionPage, sectionCard } from '~/lib2-site/shell';

function headingsSection(): string {
	const body = `
		<header><h2>Section header (demoted inside &lt;header&gt;)</h2></header>
		<h1>Heading 1 — page title</h1>
		<h2>Heading 2 — section</h2>
		<h3>Heading 3 — card / sub-section</h3>
		<h4>Heading 4</h4>
		<h5>Heading 5</h5>
		<h6>Heading 6</h6>
		<p>
			A paragraph of body text demonstrating the resolved fluid base size and the
			<code>--v-line-height</code> leading. Resize the viewport to watch the type
			scale interpolate between its anchors — headings spread further apart on
			wide screens (the dual-ratio Utopia behavior).
		</p>
		<p>
			Inline elements: a <a href="#typography">link</a> (tab to it for the
			double-underline focus treatment), <strong>strong</strong> and <b>bold</b>
			text, <em>emphasis</em>, and inline <code>code</code> on tinted paper.
		</p>`;
	return sectionCard('Headings & prose', body, 'headings');
}

function codeSection(): string {
	const body = `
		<p>Block code renders on an always-dark terminal surface, even in light mode:</p>
		<pre><code>.c-button {
	padding: var(--o-input-box__pad-block) var(--o-input-box__pad-inline);
	border-radius: var(--o-input-box__radius, var(--v-radius-min));
}</code></pre>`;
	return sectionCard('Code', body, 'code');
}

function tableSection(): string {
	const body = `
		<table>
			<thead><tr><th>Token</th><th>Step</th><th>Role</th></tr></thead>
			<tbody>
				<tr><td><code>--v-font-size-h1</code></td><td>+3</td><td>Page title</td></tr>
				<tr><td><code>--v-font-size-h3</code></td><td>+1</td><td>Card heading</td></tr>
				<tr><td><code>--v-font-size</code></td><td>0</td><td>Body</td></tr>
				<tr><td><code>--v-font-size-caption</code></td><td>−1</td><td>Caption / badge</td></tr>
			</tbody>
		</table>`;
	return sectionCard('Table', body, 'table');
}

function formSection(): string {
	const body = `
		<p>Unstyled form defaults (component chrome lands in Phase 3):</p>
		<div class="o-group">
			<input type="text" placeholder="Text input" aria-label="Text input" />
			<button type="button">Button</button>
			<select aria-label="Select"><option>Option</option></select>
		</div>`;
	return sectionCard('Form defaults', body, 'forms');
}

export function render(): string {
	const main = `
		<h1>Typography</h1>
		<p class="c-home__lede">
			The visual proof that <code>reset.css</code> and <code>base.css</code> apply
			correctly across every text-bearing element.
		</p>
		${headingsSection()}
		${codeSection()}
		${tableSection()}
		${formSection()}`;
	return compositionPage('typography', main);
}
