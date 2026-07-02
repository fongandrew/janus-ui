import { expect, test } from '@playwright/test';

const VARIABLES_PAGE = '/site/composition/variables.html';

/** Resolve a CSS length expression to px by measuring a probe element. */
async function resolvePx(page: import('@playwright/test').Page, expr: string): Promise<number> {
	return page.evaluate((e) => {
		const el = document.createElement('div');
		el.style.position = 'absolute';
		el.style.width = e;
		document.body.appendChild(el);
		const w = parseFloat(getComputedStyle(el).width);
		el.remove();
		return w;
	}, expr);
}

/** Read a custom property's computed value off :root. */
async function readVar(page: import('@playwright/test').Page, name: string): Promise<string> {
	return page.evaluate(
		(n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
		name,
	);
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
	'--v-gap-section',
	'--v-gap-tight',
	'--v-control-inset',
	'--v-fg',
	'--v-card-bg',
	'--v-input-bg',
	'--v-backdrop',
	'--v-border-color',
	'--v-border-color-strong',
	'--v-list-rhythm',
	'--v-font-size-h1',
	'--v-font-size-h2',
	'--v-font-size-h3',
	'--v-font-size-h4',
	'--v-font-size-h5',
	'--v-font-size-h6',
	'--v-font-size-caption',
	'--v-font-size-code',
];

test.describe('Phase 1 tokens', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(VARIABLES_PAGE);
	});

	test('every primary knob resolves to a non-empty value', async ({ page }) => {
		for (const knob of PRIMARY_KNOBS) {
			expect(await readVar(page, knob), knob).not.toBe('');
		}
	});

	test('every secondary knob resolves to a non-empty value', async ({ page }) => {
		for (const knob of SECONDARY_KNOBS) {
			expect(await readVar(page, knob), knob).not.toBe('');
		}
	});

	test('derived multiples hold at default', async ({ page }) => {
		const spacing = await resolvePx(page, 'var(--v-spacing)');
		expect(await resolvePx(page, 'var(--v-pad-block)')).toBeCloseTo(spacing * 1.25, 1);
		expect(await resolvePx(page, 'var(--v-gap-section)')).toBeCloseTo(spacing * 1.5, 1);
		expect(await resolvePx(page, 'var(--v-gap-tight)')).toBeCloseTo(spacing * 0.25, 1);
		expect(await resolvePx(page, 'var(--v-gap-inline)')).toBeCloseTo(spacing * 0.5, 1);
	});

	test('type is fixed by default — identical at narrow and wide viewport', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 900 });
		const bodyNarrow = await page.evaluate(() => getComputedStyle(document.body).fontSize);
		const h1Narrow = await resolvePx(page, 'var(--v-font-size-h1)');

		await page.setViewportSize({ width: 1280, height: 900 });
		const bodyWide = await page.evaluate(() => getComputedStyle(document.body).fontSize);
		const h1Wide = await resolvePx(page, 'var(--v-font-size-h1)');

		expect(bodyNarrow).toBe(bodyWide);
		// Body resolves to ~15px (0.9375rem) at both.
		expect(parseFloat(bodyNarrow)).toBeCloseTo(15, 0);
		expect(h1Narrow).toBeCloseTo(h1Wide, 1);
	});

	test('the fluid path is wired — spreading anchors interpolates', async ({ page }) => {
		await page.evaluate(() => {
			const r = document.documentElement.style;
			r.setProperty('--v-font-size-min', '1rem');
			r.setProperty('--v-font-size-max', '1.25rem');
			r.setProperty('--v-font-ratio-min', '1.2');
			r.setProperty('--v-font-ratio-max', '1.4');
		});

		await page.setViewportSize({ width: 360, height: 900 });
		const bodyNarrow = parseFloat(await page.evaluate(() => getComputedStyle(document.body).fontSize));
		const h1Narrow = await resolvePx(page, 'var(--v-font-size-h1)');

		await page.setViewportSize({ width: 1280, height: 900 });
		const bodyWide = parseFloat(await page.evaluate(() => getComputedStyle(document.body).fontSize));
		const h1Wide = await resolvePx(page, 'var(--v-font-size-h1)');

		// Body sits near the min anchor when narrow, near the max anchor when wide.
		expect(bodyNarrow).toBeCloseTo(16, 0);
		expect(bodyWide).toBeGreaterThan(bodyNarrow);
		// Dual-ratio: the h1/body ratio is larger at the wide viewport.
		expect(h1Wide / bodyWide).toBeGreaterThan(h1Narrow / bodyNarrow);
	});

	test('readability floor holds small steps up', async ({ page }) => {
		// Caption at the default fixed config floors to ~13px (not its pure 12.5px).
		const caption = await resolvePx(page, 'var(--v-font-size-caption)');
		expect(caption).toBeGreaterThanOrEqual(12.9);
	});

	test('light/dark switching changes --v-bg and --v-fg', async ({ page }) => {
		await page.evaluate(() => document.documentElement.setAttribute('data-v-color-scheme', 'light'));
		const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

		await page.evaluate(() => document.documentElement.setAttribute('data-v-color-scheme', 'dark'));
		const bgDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

		expect(bgLight).not.toBe(bgDark);
	});

	test('base elements are styled', async ({ page }) => {
		await page.goto('/site/composition/typography.html');
		const sizes = await page.evaluate(() => {
			const px = (sel: string) => parseFloat(getComputedStyle(document.querySelector(sel)!).fontSize);
			return { h1: px('h1'), h2: px('h2'), h3: px('h3') };
		});
		expect(sizes.h1).toBeGreaterThan(sizes.h2);
		expect(sizes.h2).toBeGreaterThan(sizes.h3);

		// Links pick up --v-link.
		const linkColor = await page
			.locator('a[href]')
			.first()
			.evaluate((el) => getComputedStyle(el).color);
		expect(linkColor).not.toBe('rgb(0, 0, 0)');
	});
});
