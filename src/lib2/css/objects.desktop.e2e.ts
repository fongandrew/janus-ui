import { expect, type Page, test } from '@playwright/test';

const OBJECTS_PAGE = '/site/composition/objects.html';

async function radius(page: Page, testid: string): Promise<number> {
	return page
		.getByTestId(testid)
		.first()
		.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
}

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

test.describe('Phase 2 objects', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(OBJECTS_PAGE);
	});

	test('radius steps inward through the cascade', async ({ page }) => {
		const min = await resolvePx(page, 'var(--v-radius-min)');
		const dialog = await radius(page, 'cascade-dialog');
		const box = await radius(page, 'cascade-box');
		const control = await radius(page, 'cascade-control');
		const innerBox = await radius(page, 'cascade-inner-box');
		const innerControl = await radius(page, 'cascade-inner-control');

		// Frame rounds most; each level steps inward.
		expect(dialog).toBeGreaterThan(box);
		expect(box).toBeGreaterThan(control - 0.01);
		// A box nested in a box rounds one step less than its parent box.
		expect(innerBox).toBeLessThanOrEqual(box);
		// A control in the nested box steps once more (floored).
		expect(innerControl).toBeLessThanOrEqual(innerBox);
		// Nothing ever falls below the floor.
		for (const r of [dialog, box, control, innerBox, innerControl]) {
			expect(r).toBeGreaterThanOrEqual(min - 0.01);
		}
	});

	test('dialog radius = window radius − offset', async ({ page }) => {
		const windowR = await resolvePx(page, 'var(--v-radius)');
		const offset = await resolvePx(page, 'calc(0.75 * var(--v-spacing))');
		const dialog = await radius(page, 'cascade-dialog');
		expect(dialog).toBeCloseTo(windowR - offset, 0);
	});

	test('flat when --v-radius-min == --v-radius', async ({ page }) => {
		await page.evaluate(() => {
			document.documentElement.style.setProperty('--v-radius', '0.5rem');
			document.documentElement.style.setProperty('--v-radius-min', '0.5rem');
		});
		const dialog = await radius(page, 'cascade-dialog');
		const box = await radius(page, 'cascade-box');
		const control = await radius(page, 'cascade-control');
		expect(dialog).toBeCloseTo(box, 0);
		expect(box).toBeCloseTo(control, 0);
	});

	test('o-box padding matches the pad tokens', async ({ page }) => {
		const padBlock = await resolvePx(page, 'var(--v-pad-block)');
		const padInline = await resolvePx(page, 'var(--v-pad-inline)');
		const box = page.getByTestId('pad-box');
		const pt = await box.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
		const pl = await box.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
		expect(pt).toBeCloseTo(padBlock, 0);
		expect(pl).toBeCloseTo(padInline, 0);
	});

	test('bar input mode is exactly one control tall', async ({ page }) => {
		const inputHeight = await resolvePx(page, 'var(--v-input-height)');
		const barInput = await page.getByTestId('bar-input').boundingBox();
		const barText = await page.getByTestId('bar-text').boundingBox();
		// Input-mode bar is ~one control tall (plus its own border).
		expect(barInput!.height).toBeLessThanOrEqual(inputHeight + 4);
		// Text mode is taller than input mode (it adds full padding).
		expect(barText!.height).toBeGreaterThan(barInput!.height);
	});

	test('section flow separates children; heading-led differs', async ({ page }) => {
		const gapSection = await resolvePx(page, 'var(--v-gap-section)');
		const marginB = await page
			.getByTestId('flow-b')
			.evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
		const marginHeading = await page
			.getByTestId('flow-heading')
			.evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
		expect(marginB).toBeCloseTo(gapSection, 0);
		// The heading-led section takes a different lead-in.
		expect(marginHeading).not.toBeCloseTo(gapSection, 0);
		expect(marginHeading).toBeGreaterThan(0);
	});

	test('o-grid reflows with width', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		const wideCols = await page.getByTestId('grid').evaluate((el) => {
			return getComputedStyle(el).gridTemplateColumns.split(' ').length;
		});
		await page.setViewportSize({ width: 380, height: 900 });
		const narrowCols = await page.getByTestId('grid').evaluate((el) => {
			return getComputedStyle(el).gridTemplateColumns.split(' ').length;
		});
		expect(wideCols).toBeGreaterThan(narrowCols);
		expect(narrowCols).toBe(1);
	});

	test('o-split collapses to a single column when narrow', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		const wide = await page.getByTestId('split').evaluate((el) => {
			const kids = [...el.children] as HTMLElement[];
			return kids[0]!.offsetTop === kids[1]!.offsetTop;
		});
		await page.setViewportSize({ width: 380, height: 900 });
		const narrow = await page.getByTestId('split').evaluate((el) => {
			const kids = [...el.children] as HTMLElement[];
			return kids[0]!.offsetTop === kids[1]!.offsetTop;
		});
		expect(wide).toBe(true); // side by side
		expect(narrow).toBe(false); // stacked
	});

	test('o-stack has vertical gaps, o-group horizontal', async ({ page }) => {
		const stackGap = await page
			.getByTestId('stack')
			.evaluate((el) => getComputedStyle(el).rowGap);
		expect(parseFloat(stackGap)).toBeGreaterThan(0);

		const group = page.getByTestId('group');
		const horizontal = await group.evaluate((el) => {
			const kids = [...el.children] as HTMLElement[];
			return kids[0]!.offsetTop === kids[1]!.offsetTop;
		});
		expect(horizontal).toBe(true);
	});
});
