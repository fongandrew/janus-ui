import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent(['/'], 'suspense-demo', (getContainer) => {
	test('shows loading state when Card Load button is clicked', async () => {
		const container = getContainer();

		// Click the Card Load button to trigger suspense
		const cardLoadButton = container.getByRole('button', { name: 'Card Load' });
		await cardLoadButton.click();

		// Card should show loading state with "Loading…" text in a status role
		const loadingStatus = container.getByRole('status').getByText('Loading…');
		await expect(loadingStatus).toBeVisible();

		// After the loading timeout (1000ms + buffer), the loading state should be gone
		await expect(loadingStatus).not.toBeVisible({ timeout: 3000 });
	});

	test('shows loading state when Page Load button is clicked', async ({ page }) => {
		const container = getContainer();

		// Click the Page Load button to trigger suspense
		const pageLoadButton = container.getByRole('button', { name: 'Page Load' });
		await pageLoadButton.click();

		// Page should show loading state with "Loading…" text in a status role
		const loadingStatus = page.getByRole('status').getByText('Loading…');
		await expect(loadingStatus).toBeVisible();

		// After the loading timeout, the loading state should be gone
		await expect(loadingStatus).not.toBeVisible({ timeout: 3000 });
	});

	test('shows inline loading state when inline link button is clicked', async () => {
		const container = getContainer();

		// Find the inline link button
		const inlineLoadButton = container.getByRole('button', { name: 'Click to trigger load' });

		// Click to trigger loading state
		await inlineLoadButton.click();

		// Inline suspense should show loading state with aria-label
		const inlinePlaceholder = container.locator('[aria-label="Loading…"]');
		await expect(inlinePlaceholder).toBeVisible();

		// After the loading timeout, the loading state should be gone
		await expect(inlinePlaceholder).not.toBeVisible({ timeout: 3000 });
	});

	test('shows loading state in modal when Modal Load button is clicked', async () => {
		const container = getContainer();

		// Click the Modal Load button to open modal with suspense
		const modalLoadButton = container.getByRole('button', { name: 'Modal Load' });
		await modalLoadButton.click();

		// Modal should be visible
		const modal = container.getByRole('dialog');
		await expect(modal).toBeVisible();

		// Modal should show loading state with "Loading…" text in a status role
		const modalLoadingStatus = modal.getByRole('status').getByText('Loading…');
		await expect(modalLoadingStatus).toBeVisible();

		// After the loading timeout, the loading state should be gone but modal remains
		await expect(modalLoadingStatus).not.toBeVisible({ timeout: 3000 });
		await expect(modal).toBeVisible();

		// Should be able to close the modal
		await modal.getByRole('button', { name: 'Close' }).nth(0).click();
		await expect(modal).not.toBeVisible();
	});
});
