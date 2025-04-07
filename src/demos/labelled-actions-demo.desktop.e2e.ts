import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('labelled-actions-demo', (getContainer) => {
	test('clicking label focuses button', async () => {
		const container = getContainer();

		const firstLabel = container.getByText('Do the thing', { exact: true });
		const firstButton = container.getByRole('button', { name: 'Do the Thing' });

		await firstLabel.click();
		await expect(firstButton).toBeFocused();
	});

	test('clicking label focuses toggle', async () => {
		const container = getContainer();

		const thirdLabel = container.getByText('Turn on the thing', { exact: true });
		const toggleSwitch = container.getByRole('switch');

		await thirdLabel.click();
		await expect(toggleSwitch).toBeFocused();
	});
});
