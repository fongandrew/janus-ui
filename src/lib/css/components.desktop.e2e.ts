import { expect, test } from '@playwright/test';

const HARNESS = '/src/lib/css/test-harness.html';

test.describe('CSS components', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(HARNESS);
	});

	test('c-button has correct padding and border-radius', async ({
		page,
	}) => {
		const styles = await page.evaluate(() => {
			const btn = document.querySelector('.c-button');
			if (!btn) return null;
			const s = getComputedStyle(btn);
			return {
				paddingTop: s.paddingTop,
				borderRadius: s.borderRadius,
			};
		});
		expect(styles).not.toBeNull();
		expect(parseFloat(styles!.borderRadius)).toBeGreaterThan(0);
	});

	test('c-button--icon is square', async ({ page }) => {
		const dims = await page.evaluate(() => {
			const btn = document.querySelector('.c-button--icon');
			if (!btn) return null;
			const rect = btn.getBoundingClientRect();
			return { width: rect.width, height: rect.height };
		});
		expect(dims).not.toBeNull();
		expect(dims!.width).toBeCloseTo(dims!.height, 0);
	});

	test('tonal variant buttons change background color', async ({
		page,
	}) => {
		const colors = await page.evaluate(() => {
			const def = document.querySelector('.c-button:not([class*="v-colors"])');
			const primary = document.querySelector(
				'.c-button.v-colors-primary',
			);
			if (!def || !primary) return null;
			return {
				default: getComputedStyle(def).backgroundColor,
				primary: getComputedStyle(primary).backgroundColor,
			};
		});
		expect(colors).not.toBeNull();
		expect(colors!.default).not.toBe(colors!.primary);
	});

	test('c-card has border', async ({ page }) => {
		const styles = await page.evaluate(() => {
			const card = document.querySelector('.c-card');
			if (!card) return null;
			const s = getComputedStyle(card);
			return {
				borderWidth: s.borderTopWidth,
				borderColor: s.borderTopColor,
			};
		});
		expect(styles).not.toBeNull();
		expect(parseFloat(styles!.borderWidth)).toBeGreaterThan(0);
	});

	test('c-input has inner shadow', async ({ page }) => {
		const shadow = await page.evaluate(() => {
			const input = document.querySelector('.c-input');
			return input ? getComputedStyle(input).boxShadow : 'none';
		});
		expect(shadow).toContain('inset');
	});

	test('c-input invalid state shows border', async ({ page }) => {
		const borderColor = await page.evaluate(() => {
			const input = document.querySelector(
				'input[aria-invalid="true"]',
			);
			return input ? getComputedStyle(input).borderColor : '';
		});
		expect(borderColor).not.toBe('');
		expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
	});

	test('c-checkbox checked shows accent color', async ({ page }) => {
		const bg = await page.evaluate(() => {
			const cb = document.querySelector(
				'.c-checkbox input[type="checkbox"]:checked',
			);
			return cb ? getComputedStyle(cb).backgroundColor : '';
		});
		expect(bg).not.toBe('');
		expect(bg).not.toBe('rgba(0, 0, 0, 0)');
	});

	test('c-toggle checked slides thumb', async ({ page }) => {
		const transform = await page.evaluate(() => {
			const toggle = document.querySelector(
				'.c-toggle input[type="checkbox"]:checked',
			);
			if (!toggle) return '';
			const after = getComputedStyle(toggle, '::after');
			return after.transform;
		});
		expect(transform).not.toBe('none');
	});

	test('alerts have different colors per variant', async ({ page }) => {
		const colors = await page.evaluate(() => {
			const alerts = document.querySelectorAll('.c-alert');
			return Array.from(alerts).map(
				(a) => getComputedStyle(a).backgroundColor,
			);
		});
		expect(colors.length).toBeGreaterThanOrEqual(4);
		const unique = new Set(colors);
		expect(unique.size).toBeGreaterThan(1);
	});

	test('c-disclosure arrow rotates when open', async ({ page }) => {
		const details = page.locator('.c-disclosure');
		const summary = details.locator('summary');

		await summary.click();

		const isOpen = await details.getAttribute('open');
		expect(isOpen).not.toBeNull();
	});

	test('c-tabs selected tab has indicator', async ({ page }) => {
		const shadow = await page.evaluate(() => {
			const tab = document.querySelector(
				'.c-tabs__tab[aria-selected="true"]',
			);
			return tab ? getComputedStyle(tab).boxShadow : 'none';
		});
		expect(shadow).not.toBe('none');
	});

	test('c-spinner animates', async ({ page }) => {
		const animation = await page.evaluate(() => {
			const spinner = document.querySelector('.c-spinner');
			return spinner
				? getComputedStyle(spinner).animationName
				: 'none';
		});
		expect(animation).not.toBe('none');
	});

	test('c-skeleton has shimmer animation', async ({ page }) => {
		const animation = await page.evaluate(() => {
			const skel = document.querySelector('.c-skeleton');
			return skel ? getComputedStyle(skel).animationName : 'none';
		});
		expect(animation).not.toBe('none');
	});
});
