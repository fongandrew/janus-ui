import { expect, test } from '@playwright/test';

/*
	Phase 1 token-layer tests (PLAN 1.T). Target the framework-free Variables and
	Typography doc pages — the CSS-review artifacts — and assert that every knob
	resolves, that type ships FIXED by default (but the fluid path is wired), and that
	base elements + light/dark switching apply.
*/

const VARIABLES_URL = '/lib2-variables.html';
const TYPOGRAPHY_URL = '/lib2-typography.html';

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

test('every primary and secondary knob resolves to a non-empty value', async ({ page }) => {
	await page.goto(VARIABLES_URL);

	const resolved = await page.evaluate(
		(names) => {
			const cs = getComputedStyle(document.documentElement);
			return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
		},
		[...PRIMARY_KNOBS, ...SECONDARY_KNOBS],
	);

	for (const name of [...PRIMARY_KNOBS, ...SECONDARY_KNOBS]) {
		expect(resolved[name], `${name} should resolve`).toBeTruthy();
	}

	// A few should be concrete, recognizable values.
	expect(resolved['--v-spacing']).toBe('1rem');
	expect(resolved['--v-font-size']).toContain('clamp');
	expect(resolved['--v-font-size-h1']).toContain('clamp');
	expect(resolved['--v-fg']).toContain('oklch');
});

test('type is FIXED by default — body and h1 are identical at narrow and wide viewports', async ({
	page,
}) => {
	await page.goto(VARIABLES_URL);

	const measure = async (width: number) => {
		await page.setViewportSize({ width, height: 900 });
		return page.evaluate(() => {
			const body = getComputedStyle(document.body).fontSize;
			const h1 = getComputedStyle(document.querySelector('h1')!).fontSize;
			return { body: parseFloat(body), h1: parseFloat(h1) };
		});
	};

	const narrow = await measure(320); // ≈ --v-viewport-min
	const wide = await measure(1280); // ≈ --v-viewport-max

	expect(narrow.body).toBeCloseTo(wide.body, 1);
	expect(narrow.h1).toBeCloseTo(wide.h1, 1);
	// Body resolves to ~15px (0.9375rem) at both ends.
	expect(narrow.body).toBeCloseTo(15, 0);
	// The readability floor never pushes a token below ~13px.
	expect(narrow.body).toBeGreaterThanOrEqual(13);
});

test('the fluid path is wired — spreading the anchors interpolates and widens the ramp', async ({
	page,
}) => {
	await page.goto(VARIABLES_URL);

	// Spread the anchors on :root so --v-font-size recomputes against them.
	await page.evaluate(() => {
		const s = document.documentElement.style;
		s.setProperty('--v-font-size-min', '1rem');
		s.setProperty('--v-font-size-max', '1.25rem');
		s.setProperty('--v-font-ratio-min', '1.2');
		s.setProperty('--v-font-ratio-max', '1.4');
	});

	const measure = async (width: number) => {
		await page.setViewportSize({ width, height: 900 });
		return page.evaluate(() => {
			const body = parseFloat(getComputedStyle(document.body).fontSize);
			const h1 = parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize);
			return { body, h1, ratio: h1 / body };
		});
	};

	const narrow = await measure(320);
	const wide = await measure(1280);

	// Body sits near the min anchor when narrow and the (larger) max anchor when wide.
	expect(wide.body).toBeGreaterThan(narrow.body + 1);
	expect(narrow.body).toBeCloseTo(16, 0);
	expect(wide.body).toBeCloseTo(20, 0);
	// Dual-ratio: heading→body ratio is larger at the wide viewport.
	expect(wide.ratio).toBeGreaterThan(narrow.ratio);
	// No token falls below the readability floor at the narrow end.
	expect(narrow.body).toBeGreaterThanOrEqual(13);
});

test('light/dark switching changes the resolved bg and fg colors', async ({ page }) => {
	await page.goto(VARIABLES_URL);

	const read = () =>
		page.evaluate(() => ({
			bg: getComputedStyle(document.getElementById('swatch-bg')!).backgroundColor,
			fg: getComputedStyle(document.getElementById('swatch-fg')!).backgroundColor,
		}));

	await page.evaluate(() =>
		document.documentElement.setAttribute('data-v-color-scheme', 'light'),
	);
	const light = await read();

	await page.evaluate(() => document.documentElement.setAttribute('data-v-color-scheme', 'dark'));
	const dark = await read();

	expect(dark.bg).not.toBe(light.bg);
	expect(dark.fg).not.toBe(light.fg);
});

test('base elements are styled — heading sizes decrease, links use --v-link, body has a bg', async ({
	page,
}) => {
	await page.goto(TYPOGRAPHY_URL);

	const sizes = await page.evaluate(() => {
		const px = (sel: string) =>
			parseFloat(getComputedStyle(document.querySelector(sel)!).fontSize);
		return { h1: px('#headings h1'), h2: px('#headings h2'), h3: px('#headings h3') };
	});
	expect(sizes.h1).toBeGreaterThan(sizes.h2);
	expect(sizes.h2).toBeGreaterThan(sizes.h3);

	const link = await page.evaluate(() => {
		const a = document.querySelector('#prose a')!;
		const p = a.closest('p')!;
		return {
			linkColor: getComputedStyle(a).color,
			textColor: getComputedStyle(p).color,
		};
	});
	expect(link.linkColor).not.toBe(link.textColor);

	const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
	expect(bodyBg).toContain('gradient');
});
