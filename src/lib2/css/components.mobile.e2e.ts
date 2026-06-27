/*
	Phase 3 component-CSS E2E (mobile). On a touch device the hi-DPI density branch
	(resolution >= 200dpi, §6.4) lifts --v-input-height to 2.75rem, so controls meet the
	44px minimum tap target. Runs on the chromium-mobile (Pixel 7) and webkit-mobile
	(iPhone 15) projects.
*/
import { expect, test } from '@playwright/test';

const URL = '/v2-components.html';
const MIN_TAP = 43.5; // 2.75rem = 44px; allow sub-pixel slack.

test('buttons meet the minimum tap target on touch', async ({ page }) => {
	await page.goto(URL);
	const btn = await page.locator('#buttons .c-button').first().boundingBox();
	expect(btn!.height).toBeGreaterThanOrEqual(MIN_TAP);
});

test('inputs and selects meet the minimum tap target on touch', async ({ page }) => {
	await page.goto(URL);
	const input = await page.locator('#inputs .c-input').first().boundingBox();
	expect(input!.height).toBeGreaterThanOrEqual(MIN_TAP);

	const select = await page.locator('#inputs .c-select-native').first().boundingBox();
	expect(select!.height).toBeGreaterThanOrEqual(MIN_TAP);
});

test('toggle is a full-height tap target on touch', async ({ page }) => {
	await page.goto(URL);
	const toggle = await page.locator('#checks .c-toggle').first().boundingBox();
	expect(toggle!.height).toBeGreaterThanOrEqual(MIN_TAP);
});
