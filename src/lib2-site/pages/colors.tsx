import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { colorParsley } from 'colorparsley';

import { Layout } from '../layout';
import { renderPage } from '../render';

/**
 * Colors (§20.3) — the color system + a static APCA contrast grid (the
 * contrast checker carried forward from v1). Each cell shows a v-colors-*
 * variant painted by the real CSS, with an APCA Lc score computed at build time
 * for the light-mode palette. The interactive playground island is Phase 9.
 */

function lc(fg: string, bg: string): number {
	const [fr, fgc, fb] = colorParsley(fg) as unknown as number[];
	const [br, bgc, bb] = colorParsley(bg) as unknown as number[];
	const raw = APCAcontrast(sRGBtoY([fr!, fgc!, fb!]), sRGBtoY([br!, bgc!, bb!]));
	const n = typeof raw === 'number' ? raw : parseFloat(raw);
	return Math.round(Math.abs(n));
}

/** Binary best-contrast foreground (mirrors the OKLCH derivation). */
function bestFg(bg: string): { fg: string; lc: number } {
	const white = lc('rgb(255,255,255)', bg);
	const black = lc('rgb(0,0,0)', bg);
	return white >= black ? { fg: 'rgb(255,255,255)', lc: white } : { fg: 'rgb(0,0,0)', lc: black };
}

// Light-mode bg values, mirroring variants/colors.css. The score is a static
// light-mode reference; the swatch itself uses the live CSS variant (dark-aware).
const VARIANTS: { cls: string; label: string; bg: string }[] = [
	{ cls: '', label: 'base', bg: 'hsl(30, 12%, 98.5%)' },
	{ cls: 'v-colors-primary', label: 'primary', bg: 'hsl(195, 100%, 20%)' },
	{ cls: 'v-colors-danger', label: 'danger', bg: 'hsl(0, 89%, 31%)' },
	{ cls: 'v-colors-success', label: 'success', bg: 'hsl(158, 77%, 15%)' },
	{ cls: 'v-colors-warn', label: 'warn', bg: 'hsl(50, 77%, 86%)' },
	{ cls: 'v-colors-info', label: 'info', bg: 'hsl(195, 80%, 90%)' },
	{ cls: 'v-colors-secondary', label: 'secondary', bg: 'hsl(30, 8%, 93%)' },
	{ cls: 'v-colors-tooltip', label: 'tooltip', bg: 'rgb(20, 24, 33)' },
	{ cls: 'v-colors-popover', label: 'popover', bg: 'rgb(255, 255, 255)' },
	{ cls: 'v-colors-callout', label: 'callout', bg: 'hsl(30, 8%, 92%)' },
	{ cls: 'v-colors-highlight', label: 'highlight', bg: 'hsl(195, 100%, 20%)' },
];

const MIN_LC = 60; // body-text threshold

function Colors() {
	return (
		<Layout section="colors" title="Colors">
			<div class="o-prose p-doc-section">
				<p>
					Five root color knobs carry the base palette; tonal and surface-role variations
					live as <code>v-colors-*</code> variants. Each swatch below is painted by the real
					CSS variant; the APCA Lc score is computed at build time for the light-mode palette
					(≥ {MIN_LC} passes for body text).
				</p>
			</div>

			<section class="p-doc-section">
				<h2>Contrast grid</h2>
				<div class="o-grid p-color-grid" style={{ '--o-grid__min': '9rem' }}>
					{VARIANTS.map((v) => {
						const { lc: score } = bestFg(v.bg);
						const pass = score >= MIN_LC;
						return (
							<div class={`p-color-cell ${v.cls}`} data-testid={`color-${v.label}`}>
								<span class="p-color-cell__label">{v.label}</span>
								<span class="p-color-cell__sample">Aa the quick brown fox</span>
								<span
									class="p-color-cell__score"
									data-pass={pass ? 'true' : 'false'}
								>
									Lc {score} {pass ? '✓' : '✗'}
								</span>
							</div>
						);
					})}
				</div>
			</section>
		</Layout>
	);
}

export function render() {
	return renderPage(() => <Colors />);
}
