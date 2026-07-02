import { expect, test } from '@playwright/test';

/**
 * Mobile component-CSS checks (PLAN 3.T). Note: Playwright device emulation
 * does not trigger the resolution-based hi-DPI density bump (a CSS media
 * query on dpi), so we assert the base 2rem control floor here, not the
 * 2.75rem touch bump.
 */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-components.html');
});

test('buttons and inputs meet the tap-target floor', async ({ page }) => {
	const button = await page.locator('#buttons-demo .c-button').first().boundingBox();
	expect(button!.height).toBeGreaterThanOrEqual(32);
	const input = await page.locator('#gal-input-1').boundingBox();
	expect(input!.height).toBeGreaterThanOrEqual(32);
});

test('cards keep their shadow on narrow frames (flatten is wide-only)', async ({ page }) => {
	const shadow = await page
		.locator('#cards-demo .v-surface-card')
		.evaluate((el) => getComputedStyle(el).boxShadow);
	expect(shadow).not.toBe('none');
});

test('modal opens via tap', async ({ page }) => {
	await page.locator('button[commandfor="gallery-modal"][command="show-modal"]').tap();
	await expect(page.locator('#gallery-modal')).toBeVisible();
});
