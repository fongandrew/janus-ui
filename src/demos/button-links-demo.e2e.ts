import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('button-links-demo', (getContainer) => {
	test('renders all button link variants', async () => {
		const container = getContainer();

		// Check all link variants with their text content
		const defaultLink = container.getByRole('link', { name: 'Default' });
		await expect(defaultLink).toBeVisible();
		await expect(defaultLink).toHaveAttribute('href', '#');

		const primaryLink = container.getByRole('link', { name: 'Primary' });
		await expect(primaryLink).toBeVisible();
		await expect(primaryLink).toHaveAttribute('href', '#');

		const ghostLink = container.getByRole('link', { name: 'Ghost' });
		await expect(ghostLink).toBeVisible();
		await expect(ghostLink).toHaveAttribute('href', '#');

		// Check the long text link
		const longTextLink = container.getByRole('link', { name: /Some very long text/ });
		await expect(longTextLink).toBeVisible();
		await expect(longTextLink).toHaveAttribute('href', '#');
	});
});
