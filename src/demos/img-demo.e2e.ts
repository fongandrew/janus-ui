import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('img-demo', (getContainer) => {
	test('renders images', async () => {
		const container = getContainer();
		const images = container.getByRole('img').filter({ visible: true }).all();
		expect((await images).length).toBe(2);
	});

	test('displays broken image state', async () => {
		const container = getContainer();
		const error = await container
			.getByLabel('Image failed to load')
			.filter({ visible: true })
			.all();
		expect(error).toHaveLength(1);
	});
});
