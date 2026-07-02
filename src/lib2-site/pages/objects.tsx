import { For, type JSX } from 'solid-js';

import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

/**
 * Demo card frame for one object: title, knob list, live render, and the
 * markup snippet that produced it. Site chrome — p- classes only.
 */
function ObjectCard(props: {
	id: string;
	title: string;
	knobs?: string[];
	snippet?: string;
	description: JSX.Element;
	children: JSX.Element;
}) {
	return (
		<section id={props.id} class="p-doc-section p-object-card">
			<h2>{props.title}</h2>
			<p class="p-object-card__desc">{props.description}</p>
			<div class="p-object-card__render">{props.children}</div>
			{props.knobs?.length ? (
				<p class="p-object-card__knobs">
					Knobs:{' '}
					<For each={props.knobs}>
						{(knob, i) => (
							<>
								{i() > 0 ? ', ' : ''}
								<code>{knob}</code>
							</>
						)}
					</For>
				</p>
			) : null}
			{props.snippet ? <pre class="p-object-card__snippet">{props.snippet}</pre> : null}
		</section>
	);
}

/** Neutral placeholder block so structure, not chrome, is the focus. */
function Block(props: { children?: JSX.Element; style?: JSX.CSSProperties }) {
	return (
		<div class="p-ph-block" style={props.style}>
			{props.children ?? 'item'}
		</div>
	);
}

const TOC = [
	{ href: '#o-box', label: 'o-box' },
	{ href: '#nesting', label: 'Nesting & radius' },
	{ href: '#o-input-box', label: 'o-input-box' },
	{ href: '#o-square', label: 'o-square' },
	{ href: '#o-stack', label: 'o-stack' },
	{ href: '#o-group', label: 'o-group / o-row' },
	{ href: '#o-grid', label: 'o-grid' },
	{ href: '#o-container', label: 'o-container' },
	{ href: '#o-split', label: 'o-split' },
	{ href: '#o-centric', label: 'o-centric' },
	{ href: '#o-bar', label: 'o-bar' },
	{ href: '#o-segmented', label: 'o-segmented' },
	{ href: '#o-prose', label: 'o-prose' },
	{ href: '#insets', label: 'Inline insets' },
	{ href: '#o-caption', label: 'o-caption / o-code' },
	{ href: '#o-menu', label: 'o-menu' },
];

/*
 * The radius knobs are frozen at :root (§5.2), so a SCOPED radius demo must
 * re-declare the anchor bundle, exactly like a scoped spacing change.
 */
const FLAT_RADIUS_BUNDLE = {
	'--v-radius': '0.5rem',
	'--v-radius-min': '0.5rem',
	'--o-dialog__radius':
		'max(var(--v-radius-min), calc(var(--v-radius) - var(--o-dialog__offset)))',
	'--o-box__radius': 'max(var(--v-radius-min), calc(var(--v-radius) - var(--v-pad-inline)))',
	'--o-input-box__radius':
		'max(var(--v-radius-min), calc(var(--v-radius) - var(--v-pad-inline)))',
};

function NestingDemo(props: { idPrefix: string }) {
	return (
		<div class="o-dialog p-nest-dialog" id={`${props.idPrefix}-dialog`}>
			<div class="o-box p-nest-box" id={`${props.idPrefix}-box`}>
				<button type="button" class="o-input-box" id={`${props.idPrefix}-input`}>
					control in box
				</button>
				<div class="o-box p-nest-box" id={`${props.idPrefix}-box-inner`}>
					<button type="button" class="o-input-box" id={`${props.idPrefix}-input-inner`}>
						control in nested box
					</button>
					<div class="o-box p-nest-box" id={`${props.idPrefix}-box-third`}>
						third-level box
					</div>
				</div>
			</div>
		</div>
	);
}

