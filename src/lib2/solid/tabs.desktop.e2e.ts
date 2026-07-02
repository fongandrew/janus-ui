import { expect, test } from '@playwright/test';

/** Solid-layer Tabs + t-roving-focus/c-tabs__select (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('context pairs tabs and panels via aria-controls/aria-labelledby', async ({ page }) => {
	const demo = page.locator('#tabs-demo');
	const first = demo.getByRole('tab', { name: 'First' });
	await expect(first).toHaveId('demo-tabs-tab-first');
	await expect(first).toHaveAttribute('aria-controls', 'demo-tabs-panel-first');
	await expect(demo.locator('#demo-tabs-panel-first')).toHaveAttribute(
		'aria-labelledby',
		'demo-tabs-tab-first',
	);
	await expect(demo.locator('[role="tablist"]')).toHaveAttribute(
		'data-js',
		't-roving-focus c-tabs__select',
	);
});

test('defaultValue selects the initial tab and panel', async ({ page }) => {
	const demo = page.locator('#tabs-demo');
	await expect(demo.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
	await expect(demo.locator('#demo-tabs-panel-first')).toBeVisible();
	await expect(demo.locator('#demo-tabs-panel-second')).toBeHidden();
});

test('click selects a tab and toggles panel visibility', async ({ page }) => {
	const demo = page.locator('#tabs-demo');
	await demo.getByRole('tab', { name: 'Second' }).click();
	await expect(demo.getByRole('tab', { name: 'Second' })).toHaveAttribute(
		'aria-selected',
		'true',
	);
	await expect(demo.getByRole('tab', { name: 'First' })).toHaveAttribute(
		'aria-selected',
		'false',
	);
	await expect(demo.locator('#demo-tabs-panel-second')).toBeVisible();
	await expect(demo.locator('#demo-tabs-panel-first')).toBeHidden();
});

test('arrow keys move focus (skipping the aria-disabled tab); Enter selects', async ({ page }) => {
	const demo = page.locator('#tabs-demo');
	const first = demo.getByRole('tab', { name: 'First' });
	const second = demo.getByRole('tab', { name: 'Second' });
	const disabled = demo.getByRole('tab', { name: 'Disabled' });
	await expect(disabled).toHaveAttribute('aria-disabled', 'true');
	expect(await disabled.getAttribute('disabled')).toBeNull();

	await first.click();
	await page.keyboard.press('ArrowRight');
	await expect(second).toBeFocused();
	// The aria-disabled tab is excluded from roving focus — wraps to First
	await page.keyboard.press('ArrowRight');
	await expect(first).toBeFocused();

	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('Enter');
	await expect(second).toHaveAttribute('aria-selected', 'true');
	await expect(demo.locator('#demo-tabs-panel-second')).toBeVisible();
});
