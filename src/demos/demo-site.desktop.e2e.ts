import { expect, test } from '@playwright/test';

test.describe('Demo Site', () => {
	test('home page loads without errors', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Janus UI');
	});

	test('navigation between pages works', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Components' }).click();
		await expect(page.locator('h1')).toContainText('Components');

		await page.getByRole('button', { name: 'Typography' }).click();
		await expect(page.locator('h1')).toContainText('Typography');

		await page.getByRole('button', { name: 'Home' }).click();
		await expect(page.locator('h1')).toContainText('Janus UI');
	});

	test('components page renders all demo cards', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Components' }).click();

		await expect(page.locator('#buttons-demo')).toBeVisible();
		await expect(page.locator('#cards-demo')).toBeVisible();
		await expect(page.locator('#alerts-demo')).toBeVisible();
		await expect(page.locator('#inputs-demo')).toBeVisible();
		await expect(page.locator('#tabs-demo')).toBeVisible();
		await expect(page.locator('#modals-demo')).toBeVisible();
	});

	test('tabs demo switches tabs on click', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Components' }).click();

		const tabsDemo = page.locator('#tabs-demo');
		await tabsDemo.scrollIntoViewIfNeeded();

		const tab2 = tabsDemo.getByRole('tab', { name: 'Tab 2' });
		await tab2.click();
		await expect(tabsDemo.locator('#panel-2')).not.toHaveAttribute('hidden', '');
	});

	test('modal demo opens and closes', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Components' }).click();

		const modalsDemo = page.locator('#modals-demo');
		await modalsDemo.scrollIntoViewIfNeeded();

		await modalsDemo.getByRole('button', { name: 'Open Modal' }).click();
		await expect(page.locator('dialog')).toBeVisible();

		await page.locator('dialog').getByRole('button', { name: 'Close' }).click();
		await expect(page.locator('dialog')).not.toBeVisible();
	});
});
