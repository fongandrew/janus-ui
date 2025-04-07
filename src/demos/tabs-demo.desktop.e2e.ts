import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

// Test the main tabs demo on both SSR and non-SSR pages
describeComponent('tabs-demo', (getContainer) => {
	test('automatic tabs navigation with mouse clicks', async () => {
		const container = getContainer();
		const autoTabs = container.getByTestId('auto-tabs');

		// Check initial state - Tab 1 should be active
		await expect(autoTabs.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab1-content')).toBeVisible();

		// Click on Tab 2
		await autoTabs.getByRole('tab', { name: 'Tab 2' }).click();
		await expect(autoTabs.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab2-content')).toBeVisible();
		await expect(autoTabs.getByTestId('tab1-content')).not.toBeVisible();

		// Click on Tab 3
		await autoTabs.getByRole('tab', { name: 'Tab 3' }).click();
		await expect(autoTabs.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab3-content')).toBeVisible();
		await expect(autoTabs.getByTestId('tab2-content')).not.toBeVisible();

		// Click back to Tab 1
		await autoTabs.getByRole('tab', { name: 'Tab 1' }).click();
		await expect(autoTabs.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab1-content')).toBeVisible();
		await expect(autoTabs.getByTestId('tab3-content')).not.toBeVisible();
	});

	test('automatic tabs navigation with keyboard', async ({ page }) => {
		const container = getContainer();
		const autoTabs = container.getByTestId('auto-tabs');

		// Focus on Tab 1
		await autoTabs.getByRole('tab', { name: 'Tab 1' }).focus();
		await expect(autoTabs.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
			'aria-selected',
			'true',
		);

		// Press right arrow to go to Tab 2
		await page.keyboard.press('ArrowRight');
		await expect(autoTabs.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab1-content')).not.toBeVisible();
		await expect(autoTabs.getByTestId('tab2-content')).toBeVisible();

		// Press right arrow again to go to Tab 3
		await page.keyboard.press('ArrowRight');
		await expect(autoTabs.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab2-content')).not.toBeVisible();
		await expect(autoTabs.getByTestId('tab3-content')).toBeVisible();

		// Press left arrow to back to Tab 2
		await page.keyboard.press('ArrowLeft');
		await expect(autoTabs.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(autoTabs.getByTestId('tab2-content')).toBeVisible();
		await expect(autoTabs.getByTestId('tab3-content')).not.toBeVisible();
	});

	test('manual tabs navigation with mouse clicks', async () => {
		const container = getContainer();
		const manualTabs = container.getByTestId('manual-tabs');

		// Check initial state - first tab should be active
		const firstTab = manualTabs.getByRole('tab', {
			name: 'Tab with a very long long long long name',
		});
		await expect(firstTab).toHaveAttribute('aria-selected', 'true');
		await expect(manualTabs.getByTestId('manual-tab1-content')).toBeVisible();

		// Click on second tab
		await manualTabs.getByRole('tab', { name: 'Short tab' }).click();
		await expect(manualTabs.getByRole('tab', { name: 'Short tab' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await expect(manualTabs.getByTestId('manual-tab2-content')).toBeVisible();
		await expect(manualTabs.getByTestId('manual-tab1-content')).not.toBeVisible();
	});

	test('manual tabs navigation with keyboard', async ({ page }) => {
		const container = getContainer();
		const manualTabs = container.getByTestId('manual-tabs');

		// Focus on first tab
		const firstTab = manualTabs.getByRole('tab', {
			name: 'Tab with a very long long long long name',
		});
		await firstTab.focus();

		// Arrow right should focus but not select with auto=false
		await page.keyboard.press('ArrowRight');
		const secondTab = manualTabs.getByRole('tab', { name: 'Short tab' });
		await expect(secondTab).toBeFocused();
		await expect(manualTabs.getByTestId('manual-tab2-content')).not.toBeVisible();

		// Press Enter to select the tab
		await page.keyboard.press('Enter');
		await expect(secondTab).toHaveAttribute('aria-selected', 'true');
		await expect(manualTabs.getByTestId('manual-tab1-content')).not.toBeVisible();
		await expect(manualTabs.getByTestId('manual-tab2-content')).toBeVisible();
	});
});

// Test the persistence tabs demo only on non-SSR page
describeComponent(['/' /* no SSR test */], 'tabs-persistence-demo', (getContainer) => {
	test('persisted tabs maintain input values', async () => {
		const container = getContainer();

		// First tab is the persisted tab
		const persistTab = container.getByRole('tab', { name: 'Persist', exact: true });
		const nonPersistTab = container.getByRole('tab', { name: "Don't Persist", exact: true });

		// Enter values in the first tab's inputs
		await container.getByTestId('persist-input-1').fill('test value 1');
		await container.getByTestId('persist-input-2').fill('test value 2');

		// Switch to the second tab
		await nonPersistTab.click();
		await expect(nonPersistTab).toHaveAttribute('aria-selected', 'true');

		// Enter values in the second tab's inputs
		await container.getByTestId('non-persist-input-1').fill('hello value');
		await container.getByTestId('non-persist-input-2').fill('world value');

		// Switch back to the first tab and check values are preserved
		await persistTab.click();
		await expect(persistTab).toHaveAttribute('aria-selected', 'true');
		await expect(container.getByTestId('persist-input-1')).toHaveValue('test value 1');
		await expect(container.getByTestId('persist-input-2')).toHaveValue('test value 2');

		// Switch to the second tab again
		// The non-persisted tab should have empty inputs due to persist={false}
		await nonPersistTab.click();
		await expect(container.getByTestId('non-persist-input-1')).toHaveValue('');
		await expect(container.getByTestId('non-persist-input-2')).toHaveValue('');
	});
});
