import '~/shared/styles/index.css';

import { alphaBlend, APCAcontrast, sRGBtoY } from 'apca-w3';
import cx from 'classix';
import { colorParsley } from 'colorparsley';
import { createEffect, createSignal, type JSX, Show } from 'solid-js';
import { Dynamic, render } from 'solid-js/web';

import { App } from '~/app';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';

/** Returns minimum APCA threshold for font size / weight combo for "fluent" text */
function minContrast(fontSizePx: number, fontWeight: number) {
	if (fontSizePx < 14) return 100;
	if (fontSizePx <= 14) {
		if (fontWeight <= 400) return 100;
		if (fontWeight <= 500) return 100;
		if (fontWeight <= 600) return 90;
		return 75;
	}
	if (fontSizePx <= 15) {
		if (fontWeight <= 400) return 100;
		if (fontWeight <= 500) return 90;
		if (fontWeight <= 600) return 75;
		return 70;
	}
	if (fontSizePx <= 16) {
		if (fontWeight <= 400) return 90;
		if (fontWeight <= 500) return 75;
		if (fontWeight <= 600) return 70;
		return 60;
	}
	if (fontSizePx <= 18) {
		if (fontWeight <= 300) return 100;
		if (fontWeight <= 400) return 75;
		if (fontWeight <= 500) return 70;
		if (fontWeight <= 600) return 60;
		return 55;
	}
	if (fontSizePx <= 21) {
		if (fontWeight <= 300) return 90;
		if (fontWeight <= 400) return 70;
		if (fontWeight <= 500) return 60;
		if (fontWeight <= 600) return 55;
		return 50;
	}
	// Font-size 24 in APCA table
	if (fontWeight <= 300) return 75;
	if (fontWeight <= 400) return 60;
	if (fontWeight <= 500) return 55;
	if (fontWeight <= 600) return 50;
	return 45;
}

/**
 * With modifications based on usage type:
 * - Body text: Paragraphs, many blocks of text
 * - Descriptive text: Also "fluent text", short blocks of text. This 2.5 lines in the APCA
 *   guidelines but can be a little loose with this with tables and wrapping.
 * - Label: Single lines, often in menus or other constrained spaces
 * - Subheading: Larger text, sometimes used in menus or other constrained spaces
 * - Heading: Largest text
 */
function minContrastForUsage(
	fontSizePx: number,
	fontWeight: number,
	usage: 'body' | 'descriptive' | 'label' | 'subheading' | 'heading' = 'descriptive',
) {
	const base = minContrast(fontSizePx, fontWeight);

	// APCA rules are actually to add 15 if min is less than 75 but this is sort of weird since
	// it means increasing font size (which lowers the required contrast on the table) can
	// increase contrast requirements.
	if (usage === 'body') return Math.min(base, 75);
	if (usage === 'descriptive') return base;
	return Math.max(base - 15, 40);
}

function ColorWithAPCA(props: {
	as?: string;
	class?: string;
	href?: string;
	usage?: 'body' | 'descriptive' | 'label' | 'subheading' | 'heading' | undefined;
	children: JSX.Element;
}) {
	const [apca, setAPCA] = createSignal<number | undefined>();
	const [minAPCA, setMinAPCA] = createSignal<number>(Infinity);

	let ref: HTMLDivElement | undefined;

	createEffect(() => {
		if (!ref) return;
		const section = ref.closest('section');
		if (!section) return;

		const sectionStyle = getComputedStyle(section);
		const bg = sectionStyle.backgroundColor;
		const refStyle = getComputedStyle(ref);
		const fg = refStyle.color;
		const [bgR, bgG, bgB] = colorParsley(bg);
		const [fgR, fgG, fgB, fgA] = colorParsley(fg);
		const value = APCAcontrast(
			sRGBtoY(alphaBlend([fgR, fgG, fgB, fgA], [bgR, bgG, bgB])),
			sRGBtoY([bgR, bgG, bgB]),
		);
		setAPCA(typeof value === 'number' ? value : parseFloat(value));

		const fontSizePx = parseInt(refStyle.fontSize);
		const fontWeight = parseInt(refStyle.fontWeight);
		setMinAPCA(minContrastForUsage(fontSizePx, fontWeight, props.usage));
	});

	const apcaNorm = () => Math.abs(apca() ?? 0);

	return (
		<div class="o-group">
			<Dynamic
				component={props.as ?? 'span'}
				ref={ref}
				class={cx('o-group', props.class)}
				href={props.href}
			>
				{props.children}
			</Dynamic>
			<span class="t-ml-auto">
				{apcaNorm() >= 100 && '●'}
				{apcaNorm() >= 85 && '●'}
				{apcaNorm() >= 75 && '●'}
				{apcaNorm() >= 55 && '●'}
				{apcaNorm() >= 40 && '●'}
			</span>
			<span style={{ width: '7ch' }}>({apca()?.toFixed(2)})</span>
			<span title={`Minimum: ${minAPCA()}`}>{apcaNorm() >= minAPCA() ? '✓' : '✗'}</span>
		</div>
	);
}

