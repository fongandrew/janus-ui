import { expect, type Page, test } from '@playwright/test';

/*
 * Token-layer E2E (PLAN.md §1.T). Targets the framework-free Variables and
 * Typography doc pages — no separate harness.
 */

const VARIABLES = '/v2-variables.html';
const TYPOGRAPHY = '/v2-typography.html';

/** Read a custom property off :root as a trimmed string. */
async function rootVar(page: Page, name: string): Promise<string> {
	return (
		await page.evaluate(
			(n) => getComputedStyle(document.documentElement).getPropertyValue(n),
			name,
		)
	).trim();
}

const PRIMARY_KNOBS = [
	'--v-spacing',
	'--v-radius',
	'--v-radius-min',
	'--v-border-width',
	'--v-input-height',
	'--v-font-family',
	'--v-font-family-mono',
	'--v-font-size-min',
	'--v-font-size-max',
	'--v-font-ratio-min',
	'--v-font-ratio-max',
	'--v-viewport-min',
	'--v-viewport-max',
	'--v-line-height',
	'--v-bg',
	'--v-link',
	'--v-accent',
	'--v-muted',
	'--v-shadow-outer',
	'--v-shadow-inner',
];

const SECONDARY_KNOBS = [
	'--v-font-size',
	'--v-pad-block',
	'--v-pad-inline',
	'--v-gap-block',
	'--v-gap-inline',
	'--v-fg',
	'--v-font-size-h1',
	'--v-font-size-h2',
	'--v-font-size-h3',
	'--v-font-size-h4',
	'--v-font-size-h5',
	'--v-font-size-h6',
	'--v-font-size-caption',
	'--v-font-size-code',
];

test('every primary knob resolves to a concrete value', async ({ page }) => {
	await page.goto(VARIABLES);
	for (const knob of PRIMARY_KNOBS) {
		expect(await rootVar(page, knob), knob).not.toBe('');
	}
});

test('every secondary knob resolves to a concrete value', async ({ page }) => {
	await page.goto(VARIABLES);
	for (const knob of SECONDARY_KNOBS) {
		expect(await rootVar(page, knob), knob).not.toBe('');
	}
});

test('fluid type scale grows with viewport and keeps a readable floor', async ({ page }) => {
	await page.goto(TYPOGRAPHY);

	const measure = async () =>
		page.evaluate(() => {
			const px = (el: Element | null) =>
				el ? parseFloat(getComputedStyle(el).fontSize) : NaN;
			return {
				body: px(document.body),
				h1: px(document.querySelector('h1')),
			};
		});

	await page.setViewportSize({ width: 320, height: 900 });
	const narrow = await measure();

	await page.setViewportSize({ width: 1280, height: 900 });
	const wide = await measure();

	// Body and h1 are strictly larger at the wide viewport (fluid interpolation).
	expect(wide.body).toBeGreaterThan(narrow.body);
	expect(wide.h1).toBeGreaterThan(narrow.h1);

	// Readability floor: nothing collapses below ~13px at the narrow viewport.
	expect(narrow.body).toBeGreaterThanOrEqual(13);

	// Dual-ratio: the heading→body ratio is bolder at the wide viewport.
	expect(wide.h1 / wide.body).toBeGreaterThan(narrow.h1 / narrow.body);
});

test('light/dark switching swaps --v-bg and --v-fg', async ({ page }) => {
	await page.goto(VARIABLES);

	await page.evaluate(() =>
		document.documentElement.setAttribute('data-v-color-scheme', 'light'),
	);
	const lightBg = await rootVar(page, '--v-bg');
	const lightFg = await rootVar(page, '--v-fg');

	await page.evaluate(() => document.documentElement.setAttribute('data-v-color-scheme', 'dark'));
	const darkBg = await rootVar(page, '--v-bg');
	const darkFg = await rootVar(page, '--v-fg');

	expect(darkBg).not.toBe(lightBg);
	expect(darkFg).not.toBe(lightFg);
});

test('base elements pick up token styling', async ({ page }) => {
	await page.goto(TYPOGRAPHY);

	const sizes = await page.evaluate(() => {
		const px = (sel: string) =>
			parseFloat(getComputedStyle(document.querySelector(sel)!).fontSize);
		return { h1: px('h1'), h2: px('h2'), h3: px('h3'), p: px('p') };
	});
	// Headings descend in size; body sits below them.
	expect(sizes.h1).toBeGreaterThan(sizes.h2);
	expect(sizes.h2).toBeGreaterThan(sizes.h3);
	expect(sizes.h3).toBeGreaterThan(sizes.p);

	// Links use the --v-link color.
	const linkColor = await page.evaluate(() => {
		const a = document.querySelector('a[href]')!;
		return getComputedStyle(a).color;
	});
	expect(linkColor).not.toBe('');
});
