import { For, type JSX } from 'solid-js';

import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

interface ToolRow {
	name: string;
	description: string;
	render: () => JSX.Element;
}

function Box(props: {
	class?: string;
	id?: string;
	children?: JSX.Element;
	style?: JSX.CSSProperties;
}) {
	return (
		<div class={`p-tool-box ${props.class ?? ''}`} id={props.id} style={props.style}>
			{props.children ?? 'box'}
		</div>
	);
}

const LONG_TEXT = 'A long unbroken line of text that will not fit inside a narrow box at all';

const TOOLS: ToolRow[] = [
	{
		name: 't-p-0 / t-px-0 / t-py-0',
		description: 'Zero out padding (all / inline / block) on a padded object.',
		render: () => (
			<>
				<div class="o-box p-outline">o-box</div>
				<div class="o-box t-p-0 p-outline" id="tool-t-p-0">
					o-box t-p-0
				</div>
			</>
		),
	},
	{
		name: 't-p / t-px / t-py',
		description: 'Apply --v-spacing padding (all / inline / block).',
		render: () => (
			<>
				<Box>bare</Box>
				<Box class="t-p">t-p</Box>
			</>
		),
	},
	{
		name: 't-flex / t-flex-fill / t-flex-auto / t-flex-none / t-flex-wrap',
		description: 'Flex display and item sizing flags.',
		render: () => (
			<div class="t-flex" style={{ gap: '0.5rem', 'inline-size': '100%' }}>
				<Box class="t-flex-none">none</Box>
				<Box class="t-flex-fill">fill</Box>
				<Box class="t-flex-none">none</Box>
			</div>
		),
	},
	{
		name: 't-block / t-inline / t-inline-block / t-hidden',
		description: 'Display overrides. t-hidden removes the element from layout.',
		render: () => (
			<>
				<Box>visible</Box>
				<Box class="t-hidden" id="tool-t-hidden-box">
					hidden
				</Box>
				<Box>next</Box>
			</>
		),
	},
	{
		name: 't-sr-only',
		description: 'Visually hidden, still read by screen readers.',
		render: () => (
			<p>
				Label with hidden context
				<span class="t-sr-only" id="tool-t-sr-only-span">
					{' '}
					(screen readers hear this)
				</span>
				.
			</p>
		),
	},
	{
		name: 't-border / t-border-none / t-border-inner',
		description: 'Border toggles; t-border-inner draws dividers between children.',
		render: () => (
			<>
				<Box class="t-border">t-border</Box>
				<div class="t-border t-border-inner" style={{ 'inline-size': '10rem' }}>
					<Box>row</Box>
					<Box>row</Box>
				</div>
			</>
		),
	},
	{
		name: 't-radius-none / t-radius-full',
		description: "Per-element override of the object's radius knob (§8).",
		render: () => (
			<>
				<div class="o-box p-outline t-radius-none" id="tool-t-radius-none-box">
					none
				</div>
				<div class="o-box p-outline t-radius-full" id="tool-t-radius-full-box">
					full
				</div>
			</>
		),
	},
	{
		name: 't-shadow / t-shadow-outer / t-shadow-inner / t-shadow-none',
		description: 'Shadow toggles — the split outer/inner knobs compose independently.',
		render: () => (
			<>
				<Box class="t-shadow-outer">outer</Box>
				<Box class="t-shadow-inner">inner</Box>
				<Box class="t-shadow">both</Box>
			</>
		),
	},
	{
		name: 't-align-start / t-align-center / t-align-end',
		description: 'BOX alignment: where flex/grid children sit on the cross axis.',
		render: () => (
			<div class="t-flex t-align-center" style={{ gap: '0.5rem', 'block-size': '4rem' }}>
				<Box>a</Box>
				<Box style={{ 'block-size': '3.5rem' }}>tall</Box>
				<Box>c</Box>
			</div>
		),
	},
	{
		name: 't-text-start / t-text-center / t-text-end',
		description:
			'TEXT alignment: where inline boxes justify — a separate question from box alignment; one element can carry one of each.',
		render: () => (
			<div style={{ 'inline-size': '100%' }}>
				<Box class="t-text-center" style={{ 'inline-size': '100%' }}>
					centered text
				</Box>
			</div>
		),
	},
	{
		name: 't-col-span-full',
		description: 'A grid item spans all columns — a layout flag, not a numeric scale.',
		render: () => (
			<div
				class="o-grid"
				id="tool-t-col-span-grid"
				style={{ '--o-grid__min': '5rem', 'inline-size': '100%' }}
			>
				<Box>cell</Box>
				<Box>cell</Box>
				<Box class="t-col-span-full" id="tool-t-col-span-item">
					t-col-span-full
				</Box>
			</div>
		),
	},
	{
		name: 't-truncate',
		description:
			'Single-line ellipsis via overflow-x: clip — no scroll container, overflow-y stays visible. Truncation is opt-in; there is no t-wrap.',
		render: () => (
			<>
				<Box style={{ 'inline-size': '11rem' }}>{LONG_TEXT}</Box>
				<Box style={{ 'inline-size': '11rem' }}>
					<span class="t-truncate t-block" id="tool-t-truncate-span">
						{LONG_TEXT}
					</span>
				</Box>
			</>
		),
	},
	{
		name: 't-line-clamp',
		description: 'Multi-line clamp (default 2 lines via --t-line-clamp) — a separate tool.',
		render: () => (
			<Box style={{ 'inline-size': '11rem' }}>
				<span class="t-line-clamp">
					{LONG_TEXT} {LONG_TEXT}
				</span>
			</Box>
		),
	},
];

function ToolsPage() {
	return (
		<CompositionLayout current="tools">
			<hgroup>
				<h1>Tools</h1>
				<p>
					The escape-hatch layer, deliberately narrow (§11): every tool either zeros a
					knob-derived value or toggles a layout flag. No arbitrary scale utilities — if
					you want <code>t-px-2</code>, you're fighting the framework.
				</p>
			</hgroup>
			<For each={TOOLS}>
				{(tool) => (
					<section class="p-doc-section p-tool-row">
						<h2 class="p-tool-row__name">
							<code>{tool.name}</code>
						</h2>
						<p class="p-tool-row__desc">{tool.description}</p>
						<div class="p-tool-row__render o-row">{tool.render()}</div>
					</section>
				)}
			</For>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <ToolsPage />);
}