function ColorBox(props: {
	class?: string;
	label?: string;
	noDanger?: boolean;
	noLink?: boolean;
	noMuted?: boolean;
	usage?: 'body' | 'descriptive' | 'label' | 'subheading' | 'heading';
}) {
	return (
		<section class={cx('o-text-box', 't-outer-radius', props.class)}>
			<ColorWithAPCA usage={props.usage}>{props.label}</ColorWithAPCA>
			{!props.noDanger && (
				<ColorWithAPCA class="t-text-danger" usage="label">
					Danger text
				</ColorWithAPCA>
			)}
			{!props.noLink && (
				<ColorWithAPCA as="a" href="#" usage="label">
					Link text
				</ColorWithAPCA>
			)}
			{!props.noMuted && (
				<ColorWithAPCA class="t-text-muted" usage="label">
					Muted text
				</ColorWithAPCA>
			)}
		</section>
	);
}

function Main() {
	const [value, incr] = createIncrSignal(1);

	// Force rerender when styles change
	const observer = new MutationObserver(incr);
	for (const style of document.querySelectorAll('style')) {
		observer.observe(style, { childList: true });
	}

	return (
		<App heading={<h1>Colors</h1>}>
			<main class="o-box o-stack">
				<Card>
					<CardHeader>
						<CardTitle>Legend</CardTitle>
					</CardHeader>
					<CardContent class="o-text-box o-text-stack">
						<p>
							Values chosen to comply with the{' '}
							<a href="https://readtech.org/ARC/tests/visual-readability-contrast/?tn=criterion#silver-level-conformance">
								silver level font weight tables here
							</a>
							.
						</p>
						<div class="o-grid">
							<div class="o-text-stack">
								<h4>Commonly Used Font Sizes &amp; Weights</h4>
								<table>
									<thead>
										<tr>
											<th>Font Size</th>
											<th>Font Weight</th>
											<th>Notes</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>15px (medium)</td>
											<td>400 (normal)</td>
											<td>Body text</td>
										</tr>
										<tr>
											<td>14px (small)</td>
											<td>400 (normal)</td>
											<td>
												Descriptive text. May be body (many lines) or fluent
												(fewer lines). Single-ish lines used in menus,
												inputs, and other UI interfaces.
											</td>
										</tr>
										<tr>
											<td>15px (medium)</td>
											<td>500 (medium)</td>
											<td>Labels and subheadings for inputs</td>
										</tr>
										<tr>
											<td>14px (small)</td>
											<td>500 (medium)</td>
											<td>
												Labels for subheadings inside menus or other
												constrained containers
											</td>
										</tr>
										<tr>
											<td>16px (large)</td>
											<td>600 (semibold)</td>
											<td>Subheadings</td>
										</tr>
										<tr>
											<td>20px (xlarge)</td>
											<td>700 (bold)</td>
											<td>Headings</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="o-text-stack">
								<h4>Minimums</h4>
								<table>
									<thead>
										<tr>
											<th>Dots</th>
											<th>
												APCA L<sup>c</sup> Value
											</th>
											<th>Notes</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>●●●●●</td>
											<td>100+</td>
											<td>
												<ul>
													<li>15px/400 body text</li>
													<li>14px/400 fluent/body text</li>
												</ul>
											</td>
										</tr>
										<tr>
											<td>●●●●</td>
											<td>85+</td>
											<td>
												<ul>
													<li>15px/400 descriptive text</li>
													<li>14px/400 descriptive text</li>
													<li>14px/500 labels</li>
												</ul>
											</td>
										</tr>
										<tr>
											<td>●●●</td>
											<td>75+</td>
											<td>
												<ul>
													<li>15px/500 labels</li>
												</ul>
											</td>
										</tr>
										<tr>
											<td>●●</td>
											<td>55+</td>
											<td>
												<ul>
													<li>16px/600 subheadings</li>
												</ul>
											</td>
										</tr>
										<tr>
											<td>●●</td>
											<td>40+</td>
											<td>
												<ul>
													<li>20px/700 headings</li>
												</ul>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</CardContent>
				</Card>
				<Show when={value()} keyed>
					{(_count: number) => (
						<Card class="o-box o-grid">
							<ColorBox class="v-card-colors" label="Card" usage="body" />
							<ColorBox class="v-default-colors" label="Default" usage="body" />
							<ColorBox
								class="v-code-colors"
								label="Code"
								noDanger
								noLink
								noMuted
								usage="label"
							/>
							<ColorBox class="v-pre-colors" label="Pre" usage="label" />
							<ColorBox class="v-popover-colors" label="Popover" />
							<ColorBox class="v-tooltip-colors" label="Tooltip" noLink />
							<ColorBox
								class="v-primary-colors"
								label="Primary"
								noDanger
								noLink
								noMuted
							/>
							<ColorBox class="v-secondary-colors" label="Secondary" usage="label" />
							<ColorBox class="v-callout-colors" label="Callout" />
							<ColorBox
								class="v-highlight-colors"
								label="Highlight"
								noLink
								usage="label"
							/>
							<ColorBox class="v-input-colors" label="Input" />
							<ColorBox
								class="v-success-colors"
								label="Success"
								noDanger
								usage="label"
							/>
							<ColorBox
								class="v-warning-colors"
								label="Warning"
								noDanger
								usage="label"
							/>
							<ColorBox
								class="v-danger-colors"
								label="Danger"
								noDanger
								usage="label"
							/>
						</Card>
					)}
				</Show>
			</main>
		</App>
	);
}

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
	);
}

render(() => <Main />, root!);
