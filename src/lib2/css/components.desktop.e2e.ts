import { expect, type Page, test } from '@playwright/test';

/**
 * Component-CSS E2E tests (PLAN 3.T). Target: the static component gallery.
 */

async function px(page: Page, expr: string): Promise<number> {
	return page.evaluate((value) => {
		const el = document.createElement('div');
		el.style.position = 'absolute';
		el.style.width = value;
		document.body.appendChild(el);
		const width = el.getBoundingClientRect().width;
		el.remove();
		return width;
	}, expr);
}

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-components.html');
});

test.describe('buttons', () => {
	test('chrome: padding, radius, hover shadow', async ({ page }) => {
		const button = page.locator('#buttons-demo .c-button').first();
		const radius = parseFloat(await button.evaluate((el) => getComputedStyle(el).borderRadius));
		expect(radius).toBeGreaterThan(0);
		const padding = parseFloat(await button.evaluate((el) => getComputedStyle(el).paddingLeft));
		expect(padding).toBeGreaterThanOrEqual((await px(page, 'var(--v-spacing)')) - 0.5);

		const before = await button.evaluate((el) => getComputedStyle(el).boxShadow);
		expect(before).toBe('none');
		await button.hover();
		await expect
			.poll(async () => button.evaluate((el) => getComputedStyle(el).boxShadow))
			.not.toBe('none');
	});

	test('icon button is square; tonal variants change background', async ({ page }) => {
		const icon = page.locator('#buttons-demo .c-button--icon').first();
		const box = await icon.boundingBox();
		expect(box!.width).toBeCloseTo(box!.height, 0);

		const defaultBg = await page
			.locator('#buttons-demo .c-button')
			.first()
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		const primaryBg = await page
			.locator('#buttons-demo .c-button.v-colors-primary')
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		const dangerBg = await page
			.locator('#buttons-demo .c-button.v-colors-danger')
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(primaryBg).not.toBe(defaultBg);
		expect(dangerBg).not.toBe(defaultBg);
		expect(dangerBg).not.toBe(primaryBg);
	});
});

test.describe('cards & surfaces', () => {
	test('card has border and radius; elevated shadow differs from card shadow', async ({
		page,
	}) => {
		const card = page.locator('#cards-demo .c-card').first();
		const borderWidth = parseFloat(
			await card.evaluate((el) => getComputedStyle(el).borderTopWidth),
		);
		expect(borderWidth).toBeGreaterThan(0);
		const radius = parseFloat(await card.evaluate((el) => getComputedStyle(el).borderRadius));
		expect(radius).toBeGreaterThan(0);

		const cardShadow = await page
			.locator('#cards-demo .v-surface-card')
			.evaluate((el) => getComputedStyle(el).boxShadow);
		const elevatedShadow = await page
			.locator('#cards-demo .v-surface-elevated')
			.evaluate((el) => getComputedStyle(el).boxShadow);
		expect(elevatedShadow).not.toBe(cardShadow);
	});
});

