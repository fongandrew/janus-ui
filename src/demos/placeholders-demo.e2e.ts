import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('placeholders-demo', (getContainer) => {
	test('renders placeholder components correctly', async () => {
		const container = getContainer();

		// Check that the container itself is visible
		await expect(container).toBeVisible();
	});
});
