import { expect, test } from '@playwright/test';

/**
 * Tools-layer E2E tests (PLAN 3.T). Targets: the Tools page and the Colors
 * contrast grid.
 */

test.describe('tools page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/v2-tools.html');
	});

	test('t-truncate clips on one axis without spawning a scroll container', async ({ page }) => {
		const span = page.locator('#tool-t-truncate-span');
		const state = await span.evaluate((el) => {
			const style = getComputedStyle(el);
			return {
				overflowX: style.overflowX,
				overflowY: style.overflowY,
				clipped: el.scrollWidth > el.clientWidth,
				whiteSpace: style.whiteSpace,
			};
		});
		expect(state.overflowX).toBe('clip');
		// The §11.1 claim: clip does NOT force the other axis to auto
		expect(state.overflowY).toBe('visible');
		expect(state.whiteSpace).toBe('nowrap');
		expect(state.clipped).toBe(true);
	});

	test('t-hidden removes from layout; t-sr-only collapses to 1px', async ({ page }) => {
		await expect(page.locator('#tool-t-hidden-box')).toBeHidden();
		const srBox = await page.locator('#tool-t-sr-only-span').boundingBox();
		expect(srBox!.width).toBeLessThanOrEqual(1);
	});

	test('t-p-0 zeros an o-box padding; t-radius toggles override the knob', async ({ page }) => {
		const padded = await page.evaluate(
			() => getComputedStyle(document.querySelector('#tool-t-p-0')!).paddingTop,
		);
		expect(parseFloat(padded)).toBe(0);

		const none = await page.evaluate(
			() => getComputedStyle(document.querySelector('#tool-t-radius-none-box')!).borderRadius,
		);
		expect(parseFloat(none)).toBe(0);
		const full = await page.evaluate(
			() => getComputedStyle(document.querySelector('#tool-t-radius-full-box')!).borderRadius,
		);
		expect(parseFloat(full)).toBeGreaterThan(100);
	});

	test('t-col-span-full spans the whole grid', async ({ page }) => {
		const grid = await page.locator('#tool-t-col-span-grid').boundingBox();
		const item = await page.locator('#tool-t-col-span-item').boundingBox();
		expect(item!.width).toBeGreaterThan(grid!.width * 0.9);
	});
});

test.describe('colors contrast grid', () => {
	test('renders every variant cell with an APCA score', async ({ page }) => {
		await page.goto('/v2-colors.html');
		const cells = page.locator('.p-contrast-cell');
		// 13 variants × light + dark
		await expect(cells).toHaveCount(26);
		const chips = page.locator('.p-lc-chip');
		expect(await chips.count()).toBeGreaterThanOrEqual(26 * 3);
		await expect(chips.first()).toHaveText(/Lc\s*\d+/);
	});
});
