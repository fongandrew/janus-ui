import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('empty-state-demo', (getContainer) => {
	test('renders empty state', async () => {
		const container = getContainer();
		const emptyState = container.locator('.o-empty-state');
		await expect(emptyState).toBeVisible();
	});
});
