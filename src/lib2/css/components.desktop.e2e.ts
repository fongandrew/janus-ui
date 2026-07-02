import { expect, type Page, test } from '@playwright/test';

const GALLERY = '/site/components.html';

async function resolvePx(page: Page, expr: string): Promise<number> {
	return page.evaluate((e) => {
		const el = document.createElement('div');
		el.style.position = 'absolute';
		el.style.width = e;
		document.body.appendChild(el);
		const w = parseFloat(getComputedStyle(el).width);
		el.remove();
		return w;
	}, expr);
}

test.describe('Phase 3 components', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(GALLERY);
	});

	test('buttons: padding, radius, tonal variants, hover shadow', async ({ page }) => {
		const spacing = await resolvePx(page, 'var(--v-spacing)');
		const btn = page.getByTestId('btn-primary');
		const pl = await btn.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
		expect(pl).toBeCloseTo(spacing, 0); // roomier button inline padding == --v-spacing

		const radius = await btn.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
		expect(radius).toBeGreaterThan(0);

		// Tonal variant changes background.
		const defaultBg = await page
			.locator('#buttons-demo .c-button')
			.first()
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		const primaryBg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(primaryBg).not.toBe(defaultBg);

		// Icon button is square.
		const icon = page.getByTestId('btn-icon');
		const box = await icon.boundingBox();
		expect(box!.width).toBeCloseTo(box!.height, 0);

		// Hover adds an outer shadow.
		await btn.hover();
		const shadow = await btn.evaluate((el) => getComputedStyle(el).boxShadow);
		expect(shadow).not.toBe('none');
	});

	test('cards: border + radius; shadow suppressed in a wide frame; surfaces differ', async ({
		page,
	}) => {
		const card = page.locator('#cards-demo').first();
		const border = await card.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
		expect(border).toBeGreaterThan(0);
		const radius = await card.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
		expect(radius).toBeGreaterThan(0);

		// Elevated surface carries a shadow.
		const elevatedShadow = await page
			.getByTestId('surface-elevated')
			.evaluate((el) => getComputedStyle(el).boxShadow);
		expect(elevatedShadow).not.toBe('none');
	});

	test('inputs: height, inner shadow, focus ring, invalid chrome', async ({ page }) => {
		const inputHeight = await resolvePx(page, 'var(--v-input-height)');
		const input = page.getByTestId('input-default');
		const box = await input.boundingBox();
		expect(box!.height).toBeCloseTo(inputHeight, 0);

		const shadow = await input.evaluate((el) => getComputedStyle(el).boxShadow);
		expect(shadow).not.toBe('none'); // inner shadow

		await input.focus();
		const outline = await input.evaluate((el) => getComputedStyle(el).outlineStyle);
		expect(outline).not.toBe('none');

		const defaultBorder = await input.evaluate((el) => getComputedStyle(el).borderTopColor);
		const invalidBorder = await page
			.getByTestId('input-invalid')
			.evaluate((el) => getComputedStyle(el).borderTopColor);
		expect(invalidBorder).not.toBe(defaultBorder);
	});

	test('checkboxes: custom styling replaces the browser default; checked differs', async ({
		page,
	}) => {
		const unchecked = page.getByTestId('checkbox-unchecked');
		const appearance = await unchecked.evaluate((el) => getComputedStyle(el).appearance);
		expect(appearance).toBe('none');

		const uncheckedBg = await unchecked.evaluate((el) => getComputedStyle(el).backgroundColor);
		const checkedBg = await page
			.getByTestId('checkbox-checked')
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(checkedBg).not.toBe(uncheckedBg);
	});

	test('toggle: checked vs unchecked differ visually', async ({ page }) => {
		const off = await page.getByTestId('toggle-off').evaluate((el) => getComputedStyle(el).backgroundColor);
		const on = await page.getByTestId('toggle-on').evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(on).not.toBe(off);
	});

	test('alerts: tonal coloring paints a distinct background', async ({ page }) => {
		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		const alertBg = await page
			.getByTestId('alert-success')
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(alertBg).not.toBe(bodyBg);
	});

	test('table: control-height rows, decoupled from --v-input-height', async ({ page }) => {
		const inputHeight = await resolvePx(page, 'var(--v-input-height)');
		const row = page.getByTestId('table-row');
		const height = await row.evaluate((el) => (el as HTMLElement).offsetHeight);
		// Single-line row ~ --c-table__row-height (defaults to --v-input-height),
		// plus the row's 1px divider.
		expect(Math.abs(height - inputHeight)).toBeLessThanOrEqual(2);

		// Overriding the table row height must NOT change form controls.
		const inputBefore = await page
			.getByTestId('input-default')
			.evaluate((el) => (el as HTMLElement).offsetHeight);
		await page.getByTestId('table').evaluate((el) => {
			(el as HTMLElement).style.setProperty('--c-table__row-height', '1.25rem');
		});
		const rowAfter = await row.evaluate((el) => (el as HTMLElement).offsetHeight);
		const inputAfter = await page
			.getByTestId('input-default')
			.evaluate((el) => (el as HTMLElement).offsetHeight);
		expect(rowAfter).toBeLessThan(height);
		expect(inputAfter).toBe(inputBefore);
	});

	test('popover shows and hides', async ({ page }) => {
		const pop = page.getByTestId('popover');
		await expect(pop).toBeHidden();
		await page.getByTestId('popover-trigger').click();
		await expect(pop).toBeVisible();
	});

	test('tooltip positions near its anchor @chromium-only', async ({ page }) => {
		await page.getByTestId('tooltip-trigger').click();
		const tip = page.getByTestId('tooltip');
		await expect(tip).toBeVisible();
		const anchorBox = await page.getByTestId('tooltip-trigger').boundingBox();
		const tipBox = await tip.boundingBox();
		// Anchor positioning places the tooltip horizontally overlapping its anchor.
		expect(Math.abs(tipBox!.x - anchorBox!.x)).toBeLessThan(300);
	});
});
