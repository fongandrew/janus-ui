import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('badge-and-count-demo', (getContainer) => {
	test('renders all badge variations', async () => {
		const container = getContainer();

		await expect(container.getByTestId('generic-badge')).toBeVisible();
		await expect(container.getByTestId('generic-badge')).toHaveText('Badge');

		await expect(container.getByTestId('primary-badge')).toBeVisible();
		await expect(container.getByTestId('primary-badge')).toHaveText('Primary');

		await expect(container.getByTestId('danger-badge')).toBeVisible();
		await expect(container.getByTestId('danger-badge')).toHaveText('Danger');

		await expect(container.getByTestId('warning-badge')).toBeVisible();
		await expect(container.getByTestId('warning-badge')).toHaveText('Warning');

		await expect(container.getByTestId('success-badge')).toBeVisible();
		await expect(container.getByTestId('success-badge')).toHaveText('Success');
	});

	test('renders counts with correct values and truncation', async () => {
		const container = getContainer();

		// Normal counts (not truncated)
		await expect(container.getByTestId('count-1')).toHaveText('1');
		await expect(container.getByTestId('count-1')).toHaveAttribute('aria-label', '1 item');

		// Truncated counts based on digits
		await expect(container.getByTestId('count-10')).toHaveText('9+');
		await expect(container.getByTestId('count-10')).toHaveAttribute('aria-label', '9+ items');

		await expect(container.getByTestId('count-12-2digits')).toHaveText('12');
		await expect(container.getByTestId('count-12-2digits')).toHaveAttribute(
			'aria-label',
			'12 items',
		);

		await expect(container.getByTestId('count-100-2digits')).toHaveText('99+');
		await expect(container.getByTestId('count-100-2digits')).toHaveAttribute(
			'aria-label',
			'99+ items',
		);

		await expect(container.getByTestId('count-125-3digits')).toHaveText('125');
		await expect(container.getByTestId('count-125-3digits')).toHaveAttribute(
			'aria-label',
			'125 items',
		);

		await expect(container.getByTestId('count-1000-3digits')).toHaveText('999+');
		await expect(container.getByTestId('count-1000-3digits')).toHaveAttribute(
			'aria-label',
			'999+ items',
		);
	});
});
