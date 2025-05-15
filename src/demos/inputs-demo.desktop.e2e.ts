import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('inputs-demo', (getContainer) => {
	test('renders input state variations correctly', async () => {
		const container = getContainer();

		// Default input
		const defaultInput = container.getByLabel('Default input');
		await expect(defaultInput).toBeVisible();
		await expect(defaultInput).toHaveAttribute('placeholder', 'Placeholder content');
		await expect(defaultInput).toHaveAttribute('aria-invalid', 'false');

		// Error state input
		const errorInput = container.getByLabel('Error state input');
		await expect(errorInput).toBeVisible();
		await expect(errorInput).toHaveAttribute('placeholder', 'Some wrong value');
		await expect(errorInput).toHaveAttribute('aria-invalid', 'true');
	});

	test('focuses input when label is clicked', async () => {
		const container = getContainer();
		const defaultInput = container.getByLabel('Default input');

		// Click the label
		const label = container.getByText('Default input');
		await label.click();
		await expect(defaultInput).toBeFocused();
	});

	test('renders disabled input correctly', async ({ page }) => {
		const container = getContainer();
		const disabledInput = container.getByLabel('Disabled input');

		// Verify disabled input is focusable but not editable
		await disabledInput.focus();
		await page.keyboard.press('A');
		await expect(disabledInput).toHaveValue('');
		await expect(disabledInput).toHaveAttribute('aria-disabled', 'true');
	});
});

describeComponent('date-time-inputs-demo', (getContainer) => {
	test('renders different inputs with correct types', async () => {
		const container = getContainer();

		await expect(container.locator('input[type="date"]')).toBeVisible();
		await expect(container.locator('input[type="time"]')).toBeVisible();
		await expect(container.locator('input[type="datetime-local"]')).toBeVisible();
		await expect(container.locator('input[type="week"]')).toBeVisible();
		await expect(container.locator('input[type="month"]')).toBeVisible();
	});
});

describeComponent('text-input-variations-demo', (getContainer) => {
	test('renders different inputs with correct types', async () => {
		const container = getContainer();

		await expect(container.locator('input[type="email"]')).toBeVisible();
		await expect(container.locator('input[type="number"]')).toBeVisible();
		await expect(container.locator('input[type="password"]')).toBeVisible();
		await expect(container.locator('input[type="tel"]')).toBeVisible();
		await expect(container.locator('input[type="search"]')).toBeVisible();
		await expect(container.locator('input[type="url"]')).toBeVisible();
	});

	test('validates email and URL inputs', async () => {
		const container = getContainer();

		// Test invalid email
		const emailInput = container.getByLabel('Email input');
		await emailInput.fill('invalid-email');
		await emailInput.blur();
		await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByRole('alert')).toBeVisible();

		// Test valid email
		await emailInput.fill('valid@example.com');
		await emailInput.blur();
		await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByRole('alert')).not.toBeVisible();

		// Test invalid URL
		const urlInput = container.getByLabel('URL input');
		await urlInput.fill('invalid-url');
		await urlInput.blur();
		await expect(urlInput).toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByRole('alert')).toBeVisible();

		// Test valid URL
		await urlInput.fill('https://example.com');
		await urlInput.blur();
		await expect(urlInput).not.toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByRole('alert')).not.toBeVisible();
	});
});

describeComponent('misc-input-variations-demo', (getContainer) => {
	test('renders miscellaneous input types correctly', async () => {
		const container = getContainer();

		// Color picker
		const colorInput = container.getByLabel('Color input', { exact: true });
		await expect(colorInput).toBeVisible();
		await expect(colorInput).toHaveAttribute('type', 'color');

		// File input
		const fileInput = container.getByLabel('File input', { exact: true });
		await expect(fileInput).toBeVisible();
		await expect(fileInput).toHaveAttribute('type', 'file');

		// Slider input
		const rangeInput = container.getByLabel('Range / slider input', { exact: true });
		await expect(rangeInput).toBeVisible();
		await expect(rangeInput).toHaveAttribute('type', 'number');
	});

	test('focuses inputs on label click', async () => {
		const container = getContainer();

		// Color picker
		const colorInput = container.getByLabel('Color input', { exact: true });
		await expect(colorInput).toBeVisible();
		await expect(colorInput).toHaveAttribute('type', 'color');

		const colorLabel = container.getByText('Color input', { exact: true });
		await colorLabel.click();
		await expect(colorInput).toBeFocused();

		// File input
		const fileInput = container.getByLabel('File input', { exact: true });
		await expect(fileInput).toBeVisible();
		await expect(fileInput).toHaveAttribute('type', 'file');

		const fileLabel = container.getByText('File input', { exact: true });
		await fileLabel.click();
		await expect(fileInput).toBeFocused();

		// Slider input
		const sliderInput = container.getByLabel('Range / slider input', { exact: true });
		await expect(sliderInput).toBeVisible();
		await expect(sliderInput).toHaveAttribute('type', 'number');

		const sliderLabel = container.getByText('Range / slider input', { exact: true });
		await sliderLabel.click();
		await expect(sliderInput).toBeFocused();
	});

	test('synchronizes values in dual slider inputs', async ({ page }) => {
		const container = getContainer();

		const rangeInput = container.locator('input[type="range"]').nth(0);
		const numberInput = container.locator('input[type="number"]').nth(0);
		await expect(rangeInput).toHaveValue('50');
		await expect(numberInput).toHaveValue('50');

		await numberInput.fill('60');
		await expect(rangeInput).toHaveValue('60');
		await expect(numberInput).toHaveValue('60');

		await rangeInput.fill('70');
		await expect(rangeInput).toHaveValue('70');
		await expect(numberInput).toHaveValue('70');

		// Test keyboard input
		await numberInput.focus();
		await page.keyboard.press('ArrowUp');
		await expect(numberInput).toHaveValue('71');

		// Blur to trigger change event
		await page.keyboard.press('Tab');
		await expect(container.getByText('Value: 71')).toBeVisible();
	});

	test('disables slider inputs', async ({ page }) => {
		const container = getContainer();

		const rangeInput = container.locator('input[type="range"]').nth(1);
		const numberInput = container.locator('input[type="number"]').nth(1);

		await expect(rangeInput).toHaveAttribute('disabled');
		await expect(numberInput).toHaveAttribute('aria-disabled', 'true');

		await expect(numberInput).toHaveValue('50');
		await numberInput.focus();
		await page.keyboard.press('ArrowUp');
		await expect(numberInput).toHaveValue('50');
	});
});

describeComponent('input-groups-demo', (getContainer) => {
	test('focuses first input when group label is clicked', async () => {
		const container = getContainer();

		// Get the label element and click it
		const label = container.getByText('Time range');
		await label.click();

		// Verify that the first input is focused
		const group = container.locator('div[role="group"]').first();
		const startTime = group.locator('#start-time');
		await expect(startTime).toBeFocused();
	});
});
