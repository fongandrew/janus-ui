import { expect, test } from '@playwright/test';

/** Solid-layer Modal (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('renders the documented classes and behavior tokens', async ({ page }) => {
	const modal = page.locator('#demo-modal');
	await expect(modal).toHaveClass(/c-modal/);
	await expect(modal).toHaveClass(/o-dialog/);
	await expect(modal).toHaveAttribute(
		'data-js',
		't-request-close t-restore-focus t-scroll-shadow',
	);
});

test('opens via commandfor; ESC closes and fires onClose', async ({ page }) => {
	const modal = page.locator('#demo-modal');
	await page.locator('#demo-modal-open').click();
	await expect(modal).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(modal).toBeHidden();
	await expect(page.locator('#modal-close-count')).toHaveText('1');
});

test('outside click closes; inside click does not', async ({ page }) => {
	const modal = page.locator('#demo-modal');
	await page.locator('#demo-modal-open').click();
	await expect(modal).toBeVisible();

	await modal.locator('.o-prose p').click();
	await expect(modal).toBeVisible();

	await page.mouse.click(4, 4); // backdrop
	await expect(modal).toBeHidden();
});

test('ModalCloseButton closes through the chain; focus restores to the trigger', async ({
	page,
}) => {
	const modal = page.locator('#demo-modal');
	await page.locator('#demo-modal-open').click();
	await expect(modal).toBeVisible();

	await modal.getByRole('button', { name: 'Close' }).click();
	await expect(modal).toBeHidden();
	await expect(page.locator('#demo-modal-open')).toBeFocused();
	await expect(page.locator('#modal-close-count')).toHaveText('1');
});

test('modal keeps the background inert — Tab never reaches page controls', async ({ page }) => {
	await page.locator('#demo-modal-open').click();
	await expect(page.locator('#demo-modal')).toBeVisible();
	for (let i = 0; i < 5; i++) {
		await page.keyboard.press('Tab');
		const onBackgroundControl = await page.evaluate(() => {
			const active = document.activeElement;
			if (!active || active === document.body) return false;
			return !active.closest('#demo-modal');
		});
		expect(onBackgroundControl).toBe(false);
	}
});

test('drawers open from each side and close', async ({ page }) => {
	const left = page.locator('#demo-drawer-left');
	await expect(left).toHaveClass(/c-drawer--left/);
	await page.locator('#demo-drawer-left-open').click();
	await expect(left).toBeVisible();
	await left.getByRole('button', { name: 'Close' }).click();
	await expect(left).toBeHidden();

	const right = page.locator('#demo-drawer-right');
	await expect(right).toHaveClass(/c-drawer--right/);
	await page.locator('#demo-drawer-right-open').click();
	await expect(right).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(right).toBeHidden();
});
