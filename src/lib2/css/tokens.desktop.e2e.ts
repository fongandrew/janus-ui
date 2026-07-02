import { expect, type Page, test } from '@playwright/test';

/**
 * Token-layer E2E tests (PLAN 1.T). Target: the Variables and Typography doc
 * pages — the review artifacts for the token layer.
 */

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

/** Resolve a length-valued custom property to px via a probe element. */
async function resolveLength(page: Page, token: string): Promise<number> {
	return page.evaluate((name) => {
		const el = document.createElement('div');
		el.style.position = 'absolute';
		el.style.visibility = 'hidden';
		el.style.width = `var(${name})`;
		document.body.appendChild(el);
		const width = el.getBoundingClientRect().width;
		el.remove();
		return width;
	}, token);
}

/** Resolve a color-valued custom property via a probe element. */
async function resolveColor(page: Page, token: string): Promise<string> {
	return page.evaluate((name) => {
		const el = document.createElement('div');
		el.style.color = `var(${name})`;
		document.body.appendChild(el);
		const color = getComputedStyle(el).color;
		el.remove();
		return color;
	}, token);
}

async function rawValue(page: Page, token: string): Promise<string> {
	return page.evaluate(
		(name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
		token,
	);
}

test.describe('token layer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/v2-variables.html');
	});

	test('every primary knob resolves to a non-empty concrete value', async ({ page }) => {
		for (const knob of PRIMARY_KNOBS) {
			expect(await rawValue(page, knob), `${knob} should resolve`).not.toBe('');
		}
	});

	test('every secondary knob resolves to a non-empty concrete value', async ({ page }) => {
		for (const knob of SECONDARY_KNOBS) {
			expect(await rawValue(page, knob), `${knob} should resolve`).not.toBe('');
		}
	});

	test('derived spacing multiples hold at default', async ({ page }) => {
		const spacing = await resolveLength(page, '--v-spacing');
		expect(spacing).toBeGreaterThan(0);
		expect(await resolveLength(page, '--v-pad-block')).toBeCloseTo(spacing * 1.25, 1);
		expect(await resolveLength(page, '--v-pad-inline')).toBeCloseTo(spacing * 1.25, 1);
		expect(await resolveLength(page, '--v-gap-block')).toBeCloseTo(spacing, 1);
		expect(await resolveLength(page, '--v-gap-inline')).toBeCloseTo(spacing * 0.5, 1);
		expect(await resolveLength(page, '--v-gap-section')).toBeCloseTo(spacing * 1.5, 1);
		expect(await resolveLength(page, '--v-gap-tight')).toBeCloseTo(spacing * 0.25, 1);
	});

	test('radius cascade anchors step inward and floor at the min', async ({ page }) => {
		const radius = await resolveLength(page, '--v-radius');
		const radiusMin = await resolveLength(page, '--v-radius-min');
		const dialog = await resolveLength(page, '--o-dialog__radius');
		const box = await resolveLength(page, '--o-box__radius');
		expect(radius).toBeCloseTo(40, 1); // 2.5rem
		expect(radiusMin).toBeCloseTo(6, 1); // 0.375rem
		expect(dialog).toBeLessThan(radius);
		expect(box).toBeLessThan(dialog);
		expect(box).toBeGreaterThanOrEqual(radiusMin);
	});

	test('light/dark switching changes --v-bg and --v-fg', async ({ page }) => {
		const lightBg = await resolveColor(page, '--v-bg');
		const lightFg = await resolveColor(page, '--v-fg');
		await page.evaluate(() =>
			document.documentElement.setAttribute('data-v-color-scheme', 'dark'),
		);
		const darkBg = await resolveColor(page, '--v-bg');
		const darkFg = await resolveColor(page, '--v-fg');
		expect(darkBg).not.toBe(lightBg);
		expect(darkFg).not.toBe(lightFg);
		// fg is binary black/white derived from bg lightness (Chromium
		// serializes the relative-color result in oklch)
		expect(['rgb(0, 0, 0)', 'oklch(0 0 0)']).toContain(lightFg);
		expect(['rgb(255, 255, 255)', 'oklch(1 0 0)']).toContain(darkFg);
	});

	test('base element styling applies', async ({ page }) => {
		await page.goto('/v2-typography.html');
		// Headings have decreasing sizes down the levels
		const sizes = await page.evaluate(() => {
			const probe = (tag: string) => {
				const el = document.createElement(tag);
				el.textContent = 'probe';
				document.body.appendChild(el);
				const size = parseFloat(getComputedStyle(el).fontSize);
				el.remove();
				return size;
			};
			return { h1: probe('h1'), h2: probe('h2'), h3: probe('h3'), h4: probe('h4') };
		});
		expect(sizes.h1).toBeGreaterThan(sizes.h2);
		expect(sizes.h2).toBeGreaterThan(sizes.h3);
		expect(sizes.h3).toBeGreaterThan(sizes.h4);

		// Links carry the link color + weight floor
		const link = page.locator('.p-doc-main a[href]').first();
		const linkColor = await resolveColor(page, '--v-link');
		await expect(link).toHaveCSS('color', linkColor);
		await expect(link).toHaveCSS('font-weight', '500');

		// Body paints the gradient stack over --v-bg
		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
		expect(bodyBg).toContain('radial-gradient');
	});
});

