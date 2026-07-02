import { expect, test } from '@playwright/test';

const GALLERY = '/site/components.html';

test.describe('Phase 3 components (mobile)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(GALLERY);
	});

	test('buttons and inputs meet the 44px touch-target minimum', async ({ page }) => {
		// The hi-DPI density gate raises --v-input-height to 2.75rem (44px) on
		// dense/mobile screens, so controls clear the 44px tap target.
		const btn = await page.getByTestId('modal-trigger').boundingBox();
		expect(btn!.height).toBeGreaterThanOrEqual(44);

		const input = await page.getByTestId('input-default').boundingBox();
		expect(input!.height).toBeGreaterThanOrEqual(44);
	});
});
