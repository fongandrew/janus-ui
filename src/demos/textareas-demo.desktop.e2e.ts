import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('textareas-demo', (getContainer) => {
	test('renders textarea variations', async () => {
		const container = getContainer();

		// Default textarea
		const defaultTextarea = container.getByLabel('Default');
		await expect(defaultTextarea).toBeVisible();

		// Error state textarea
		const errorTextarea = container.getByLabel('Error');
		await expect(errorTextarea).toBeVisible();
		await expect(errorTextarea).toHaveAttribute('aria-invalid', 'true');
	});

	test('disabled textarea prevents editing', async ({ page }) => {
		const container = getContainer();
		const disabledTextarea = container.getByLabel('Disabled');

		await expect(disabledTextarea).toBeVisible();
		await expect(disabledTextarea).toHaveAttribute('aria-disabled', 'true');

		// Try to focus and type - should not change value
		await disabledTextarea.focus();
		await page.keyboard.type('This should not appear');
		await expect(disabledTextarea).toHaveValue('');
	});
});
