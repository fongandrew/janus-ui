import '~/shared/style/index.css';

import { alphaBlend, APCAcontrast, sRGBtoY } from 'apca-w3';
import cx from 'classix';
import { colorParsley } from 'colorparsley';
import { createEffect, createSignal, type JSX, Show } from 'solid-js';
import { Dynamic, render } from 'solid-js/web';

import { App } from '~/app';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';

function ColorWithAPCA(props: {
	as?: string;
	class?: string;
	href?: string;
	children: JSX.Element;
}) {
	const [apca, setAPCA] = createSignal<number | undefined>();

	let ref: HTMLDivElement | undefined;

	createEffect(() => {
		if (!ref) return;
		const section = ref.closest('section');
		if (!section) return;
		const bg = getComputedStyle(section).backgroundColor;
		const fg = getComputedStyle(ref).color;
		const [bgR, bgG, bgB] = colorParsley(bg);
		const [fgR, fgG, fgB, fgA] = colorParsley(fg);
		const value = APCAcontrast(
			sRGBtoY(alphaBlend([fgR, fgG, fgB, fgA], [bgR, bgG, bgB])),
			sRGBtoY([bgR, bgG, bgB]),
		);
		setAPCA(typeof value === 'number' ? value : parseFloat(value));
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
		</div>
	);
}

function ColorBox(props: {
	class?: string;
	label?: string;
	noDanger?: boolean;
	noLink?: boolean;
	noMuted?: boolean;
}) {
	return (
		<section class={cx('o-text-box', 't-outer-radius', props.class)}>
			<ColorWithAPCA>{props.label}</ColorWithAPCA>
			{!props.noDanger && <ColorWithAPCA class="t-text-danger">Danger text</ColorWithAPCA>}
			{!props.noLink && (
				<ColorWithAPCA as="a" href="#">
					Link text
				</ColorWithAPCA>
			)}
			{!props.noMuted && <ColorWithAPCA class="t-text-muted">Muted text</ColorWithAPCA>}
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
							<ColorBox class="v-card-colors" label="Card" />
							<ColorBox class="v-default-colors" label="Default" />
							<ColorBox class="v-code-colors" label="Code" noDanger noLink noMuted />
							<ColorBox class="v-pre-colors" label="Pre" />
							<ColorBox class="v-popover-colors" label="Popover" />
							<ColorBox class="v-tooltip-colors" label="Tooltip" noLink />
							<ColorBox
								class="v-primary-colors"
								label="Primary"
								noDanger
								noLink
								noMuted
							/>
							<ColorBox class="v-secondary-colors" label="Secondary" />
							<ColorBox class="v-callout-colors" label="Callout" />
							<ColorBox class="v-highlight-colors" label="Highlight" noLink />
							<ColorBox class="v-input-colors" label="Input" />
							<ColorBox class="v-success-colors" label="Success" noDanger />
							<ColorBox class="v-warning-colors" label="Warning" noDanger />
							<ColorBox class="v-danger-colors" label="Danger" noDanger />
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