function ObjectsPage() {
	return (
		<CompositionLayout current="objects" toc={TOC}>
			<hgroup>
				<h1>Objects</h1>
				<p>
					The <code>o-*</code> structural primitives: spacing, sizing, layout, radius — no
					chrome. Composition happens in markup: an element carries every class it
					composes.
				</p>
			</hgroup>

			<ObjectCard
				id="o-box"
				title="o-box"
				knobs={['--o-box__pad-block', '--o-box__pad-inline', '--o-box__radius']}
				snippet={`<div class="o-box">…</div>`}
				description={
					<>
						<strong>The</strong> padded container. Uniform block padding (text-box trim
						makes it read optically uniform); inline padding floors at the box's own
						corner radius. Prose goes in an <code>o-prose</code> child — there is no
						separate text box.
					</>
				}
			>
				<div class="o-box p-outline" id="box-basic">
					<div class="o-prose">
						<p>A paragraph inside o-box + o-prose. The box owns the perimeter.</p>
					</div>
				</div>
			</ObjectCard>

			<ObjectCard
				id="nesting"
				title="Nesting & the radius cascade"
				knobs={['--v-radius', '--v-radius-min', '--o-box__radius-inner']}
				snippet={`<div class="o-dialog">\n  <div class="o-box">\n    <button class="o-input-box">…</button>\n    <div class="o-box">…</div>\n  </div>\n</div>`}
				description={
					<>
						Radius tracks <em>depth, not element type</em>: each level steps inward from
						the frame by the pad between it and its parent, flooring at{' '}
						<code>--v-radius-min</code> — never sharp. Defaults annotate as 40px frame →
						28px dialog → 8px box → 6px control/nested box. Right: a scoped{' '}
						<em>flat</em> bundle (<code>min == max</code>) pins every corner to 8px.
					</>
				}
			>
				<div class="p-nest-pair">
					<div>
						<p class="p-token-render__label">Stepped (default: 2.5rem / 0.375rem)</p>
						<NestingDemo idPrefix="nest" />
					</div>
					<div style={FLAT_RADIUS_BUNDLE}>
						<p class="p-token-render__label">Flat (0.5rem / 0.5rem)</p>
						<NestingDemo idPrefix="nest-flat" />
					</div>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-input-box"
				title="o-input-box"
				knobs={['--o-input-box__radius', '--v-input-height', '--v-control-inset']}
				snippet={`<button class="o-input-box">…</button>\n<input class="o-input-box" />\n<textarea class="o-input-box"></textarea>`}
				description={
					<>
						Shared base for text-bearing leaf controls. One line centers via height math
						— deliberately not trim-dependent, so controls may be flex containers.
						Buttons pad roomier (<code>--v-spacing</code>) than inputs (
						<code>--v-control-inset</code>).
					</>
				}
			>
				<div class="o-row">
					<button type="button" class="o-input-box p-outline-strong" id="inputbox-button">
						button
					</button>
					<input class="o-input-box p-outline-strong" id="inputbox-input" value="input" />
					<textarea class="o-input-box p-outline-strong" id="inputbox-textarea">
						textarea
					</textarea>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-square"
				title="o-square"
				snippet={`<span class="o-square">◎</span>\n<span class="o-square" style="--v-radius: 50%">●</span>`}
				description={
					<>
						1:1 content — icons, avatars, dots. Reads <code>--v-radius</code> directly;{' '}
						<code>--v-radius: 50%</code> makes it a circle.
					</>
				}
			>
				<div class="o-row">
					<span class="o-square p-outline-strong" style={{ 'inline-size': '3rem' }}>
						◎
					</span>
					<span
						class="o-square p-outline-strong"
						style={{ 'inline-size': '3rem', '--v-radius': '50%' }}
					>
						●
					</span>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-stack"
				title="o-stack"
				knobs={['--o-stack__gap']}
				snippet={`<div class="o-stack">…</div>`}
				description={
					<>
						Vertical flow with a consistent gap. One object, several roles — section
						stack sets <code>--o-stack__gap: var(--v-gap-section)</code>, a card sets{' '}
						<code>var(--v-pad-block)</code>, a form field{' '}
						<code>var(--v-gap-tight)</code>.
					</>
				}
			>
				<div class="o-stack p-outline" id="stack-basic">
					<Block>first</Block>
					<Block>second</Block>
					<Block>third</Block>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-group"
				title="o-group / o-row"
				knobs={['--o-group__gap', '--o-row__gap']}
				snippet={`<div class="o-group">…</div>\n<div class="o-row">…</div>`}
				description={
					<>
						Horizontal flow at the cluster scale. <code>o-group</code> wraps;{' '}
						<code>o-row</code> is center-aligned for action rows.
					</>
				}
			>
				<div class="o-group p-outline" id="group-basic">
					<Block>one</Block>
					<Block>two</Block>
					<Block>three</Block>
				</div>
				<div
					class="o-row p-outline"
					id="row-basic"
					style={{ 'margin-block-start': '1rem' }}
				>
					<Block>action</Block>
					<button type="button" class="o-input-box p-outline-strong">
						a control
					</button>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-grid"
				title="o-grid"
				knobs={['--o-grid__min', '--o-grid__gap-block', '--o-grid__gap-inline']}
				snippet={`<div class="o-grid">…</div>\n<div class="o-grid o-grid--fit">…</div>`}
				description={
					<>
						Intrinsic responsive grid — as many columns as <code>--o-grid__min</code>{' '}
						allows, no breakpoints. Gaps default to the section scale (cells are
						section-level peers). <code>--fit</code> collapses empty tracks.
					</>
				}
			>
				<div class="o-grid" id="grid-basic" style={{ '--o-grid__min': '10rem' }}>
					<Block>cell</Block>
					<Block>cell</Block>
					<Block>cell</Block>
					<Block>cell</Block>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-container"
				title="o-container"
				knobs={['--o-container__max', '--o-container__gutter']}
				snippet={`<main class="o-container">\n  <div class="o-box">…</div>\n  <div class="o-prose"><h2>…</h2>…</div>\n</main>`}
				description={
					<>
						The level-2 section region: gutter, optional max width, and the top-level
						section flow — direct children separate by <code>--v-gap-section</code>,
						except a prose section leading with a heading, whose lead-in belongs to the
						heading itself.
					</>
				}
			>
				<div class="o-container p-outline" id="container-flow" style={{ padding: '0' }}>
					<div class="o-box p-outline" id="container-child-1">
						a box section
					</div>
					<div class="o-box p-outline" id="container-child-2">
						another box section (flat section gap above)
					</div>
					<div class="o-prose" id="container-heading-prose">
						<h3 id="container-heading">A heading-led prose section</h3>
						<p>
							The gap above belongs to the heading (its space-above), not to the flow.
						</p>
					</div>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-split"
				title="o-split"
				snippet={`<div class="o-split">\n  <aside>rail</aside>\n  <main>fills</main>\n</div>`}
				description={
					<>
						Two-up layout — fixed rail + filling main — that collapses to stacked when
						its frame is narrower than 48rem. Container query, no media query. (This
						page's own sidebar layout is an <code>o-split</code>.)
					</>
				}
			>
				<div class="o-split p-outline" id="split-basic">
					<Block style={{ 'inline-size': '8rem' }}>rail</Block>
					<Block>main content fills the rest</Block>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-centric"
				title="o-centric"
				knobs={['--o-centric__max']}
				snippet={`<div class="o-centric">…</div>`}
				description={
					<>Centers contents within an optional max width — empty states, heroes.</>
				}
			>
				<div class="o-centric p-outline" style={{ 'min-block-size': '6rem' }}>
					<Block>centered</Block>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-bar"
				title="o-bar"
				knobs={['--o-bar__pad']}
				snippet={`<header class="o-bar">…</header>\n<header class="o-bar o-bar--contains">…</header>\n<header class="o-bar o-bar--input">…</header>`}
				description={
					<>
						Header/toolbar strip with one <em>symmetric</em> padding knob and three
						height modes: text (full pad), contains-input (pad reduced by the control's
						internal half-height, so its <em>text</em> sits <code>--v-spacing</code>{' '}
						from the edge — the too-tall-header fix), and input (flush). Leading cluster
						truncates; trailing cluster never wraps.
					</>
				}
			>
				<div class="o-stack">
					<header class="o-bar p-outline" id="bar-text">
						<div class="o-group">
							<span>Text mode</span>
						</div>
						<div class="o-row">
							<input class="o-input-box p-outline-strong" value="control" />
						</div>
					</header>
					<header class="o-bar o-bar--contains p-outline" id="bar-contains">
						<div class="o-group">
							<span>Contains-input mode</span>
						</div>
						<div class="o-row">
							<input class="o-input-box p-outline-strong" value="control" />
						</div>
					</header>
					<header class="o-bar o-bar--input p-outline" id="bar-input">
						<div class="o-group">
							<span>Input mode</span>
						</div>
						<div class="o-row">
							<input class="o-input-box p-outline-strong" value="control" />
						</div>
					</header>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-segmented"
				title="o-segmented"
				knobs={['--o-segmented__divider']}
				snippet={`<div class="o-segmented">\n  <div>cell</div>\n  <div>cell</div>\n</div>`}
				description={
					<>
						Cells sharing one border under one rounded group — dividers replace gaps;
						only the end cells round their outer corners. The grouped-list /
						settings-group shape that "nested cards" usually reach for.
					</>
				}
			>
				<div class="o-segmented p-outline-strong" id="segmented-basic">
					<div>Font settings</div>
					<div>Color scheme</div>
					<div>Notifications</div>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-prose"
				title="o-prose (+ hgroup)"
				knobs={['--o-prose__gap', '--o-prose__heading-gap', '--v-list-rhythm']}
				snippet={`<div class="o-prose">\n  <hgroup><h3>Title</h3><p>Subtitle</p></hgroup>\n  <p>…</p>\n</div>`}
				description={
					<>
						Running-text flow with boundary-owned rhythm: every gap is a margin on the
						lower element. A bare heading claims its own space above; an{' '}
						<code>hgroup</code> reads as one unit via additive leading and
						outer-edge-only trim. Lists cycle markers per depth; ordered markers hang
						flush.
					</>
				}
			>
				<div class="o-box p-outline">
					<div class="o-prose" id="prose-rhythm">
						<hgroup id="prose-hgroup">
							<h3>An hgroup title</h3>
							<p>Its subtitle hugs the title — one continuous unit.</p>
						</hgroup>
						<p id="prose-p1">
							Body follows at the prose gap. Paragraph rhythm rides the line, not the
							spacing scale, so it stays proportional as type moves.
						</p>
						<h4 id="prose-heading">A bare heading claims its space above</h4>
						<p>And the content after it keeps the ordinary prose gap.</p>
						<ul id="prose-ul">
							<li>Unordered markers cycle by depth: disc…</li>
							<li>
								…then circle…
								<ul>
									<li>
										circle level
										<ul>
											<li>square level</li>
										</ul>
									</li>
								</ul>
							</li>
							<li>
								A wrapped item: grouped rhythm keeps items reading as discrete
								points even when a bullet wraps to a second line like this one does.
							</li>
						</ul>
						<ol id="prose-ol">
							<li>Ordered markers are tabular, right-aligned, hanging flush.</li>
							<li>
								Style cycles per depth: decimal…
								<ol>
									<li>
										…lower-alpha…
										<ol>
											<li>…lower-roman.</li>
										</ol>
									</li>
								</ol>
							</li>
						</ol>
						<div
							class="o-prose"
							id="prose-continuous"
							style={{ '--v-list-rhythm': 'calc(var(--v-line-height) * 1em - 1cap)' }}
						>
							<p>Continuous list rhythm (a scope flips one token):</p>
							<ul>
								<li>
									Wrapped items share one baseline and the list reads as a
									passage,
								</li>
								<li>like a WYSIWYG editor or long-form writing wants.</li>
							</ul>
						</div>
					</div>
				</div>
			</ObjectCard>

			<ObjectCard
				id="insets"
				title="Inline insets: text meets the box"
				knobs={['--o-prose__inset']}
				snippet={`<div class="o-container">\n  <div class="o-box">…</div>\n  <div class="o-prose"><p>…</p><pre>…</pre></div>\n</div>`}
				description={
					<>
						Boxes anchor the container edge; the <em>accompanying text</em> insets to
						line up with them — prose beside cards insets to the cards' inner text, and
						a code block (itself a box) breaks back out to the box edge. Field-label
						alignment modes (<code>v-align-edge</code> / <code>v-align-text</code>) land
						with the variants layer.
					</>
				}
			>
				<div class="o-container p-outline" id="inset-container" style={{ padding: '0' }}>
					<div class="o-box p-outline" id="inset-box">
						A card — its border-box sits on the container edge.
					</div>
					<div class="o-prose" id="inset-prose">
						<p>
							This prose is a direct child of the container, so it insets to share the
							card's inner text edge.
						</p>
						<pre id="inset-pre">{`// a code block breaks back out to the box edge`}</pre>
					</div>
					<div class="o-box p-outline">
						<div class="o-prose" id="inset-prose-in-box">
							<p>Prose inside a box stays flush — the inset never compounds.</p>
						</div>
					</div>
				</div>
			</ObjectCard>

			<ObjectCard
				id="o-caption"
				title="o-caption / o-code"
				knobs={['--o-caption__font-size', '--o-code__font-size']}
				snippet={`<span class="o-caption">…</span>\n<span class="o-code">…</span>`}
				description={
					<>
						Typography primitives: caption-class small text (badges, tooltips) and
						monospace text — structure only, chrome comes from the composing component.
					</>
				}
			>
				<p>
					Body text, then <span class="o-caption">caption-scale text</span>, then{' '}
					<span class="o-code">mono text</span>.
				</p>
			</ObjectCard>

			<ObjectCard
				id="o-menu"
				title="o-menu / o-menu-item"
				knobs={[
					'--o-menu__pad-block',
					'--o-menu__pad-inline',
					'--o-menu-item__height',
					'--o-menu-item__font-size',
				]}
				snippet={`<div class="o-menu">\n  <button class="o-menu-item">…</button>\n</div>`}
				description={
					<>
						The floating-list frame and its rows — structural only (radius, padding,
						overflow, row height). Behavior and popover chrome arrive with the DOM and
						component layers.
					</>
				}
			>
				<div class="o-menu p-outline-strong" style={{ 'max-inline-size': '16rem' }}>
					<button type="button" class="o-menu-item">
						Menu item one
					</button>
					<button type="button" class="o-menu-item">
						Menu item two
					</button>
					<button type="button" class="o-menu-item">
						Menu item three
					</button>
				</div>
			</ObjectCard>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <ObjectsPage />);
}
