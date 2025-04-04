import { type Locator, test } from '@playwright/test';

const { describe, beforeEach, expect } = test;

describe('Checkbox Component', () => {
	let demoContainer: Locator;

	beforeEach(async ({ page }) => {
		// Navigate to the demo page with checkboxes
		await page.goto('/');

		// Find the checkbox demo section
		demoContainer = page.locator('#checkboxes-demo');
		await demoContainer.scrollIntoViewIfNeeded();
	});

	test('renders unchecked checkboxes correctly', async () => {
		// Find an unchecked checkbox
		const uncheckedBox = demoContainer.getByRole('checkbox', { name: /unchecked/i });

		// Verify it's not checked
		await expect(uncheckedBox).not.toBeChecked();
	});

	test('renders checked checkboxes correctly', async () => {
		// Find a checked checkbox
		const checkedBox = demoContainer.getByRole('checkbox', { name: /checked/i });

		// Verify it's checked
		await expect(checkedBox).toBeChecked();
	});

	test('allows toggling checkbox state', async () => {
		// Find an unchecked checkbox
		const checkbox = demoContainer.getByRole('checkbox', { name: /unchecked/i });

		// Initial state
		await expect(checkbox).not.toBeChecked();

		// Click to toggle
		await checkbox.click();

		// Should now be checked
		await expect(checkbox).toBeChecked();

		// Click again to toggle back
		await checkbox.click();

		// Should be unchecked again
		await expect(checkbox).not.toBeChecked();
	});

	test('renders indeterminate state correctly', async () => {
		// Find an indeterminate checkbox if available (may need different selector based on your demo)
		const indeterminateBox = demoContainer.getByRole('checkbox', { name: /indeterminate/i });

		// Verify indeterminate property
		const isIndeterminate = await indeterminateBox.evaluate(
			(el: HTMLInputElement) => el.indeterminate,
		);
		expect(isIndeterminate).toBeTruthy();
	});
});