test.describe('type scale', () => {
	test('type is fixed by default: identical at narrow and wide viewports', async ({ page }) => {
		await page.goto('/v2-typography.html');

		await page.setViewportSize({ width: 320, height: 800 });
		const narrow = await page.evaluate(() => ({
			body: parseFloat(getComputedStyle(document.body).fontSize),
			h1: parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize),
		}));

		await page.setViewportSize({ width: 1280, height: 800 });
		const wide = await page.evaluate(() => ({
			body: parseFloat(getComputedStyle(document.body).fontSize),
			h1: parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize),
		}));

		expect(narrow.body).toBeCloseTo(15, 1);
		expect(wide.body).toBeCloseTo(15, 1);
		expect(narrow.h1).toBeCloseTo(wide.h1, 1);
		// h1 = step +3 = 15 × 1.2³ ≈ 25.9px
		expect(wide.h1).toBeCloseTo(25.92, 0);
	});

	test('spreading the anchors opts into fluid interpolation with dual ratios', async ({
		page,
	}) => {
		await page.goto('/v2-typography.html');

		const setFluid = () =>
			page.evaluate(() => {
				const root = document.documentElement.style;
				root.setProperty('--v-font-size-min', '1rem');
				root.setProperty('--v-font-size-max', '1.25rem');
				root.setProperty('--v-font-ratio-min', '1.2');
				root.setProperty('--v-font-ratio-max', '1.333');
			});

		const read = () =>
			page.evaluate(() => ({
				body: parseFloat(getComputedStyle(document.body).fontSize),
				h1: parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize),
			}));

		await page.setViewportSize({ width: 320, height: 800 });
		await setFluid();
		const narrow = await read();

		await page.setViewportSize({ width: 1280, height: 800 });
		await setFluid();
		const wide = await read();

		// Body sits near the min anchor when narrow, near the max when wide
		expect(narrow.body).toBeCloseTo(16, 1); // 1rem
		expect(wide.body).toBeCloseTo(20, 1); // 1.25rem
		// Dual-ratio behavior: heading→body ratio is larger at the wide viewport
		expect(wide.h1 / wide.body).toBeGreaterThan(narrow.h1 / narrow.body);
		// h1 anchors: 16 × 1.2³ ≈ 27.6 narrow, 20 × 1.333³ ≈ 47.4 wide
		expect(narrow.h1).toBeCloseTo(16 * 1.2 ** 3, 0);
		expect(wide.h1).toBeCloseTo(20 * 1.333 ** 3, 0);
	});

	test('no token falls below the readability floor in either mode', async ({ page }) => {
		await page.goto('/v2-typography.html');
		await page.setViewportSize({ width: 320, height: 800 });

		const caption = await page.evaluate(() => {
			const el = document.createElement('span');
			el.style.fontSize = 'var(--v-font-size-caption)';
			document.body.appendChild(el);
			const size = parseFloat(getComputedStyle(el).fontSize);
			el.remove();
			return size;
		});
		// Default: caption floors at 13px (pure step −1 would be 12.5px)
		expect(caption).toBeGreaterThanOrEqual(13);

		// Fluid mode: still floored at the narrow end
		await page.evaluate(() => {
			const root = document.documentElement.style;
			root.setProperty('--v-font-size-min', '0.875rem');
			root.setProperty('--v-font-size-max', '1.25rem');
		});
		const fluidCaption = await page.evaluate(() => {
			const el = document.createElement('span');
			el.style.fontSize = 'var(--v-font-size-caption)';
			document.body.appendChild(el);
			const size = parseFloat(getComputedStyle(el).fontSize);
			el.remove();
			return size;
		});
		expect(fluidCaption).toBeGreaterThanOrEqual(12.9);
	});
});
