import { expect, test } from '@playwright/test';

/** Solid-layer ModalForm + ModalSpeedBump (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

const speedBumpSelector = '[data-js~="c-modal__speed-bump"]';

test('ModalForm extends the Form tokens with the modal behaviors', async ({ page }) => {
	const form = page.locator('#demo-modal-form-form');
	await expect(form).toHaveAttribute(
		'data-js',
		't-validate t-submit t-close-on-success t-reset-on-close',
	);
});

test('submit flow: success closes the modal and resets the form', async ({ page }) => {
	const modal = page.locator('#demo-modal-form');
	await page.locator('#demo-modal-form-open').click();
	await expect(modal).toBeVisible();

	await modal.getByLabel('Name').fill('Ada');
	await modal.getByRole('button', { name: 'Sign up' }).click();

	await expect(page.locator('#modal-form-output')).toHaveText('Signed up Ada');
	await expect(modal).toBeHidden();

	// t-reset-on-close: reopening shows a clean form
	await page.locator('#demo-modal-form-open').click();
	await expect(modal.getByLabel('Name')).toHaveValue('');
});

test('dirty close shows the speed bump; keep editing stays open', async ({ page }) => {
	const modal = page.locator('#demo-modal-form');
	const speedBump = modal.locator(speedBumpSelector);
	await page.locator('#demo-modal-form-open').click();
	await modal.getByLabel('Name').fill('Draft');

	await page.keyboard.press('Escape');
	await expect(speedBump).toBeVisible();
	await expect(speedBump).toContainText('You have unsaved changes.');
	await expect(modal).toBeVisible();

	await speedBump.getByRole('button', { name: 'Keep editing' }).click();
	await expect(speedBump).toBeHidden();
	await expect(modal).toBeVisible();
	await expect(modal.getByLabel('Name')).toHaveValue('Draft');
});

test('discard closes both dialogs and resets the form', async ({ page }) => {
	const modal = page.locator('#demo-modal-form');
	const speedBump = modal.locator(speedBumpSelector);
	await page.locator('#demo-modal-form-open').click();
	await modal.getByLabel('Name').fill('Draft');

	await page.keyboard.press('Escape');
	await expect(speedBump).toBeVisible();
	await speedBump.getByRole('button', { name: 'Discard' }).click();
	await expect(speedBump).toBeHidden();
	await expect(modal).toBeHidden();

	// t-reset-on-close cleared the dirty value
	await page.locator('#demo-modal-form-open').click();
	await expect(modal.getByLabel('Name')).toHaveValue('');
});

test('clean close skips the speed bump', async ({ page }) => {
	const modal = page.locator('#demo-modal-form');
	await page.locator('#demo-modal-form-open').click();
	await expect(modal).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(modal).toBeHidden();
	await expect(modal.locator(speedBumpSelector)).toBeHidden();
});
