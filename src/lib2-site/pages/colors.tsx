import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { colorParsley } from 'colorparsley';
import { For } from 'solid-js';

import { PageLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

/*
 * The contrast grid computes APCA Lc scores AT SSR TIME. The CSS variants use
 * light-dark(), which can't be read server-side, so this TS table MIRRORS the
 * palette source of truth in src/lib2/css/variants/colors.css and
 * tokens/color.css — keep them in sync when the palette moves.
 */
interface VariantColors {
	bg: string;
	fg: string;
	link: string;
	muted: string;
}

interface VariantSpec {
	/** CSS class ('' = the default base palette) */
	class: string;
	label: string;
	group: 'base' | 'tonal' | 'surface-role';
	light: VariantColors;
	dark: VariantColors;
}

const BASE_LIGHT: VariantColors = {
	bg: 'hsl(30deg 12% 98.5%)',
	fg: 'hsl(0deg 0% 0%)',
	link: 'hsl(195deg 100% 20%)',
	muted: 'hsl(30deg 7% 31%)',
};

const BASE_DARK: VariantColors = {
	bg: 'hsl(216deg 16% 8%)',
	fg: 'hsl(0deg 0% 100%)',
	link: 'hsl(183deg 25% 85%)',
	muted: 'hsl(30deg 7% 86.5%)',
};

const VARIANTS: VariantSpec[] = [
	{ class: '', label: 'default', group: 'base', light: BASE_LIGHT, dark: BASE_DARK },
	{
		class: 'v-colors-primary',
		label: 'primary',
		group: 'tonal',
		light: {
			bg: 'hsl(195deg 100% 20%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(183deg 15% 80%)',
		},
		dark: {
			bg: 'hsl(195deg 100% 20%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(183deg 15% 80%)',
		},
	},
	{
		class: 'v-colors-secondary',
		label: 'secondary',
		group: 'tonal',
		light: {
			bg: 'hsl(30deg 8% 93%)',
			fg: 'hsl(0deg 0% 3%)',
			link: 'hsl(195deg 100% 20%)',
			muted: 'hsl(30deg 7% 31%)',
		},
		dark: {
			bg: 'hsl(216deg 16% 18%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(0deg 0% 86.5%)',
		},
	},
	{
		class: 'v-colors-success',
		label: 'success',
		group: 'tonal',
		light: {
			bg: 'hsl(158deg 77% 15%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(158deg 77% 90%)',
			muted: 'hsl(158deg 40% 85%)',
		},
		dark: {
			bg: 'hsl(158deg 77% 8%)',
			fg: 'hsl(30deg 12% 98.5%)',
			link: 'hsl(158deg 30% 86.5%)',
			muted: 'hsl(158deg 10% 80%)',
		},
	},
	{
		class: 'v-colors-warn',
		label: 'warn',
		group: 'tonal',
		light: {
			bg: 'hsl(50deg 77% 86%)',
			fg: 'hsl(216deg 16% 8%)',
			link: 'hsl(50deg 77% 15%)',
			muted: 'hsl(50deg 77% 21.5%)',
		},
		dark: {
			bg: 'hsl(50deg 100% 10%)',
			fg: 'hsl(30deg 12% 98.5%)',
			link: 'hsl(50deg 60% 80%)',
			muted: 'hsl(50deg 15% 80%)',
		},
	},
	{
		class: 'v-colors-info',
		label: 'info',
		group: 'tonal',
		light: {
			bg: 'hsl(195deg 80% 90%)',
			fg: 'hsl(216deg 16% 8%)',
			link: 'hsl(195deg 100% 18%)',
			muted: 'hsl(195deg 50% 25%)',
		},
		dark: {
			bg: 'hsl(195deg 80% 12%)',
			fg: 'hsl(30deg 12% 98.5%)',
			link: 'hsl(195deg 60% 80%)',
			muted: 'hsl(195deg 15% 80%)',
		},
	},
	{
		class: 'v-colors-danger',
		label: 'danger',
		group: 'tonal',
		light: {
			bg: 'hsl(0deg 89% 31%)',
			fg: 'hsl(0deg 0% 98%)',
			link: 'hsl(0deg 89% 93%)',
			muted: 'hsl(0deg 89% 93%)',
		},
		dark: {
			bg: 'hsl(30deg 100% 8%)',
			fg: 'hsl(30deg 100% 85%)',
			link: 'hsl(30deg 100% 85%)',
			muted: 'hsl(30deg 25% 85%)',
		},
	},
	{
		class: 'v-colors-code',
		label: 'code',
		group: 'surface-role',
		// Tinted paper: --v-muted 8% into --v-bg
		light: { ...BASE_LIGHT, bg: 'hsl(30deg 9% 93.1%)' },
		dark: { ...BASE_DARK, bg: 'hsl(219deg 14% 14.3%)' },
	},
	{
		class: 'v-colors-pre',
		label: 'pre',
		group: 'surface-role',
		light: {
			bg: 'hsl(219deg 25% 10%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(30deg 7% 82.5%)',
		},
		dark: {
			bg: 'hsl(219deg 25% 10%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(30deg 7% 82.5%)',
		},
	},
	{
		class: 'v-colors-popover',
		label: 'popover',
		group: 'surface-role',
		light: { ...BASE_LIGHT, bg: 'hsl(0deg 0% 100%)' },
		dark: { ...BASE_DARK, bg: 'hsl(216deg 16% 12%)' },
	},
	{
		class: 'v-colors-tooltip',
		label: 'tooltip',
		group: 'surface-role',
		light: {
			bg: 'hsl(219deg 25% 10%)',
			fg: 'hsl(0deg 0% 98%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(30deg 7% 82.5%)',
		},
		dark: {
			bg: 'hsl(0deg 0% 98%)',
			fg: 'hsl(219deg 25% 10%)',
			link: 'hsl(195deg 100% 20%)',
			muted: 'hsl(30deg 7% 31%)',
		},
	},
	{
		class: 'v-colors-callout',
		label: 'callout',
		group: 'surface-role',
		light: {
			bg: 'hsl(30deg 12% 92.5%)',
			fg: 'hsl(216deg 16% 8%)',
			link: 'hsl(195deg 100% 20%)',
			muted: 'hsl(30deg 7% 31%)',
		},
		dark: {
			bg: 'hsl(216deg 16% 18%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 85%)',
			muted: 'hsl(30deg 7% 86.5%)',
		},
	},
	{
		class: 'v-colors-highlight',
		label: 'highlight',
		group: 'surface-role',
		light: {
			bg: 'hsl(195deg 100% 20%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 86%)',
			muted: 'hsl(183deg 25% 86%)',
		},
		dark: {
			bg: 'hsl(195deg 100% 20%)',
			fg: 'hsl(30deg 100% 96%)',
			link: 'hsl(183deg 25% 86%)',
			muted: 'hsl(183deg 25% 86%)',
		},
	},
];

/** APCA Lc for fg text on bg, both any CSS color string. */
function lc(fg: string, bg: string): number {
	// colorParsley doesn't understand the `deg` unit our palette strings use
	const [fr, fg_, fb] = colorParsley(fg.replace(/deg/g, ''));
	const [br, bg_, bb] = colorParsley(bg.replace(/deg/g, ''));
	const value = APCAcontrast(sRGBtoY([fr, fg_, fb]), sRGBtoY([br, bg_, bb]));
	return Math.round(Math.abs(typeof value === 'number' ? value : parseFloat(value)));
}

/*
 * APCA silver-level thresholds at our type scale: Lc 75 for fluent body text
 * (15px / 400 — we bump borderline colors to weight 500 via the *-weight-min
 * knobs, §7.1), Lc 60 for large or bold text.
 */
const BODY_PASS = 75;
const LARGE_PASS = 60;

function ScoreChip(props: { score: number; threshold: number }) {
	return (
		<span
			class={`p-lc-chip ${props.score >= props.threshold ? 'p-lc-chip--pass' : 'p-lc-chip--fail'}`}
		>
			Lc {props.score} {props.score >= props.threshold ? '✓' : '✕'}
		</span>
	);
}

function VariantCell(props: { spec: VariantSpec; mode: 'light' | 'dark' }) {
	// eslint-disable-next-line solid/reactivity -- static SSR page, props never change
	const colors = props.spec[props.mode];
	return (
		<div
			class={`p-contrast-cell ${props.spec.class}`}
			data-v-color-scheme={props.mode}
			data-variant={props.spec.label}
			style={
				props.spec.class === '' ? { background: colors.bg, color: colors.fg } : undefined
			}
		>
			<p class="p-contrast-cell__name">
				<code>{props.spec.class === '' ? 'base palette' : props.spec.class}</code> (
				{props.mode})
			</p>
			<p>
				Body text <ScoreChip score={lc(colors.fg, colors.bg)} threshold={BODY_PASS} />
			</p>
			<p style={{ color: colors.muted }}>
				Muted text <ScoreChip score={lc(colors.muted, colors.bg)} threshold={BODY_PASS} />
			</p>
			<p>
				<span style={{ color: colors.link, 'text-decoration': 'underline' }}>
					Link text
				</span>{' '}
				<ScoreChip score={lc(colors.link, colors.bg)} threshold={LARGE_PASS} />
			</p>
		</div>
	);
}

function ColorsPage() {
	return (
		<PageLayout current="colors">
			<hgroup>
				<h1>Colors</h1>
				<p>
					Five root knobs carry the base palette; tonal and surface-role variants re-set
					them together for a subtree (§7). APCA Lc scores are computed at build time —
					body/muted text passes at Lc ≥ {BODY_PASS}, links (weight-floored to 500) at Lc
					≥ {LARGE_PASS}.
				</p>
			</hgroup>

			<div class="o-prose">
				<p>
					The score table mirrors the palette source of truth in{' '}
					<code>variants/colors.css</code>; the rendered swatches are the real CSS
					classes, so what you see is what ships. The interactive color playground (live
					knob editing, recomputed contrast) arrives with the DOM layer in Phase 9.
				</p>
			</div>

			<section id="contrast-grid" class="p-doc-section">
				<h2>Contrast grid</h2>
				<div class="o-grid p-contrast-grid" style={{ '--o-grid__min': '18rem' }}>
					<For each={VARIANTS}>
						{(spec) => (
							<>
								<VariantCell spec={spec} mode="light" />
								<VariantCell spec={spec} mode="dark" />
							</>
						)}
					</For>
				</div>
			</section>
		</PageLayout>
	);
}

export function render() {
	return renderStatic(() => <ColorsPage />);
}
