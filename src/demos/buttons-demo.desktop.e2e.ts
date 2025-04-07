import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('buttons-demo', (getContainer) => {
	test('renders all button variations', async () => {
		const container = getContainer();

		// Check for button sizes within the container
		await expect(container.getByRole('button', { name: /small button/i })).toBeVisible();
		await expect(container.getByRole('button', { name: /default button/i })).toBeVisible();
		await expect(container.getByRole('button', { name: /large button/i })).toBeVisible();

		// Check for button colors/variants
		await expect(container.getByRole('button', { name: 'Primary' })).toBeVisible();
		await expect(container.getByRole('button', { name: 'Danger' })).toBeVisible();
		await expect(container.getByRole('button', { name: 'Ghost' })).toBeVisible();
		await expect(container.getByRole('button', { name: 'Link' })).toBeVisible();

		// Check for disabled state
		await expect(container.getByRole('button', { name: 'Disabled' })).toBeDisabled();

		// Check for icon buttons
		await expect(container.getByRole('button', { name: 'Settings' })).toBeVisible();
		await expect(container.getByRole('button', { name: 'More options' })).toBeVisible();
	});
});