test.describe('inputs', () => {
	test('inner shadow, control height, focus ring, invalid border', async ({ page }) => {
		const input = page.locator('#gal-input-1');
		expect(await input.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('inset');

		const height = (await input.boundingBox())!.height;
		expect(height).toBeCloseTo(await px(page, 'var(--v-input-height)'), 0);

		await input.focus();
		const outline = await input.evaluate((el) => getComputedStyle(el).outlineStyle);
		expect(outline).not.toBe('none');

		const normalBorder = await input.evaluate((el) => getComputedStyle(el).borderTopColor);
		const invalidBorder = await page
			.locator('#gal-input-2')
			.evaluate((el) => getComputedStyle(el).borderTopColor);
		expect(invalidBorder).not.toBe(normalBorder);
	});
});

test.describe('checkboxes, radios, toggles', () => {
	test('custom styling replaces browser defaults; checked state paints accent', async ({
		page,
	}) => {
		const unchecked = page.locator('#checkboxes-demo .c-checkbox').first();
		expect(await unchecked.evaluate((el) => getComputedStyle(el).appearance)).toBe('none');

		const uncheckedBg = await unchecked.evaluate((el) => getComputedStyle(el).backgroundColor);
		const checkedBg = await page
			.locator('#checkboxes-demo .c-checkbox:checked')
			.first()
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(checkedBg).not.toBe(uncheckedBg);

		const radioOffBg = await page
			.locator('#radios-demo .c-radio:not(:checked)')
			.first()
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		const radioOnBg = await page
			.locator('#radios-demo .c-radio:checked')
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(radioOnBg).not.toBe(radioOffBg);

		const toggleOff = await page
			.locator('#toggles-demo .c-toggle:not(:checked)')
			.first()
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		const toggleOn = await page
			.locator('#toggles-demo .c-toggle:checked')
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(toggleOn).not.toBe(toggleOff);
	});
});

test.describe('alerts', () => {
	test('tonal variants produce distinct backgrounds', async ({ page }) => {
		const backgrounds = await page.evaluate(() =>
			['success', 'warn', 'danger'].map(
				(tone) =>
					getComputedStyle(document.querySelector(`#alerts-demo .v-colors-${tone}`)!)
						.backgroundColor,
			),
		);
		expect(new Set(backgrounds).size).toBe(3);
	});
});

test.describe('tables', () => {
	test('control-height rows, scoped density decoupled from inputs, multi-line growth', async ({
		page,
	}) => {
		const inputHeight = await px(page, 'var(--v-input-height)');
		const singleRow = await page.locator('#gal-table-row-single').boundingBox();
		expect(singleRow!.height).toBeGreaterThanOrEqual(inputHeight - 2);
		expect(singleRow!.height).toBeLessThanOrEqual(inputHeight + 3);

		// Scoped override drops the dense table's rows…
		const denseRow = await page.locator('#gal-table-dense-row').boundingBox();
		expect(denseRow!.height).toBeLessThan(singleRow!.height);
		// …while controls on the same page keep --v-input-height
		const inlineInput = await page.locator('#gal-table-inline-input').boundingBox();
		expect(inlineInput!.height).toBeCloseTo(inputHeight, 0);

		// A multi-line cell grows the row past the minimum
		const multiRow = await page
			.locator('#gal-table-cell-multi')
			.evaluate((el) => el.closest('tr')!.getBoundingClientRect().height);
		expect(multiRow).toBeGreaterThan(singleRow!.height + 8);
	});
});

test.describe('overlays', () => {
	test('modal opens and closes via commandfor', async ({ page }) => {
		const modal = page.locator('#gallery-modal');
		await expect(modal).not.toBeVisible();
		await page.locator('button[commandfor="gallery-modal"][command="show-modal"]').click();
		await expect(modal).toBeVisible();
		// Backdrop + card-tone body render
		expect(
			await modal
				.locator('.c-modal__body')
				.evaluate((el) => getComputedStyle(el).backgroundColor),
		).not.toBe('rgba(0, 0, 0, 0)');
		await modal.locator('button[command="close"]').first().click();
		await expect(modal).not.toBeVisible();
	});

	test('drawer opens from the left via commandfor', async ({ page }) => {
		const drawer = page.locator('#gallery-drawer-left');
		await page
			.locator('button[commandfor="gallery-drawer-left"][command="show-modal"]')
			.click();
		await expect(drawer).toBeVisible();
		const box = await drawer.boundingBox();
		expect(box!.x).toBeLessThan(100); // anchored to the left edge
		await drawer.locator('button[command="close"]').click();
		await expect(drawer).not.toBeVisible();
	});

	test('popover shows and anchors near its trigger @chromium-only', async ({ page }) => {
		const popover = page.locator('#gallery-popover');
		await expect(popover).not.toBeVisible();
		const trigger = page.locator('button[popovertarget="gallery-popover"]');
		await trigger.click();
		await expect(popover).toBeVisible();
		const triggerBox = (await trigger.boundingBox())!;
		const popBox = (await popover.boundingBox())!;
		// anchor positioning places it adjacent to the trigger
		expect(Math.abs(popBox.y - (triggerBox.y + triggerBox.height))).toBeLessThan(40);
	});

	test('tooltip popover renders inverted at caption scale @chromium-only', async ({ page }) => {
		const tooltip = page.locator('#gallery-tooltip');
		await page.locator('button[popovertarget="gallery-tooltip"]').click();
		await expect(tooltip).toBeVisible();
		const fontSize = parseFloat(await tooltip.evaluate((el) => getComputedStyle(el).fontSize));
		const bodySize = parseFloat(
			await page.evaluate(() => getComputedStyle(document.body).fontSize),
		);
		expect(fontSize).toBeLessThan(bodySize);
	});

	test('menu popover renders its items', async ({ page }) => {
		await page.locator('button[popovertarget="gallery-menu"]').click();
		const menu = page.locator('#gallery-menu');
		await expect(menu).toBeVisible();
		await expect(menu.getByRole('menuitem')).toHaveCount(3);
	});
});
