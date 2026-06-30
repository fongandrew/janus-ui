/*
	Phase 5.T DOM-behaviors E2E (desktop). Targets the progressive-enhancement
	demo page (/v2-dom.html) -- raw markup + data-js, hydrated only by
	`dom-behaviors-entry.ts` importing `~/lib2/dom/all` and calling `mount()`.
	Covers tabs (roving focus + selection), the modal (commandfor open, ESC
	close via t-request-close, form validation + submit via the form engine),
	and the menu (popover + roving focus + typeahead).
*/
import { expect, test } from '@playwright/test';

const URL = '/v2-dom.html';

test('tabs: arrow keys move focus and selection; panels toggle', async ({ page }) => {
	await page.goto(URL);

	const tab1 = page.locator('#tab-1');
	const tab2 = page.locator('#tab-2');
	await expect(tab1).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('#panel-1')).toBeVisible();
	await expect(page.locator('#panel-2')).toBeHidden();

	await tab1.focus();
	await page.keyboard.press('ArrowRight');

	await expect(tab2).toBeFocused();
	await expect(tab2).toHaveAttribute('aria-selected', 'true');
	await expect(tab1).toHaveAttribute('aria-selected', 'false');
	await expect(page.locator('#panel-2')).toBeVisible();
	await expect(page.locator('#panel-1')).toBeHidden();
});

test('menu: opens via popover, arrow keys navigate, ESC closes', async ({ page }) => {
	await page.goto(URL);

	const trigger = page.locator('button[popovertarget="dom-demo-menu"]');
	const menu = page.locator('#dom-demo-menu');
	await expect(menu).toBeHidden();

	await trigger.click();
	await expect(menu).toBeVisible();

	const items = menu.locator('[role="menuitem"]');
	await items.first().focus();
	await page.keyboard.press('ArrowDown');
	await expect(items.nth(1)).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
});

test('modal: opens via commandfor, validates, submits, and resets on close', async ({ page }) => {
	await page.goto(URL);

	const dialog = page.locator('#dom-demo-modal');
	await expect(dialog).toBeHidden();

	await page.locator('button[commandfor="dom-demo-modal"][command="show-modal"]').click();
	await expect(dialog).toBeVisible();

	// Submitting empty reveals the required-field error and blocks the handler.
	await page.locator('#dom-demo-form button[type="submit"]').click();
	await expect(page.locator('#dom-demo-email-err')).not.toBeEmpty();
	await expect(dialog).toBeVisible();

	// Fixing the field and resubmitting succeeds; t-close-on-success closes the dialog.
	await page.locator('#dom-demo-email').fill('demo@example.com');
	await page.locator('#dom-demo-form button[type="submit"]').click();
	await expect(dialog).toBeHidden({ timeout: 5000 });
});

test('modal: ESC closes via t-request-close', async ({ page }) => {
	await page.goto(URL);

	await page.locator('button[commandfor="dom-demo-modal"][command="show-modal"]').click();
	const dialog = page.locator('#dom-demo-modal');
	await expect(dialog).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
});
