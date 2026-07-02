import { expect, test } from '@playwright/test';

/**
 * DOM-layer modal behavior (PLAN 5.T). commandfor is cross-browser at the
 * §15 minimums, so the open path is untagged.
 */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-dom.html');
});

test('opens via commandfor and closes via ESC through the request-close chain', async ({
	page,
}) => {
	const modal = page.locator('#dom-modal');
	await page.locator('#dom-modal-open').click();
	await expect(modal).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(modal).toBeHidden();
});

test('outside click closes; inside click does not', async ({ page }) => {
	const modal = page.locator('#dom-modal');
	await page.locator('#dom-modal-open').click();
	await expect(modal).toBeVisible();

	await modal.locator('.o-prose p').click();
	await expect(modal).toBeVisible();

	await page.mouse.click(4, 4); // backdrop
	await expect(modal).toBeHidden();
});

test('the close behavior button closes; focus restores to the trigger', async ({ page }) => {
	const modal = page.locator('#dom-modal');
	await page.locator('#dom-modal-open').click();
	await expect(modal).toBeVisible();

	await modal.getByRole('button', { name: 'Done' }).click();
	await expect(modal).toBeHidden();
	await expect(page.locator('#dom-modal-open')).toBeFocused();
});

test('modal dialog makes the background inert — Tab never reaches page controls', async ({
	page,
}) => {
	await page.locator('#dom-modal-open').click();
	await expect(page.locator('#dom-modal')).toBeVisible();
	for (let i = 0; i < 5; i++) {
		await page.keyboard.press('Tab');
		// Focus may pass through body between wraps, but must never land on a
		// control outside the (native, inert-enforcing) modal.
		const onBackgroundControl = await page.evaluate(() => {
			const active = document.activeElement;
			if (!active || active === document.body) return false;
			return !active.closest('#dom-modal');
		});
		expect(onBackgroundControl).toBe(false);
	}
});
