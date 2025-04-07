import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('intl-demo', (getContainer) => {
	test('renders all internationalization formatting components correctly', async () => {
		const container = getContainer();

		// Test currency format - verify format pattern and currency symbol
		const currencyText = container.getByText(/I'd buy that for/);
		await expect(currencyText).toBeVisible();
		await expect(currencyText).toContainText('$5.99');

		// Test date format
		const dateText = container.getByText(/Today's date is/);
		await expect(dateText).toBeVisible();

		// Check for date format - should contain "2021" and some month representation
		await expect(dateText).toContainText('2021');
		await expect(dateText).toContainText(/January|Jan/);

		// Test time format
		const timeText = container.getByText(/The time is/);
		await expect(timeText).toBeVisible();

		// Time should contain either 12:34 or some localized variant
		await expect(timeText).toContainText(/12:34|12.34/);

		// Test date + time format
		const dateTimeText = container.getByText(/The date \+ time is/);
		await expect(dateTimeText).toBeVisible();
		// Should contain both date and time elements
		await expect(dateTimeText).toContainText('2021');
		await expect(dateTimeText).toContainText(/12:34|12.34/);

		// Test relative time format
		const relativeTimeText = container.getByText(/That was/);
		await expect(relativeTimeText).toBeVisible();
		// Should contain time units like "years", "months", etc.
		await expect(relativeTimeText).toContainText(/years|months|ago/);

		// Test integer format
		const integerText = container.getByText(/My favorite number is/);
		await expect(integerText).toBeVisible();
		// Check for formatted number with thousands separators
		await expect(integerText).toContainText(/1,234,567|1.234.567|1 234 567/);

		// Test percentage format
		const percentageText = container.getByText(/I'd give you/);
		await expect(percentageText).toBeVisible();
		// Should contain 7% or equivalent
		await expect(percentageText).toContainText(/7\s*%/);

		// Test list format
		const listText = container.getByText(/My partners are/);
		await expect(listText).toBeVisible();
		// Should contain all three names and appropriate separators
		await expect(listText).toContainText('Alice');
		await expect(listText).toContainText('Bob');
		await expect(listText).toContainText('Scott');
		// In English should use ", " and " and " format, but we'll be flexible for localization
		await expect(listText).toContainText(/Alice.+Bob.+Scott/);
	});
});
