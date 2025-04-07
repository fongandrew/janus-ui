import '~/shared/styles/index.css';

import { alphaBlend, APCAcontrast, sRGBtoY } from 'apca-w3';
import cx from 'classix';
import { colorParsley } from 'colorparsley';
import {
	createContext,
	createEffect,
	createSignal,
	type JSX,
	onCleanup,
	useContext,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { App } from '~/app';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { elmDoc, elmWin } from '~/shared/utility/multi-view';
import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';
import { mountRoot } from '~/shared/utility/solid/mount-root';

/** Context to pass down signal that reforces recalc of color context on change */
export const RenderCountContext = createContext<() => number>(() => 0);

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
	if (usage === 'body') return Math.max(base, 75);
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
	const renderCount = useContext(RenderCountContext);
	const [apca, setAPCA] = createSignal<number | undefined>();
	const [minAPCA, setMinAPCA] = createSignal<number>(Infinity);

	let ref: HTMLDivElement | undefined;

	createEffect(() => {
		// Invoke so we re-run this effect when something happens
		renderCount();

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
			<span style={{ width: '7ch' }}>({apcaNorm().toFixed(2)})</span>
			<span title={`Minimum: ${minAPCA()}`} data-testid="acpa-pass">
				{apcaNorm() >= minAPCA() ? '✓' : '✗'}
			</span>
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
		<section class={cx('o-text-box', 't-radius-outer', 't-border', props.class)}>
			<ColorWithAPCA usage={props.usage}>{props.label}</ColorWithAPCA>
			{!props.noDanger && (
				<ColorWithAPCA class="v-text-danger" usage="label">
					Danger text
				</ColorWithAPCA>
			)}
			{!props.noLink && (
				<ColorWithAPCA as="a" href="#" usage="label">
					Link text
				</ColorWithAPCA>
			)}
			{!props.noMuted && (
				<ColorWithAPCA class="v-text-muted" usage="label">
					Muted text
				</ColorWithAPCA>
			)}
		</section>
	);
}

function Main() {
	const [value, incr] = createIncrSignal(1);

	// Force update on hot reload (so CSS-only changes trigger contrast recalc)
	import.meta.hot?.on('vite:afterUpdate', incr);

	let main: HTMLElement | undefined;
	const observer = new MutationObserver(incr);
	createEffect(() => {
		// Re-render if explicit color scheme changes
		const html = elmDoc(main)?.documentElement;
		if (html) {
			observer.observe(html, {
				attributes: true,
				attributeFilter: ['data-color-scheme'],
			});
		}

		// Re-render if system pref changes
		elmWin(main)?.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', incr);
	});

	onCleanup(() => {
		observer.disconnect();
	});

	return (
		<App heading={<h1>Colors</h1>}>
			<RenderCountContext.Provider value={value}>
				<main ref={main} class="o-box o-stack">
					<Card>
						<CardHeader>
							<CardTitle>Legend</CardTitle>
						</CardHeader>
						<CardContent class="o-text-box o-stack">
							<p>
								Values chosen to comply with the{' '}
								<a href="https://readtech.org/ARC/tests/visual-readability-contrast/?tn=criterion#silver-level-conformance">
									silver level font weight tables here
								</a>
								.
							</p>
							<div class="o-grid">
								<div class="o-stack">
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
													Descriptive text. May be body (many lines) or
													fluent (fewer lines). Single-ish lines used in
													menus, inputs, and other UI interfaces.
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
								<div class="o-stack">
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
					<Card class="o-box o-grid">
						<ColorBox class="v-colors-card" label="Card" usage="body" />
						<ColorBox class="v-colors-default" label="Default" usage="body" />
						<ColorBox
							class="v-colors-code"
							label="Code"
							noDanger
							noLink
							noMuted
							usage="label"
						/>
						<ColorBox class="v-colors-pre" label="Pre" usage="label" />
						<ColorBox class="v-colors-popover" label="Popover" />
						<ColorBox class="v-colors-tooltip" label="Tooltip" noLink />
						<ColorBox
							class="v-colors-primary"
							label="Primary"
							noDanger
							noLink
							noMuted
							usage="label"
						/>
						<ColorBox class="v-colors-secondary" label="Secondary" usage="label" />
						<ColorBox class="v-colors-callout" label="Callout" />
						<ColorBox
							class="v-colors-highlight"
							label="Highlight"
							noLink
							usage="label"
						/>
						<ColorBox class="v-colors-input" label="Input" />
						<ColorBox class="v-colors-success" label="Success" noDanger usage="label" />
						<ColorBox class="v-colors-warning" label="Warning" noDanger usage="label" />
						<ColorBox class="v-colors-danger" label="Danger" noDanger usage="label" />
					</Card>
				</main>
			</RenderCountContext.Provider>
		</App>
	);
}

mountRoot(Main);
