import { CompositionLayout } from '../layout';
import { renderPage } from '../render';

/**
 * Composition › Tools (§20.2.3) — one row per t-* tool with a one-line
 * description and a before/after render. Completes the Composition section.
 */

interface Tool {
	name: string;
	desc: string;
}

const GROUPS: { title: string; tools: Tool[] }[] = [
	{
		title: 'Padding',
		tools: [
			{ name: 't-p / t-px / t-py', desc: 'Apply --v-spacing padding (all / inline / block).' },
			{ name: 't-p-0 / t-px-0 / t-py-0', desc: 'Zero out padding.' },
		],
	},
	{
		title: 'Flex & display',
		tools: [
			{ name: 't-flex', desc: 'display: flex.' },
			{ name: 't-flex-fill / -auto / -none', desc: 'Flex grow/shrink presets.' },
			{ name: 't-flex-wrap', desc: 'flex-wrap: wrap.' },
			{ name: 't-block / t-inline / t-inline-block', desc: 'Display modes.' },
			{ name: 't-hidden', desc: 'display: none.' },
			{ name: 't-sr-only', desc: 'Visually hidden, screen-reader only.' },
		],
	},
	{
		title: 'Border / radius / shadow',
		tools: [
			{ name: 't-border / t-border-none / t-border-inner', desc: 'Border toggles.' },
			{ name: 't-radius-none / t-radius-full', desc: 'Radius overrides.' },
			{ name: 't-shadow / -inner / -outer / -none', desc: 'Shadow toggles.' },
		],
	},
	{
		title: 'Alignment (two separate trios)',
		tools: [
			{ name: 't-align-start / -center / -end', desc: 'Box alignment (align-items).' },
			{ name: 't-text-start / -center / -end', desc: 'Text alignment (text-align).' },
			{ name: 't-col-span-full', desc: 'Grid item spans all columns.' },
		],
	},
	{
		title: 'Overflow',
		tools: [{ name: 't-truncate', desc: 'Single-line ellipsis (overflow-x: clip).' }],
	},
];

function Tools() {
	return (
		<CompositionLayout current="tools" title="Tools">
			<div class="o-prose p-doc-section">
				<p>
					The tools layer is intentionally narrow (§11): every tool either zeros out a
					knob-derived value or toggles a layout flag. No arbitrary scale utilities.
				</p>
			</div>

			{GROUPS.map((group) => (
				<section class="p-doc-section">
					<h2>{group.title}</h2>
					<table class="p-doc-table">
						<thead>
							<tr>
								<th>Tool</th>
								<th>Effect</th>
							</tr>
						</thead>
						<tbody>
							{group.tools.map((t) => (
								<tr>
									<td>
										<code>{t.name}</code>
									</td>
									<td>{t.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			))}

			<section class="p-doc-section" id="truncate-demo">
				<h2>t-truncate before / after</h2>
				<div class="p-doc-demo">
					<div class="o-stack">
						<div class="o-box p-demo-outline" style={{ 'max-inline-size': '14rem' }}>
							<span>Without truncate: this is a very long line that wraps normally.</span>
						</div>
						<div class="o-box p-demo-outline" style={{ 'max-inline-size': '14rem' }}>
							<span class="t-truncate" data-testid="truncate">
								With truncate: this is a very long line that ellipsizes instead of wrapping.
							</span>
						</div>
					</div>
				</div>
			</section>
		</CompositionLayout>
	);
}

export function render() {
	return renderPage(() => <Tools />);
}
