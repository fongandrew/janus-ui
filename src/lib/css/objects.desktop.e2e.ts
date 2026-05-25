import { expect, test } from '@playwright/test';

const HARNESS = '/src/lib/css/test-harness.html';

test.describe('CSS objects', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(HARNESS);
	});

	test('o-box radius cascade to o-input-box', async ({ page }) => {
		const radii = await page.evaluate(() => {
			const box = document.querySelector('.o-box');
			const inputBox = box?.querySelector('.o-input-box');
			if (!box || !inputBox) return null;
			return {
				box: getComputedStyle(box).borderRadius,
				inputBox: getComputedStyle(inputBox).borderRadius,
			};
		});

		expect(radii).not.toBeNull();
		const boxR = parseFloat(radii!.box);
		const inputR = parseFloat(radii!.inputBox);
		expect(boxR).toBeGreaterThan(inputR);
	});

	test('o-stack children have vertical spacing', async ({ page }) => {
		const gap = await page.evaluate(() => {
			const stack = document.querySelector('.o-stack');
			return stack ? getComputedStyle(stack).rowGap : '';
		});
		expect(gap).not.toBe('');
		expect(gap).not.toBe('0px');
	});

	test('o-group has horizontal layout', async ({ page }) => {
		const direction = await page.evaluate(() => {
			const group = document.querySelector('.o-group');
			return group ? getComputedStyle(group).flexDirection : '';
		});
		expect(direction).toBe('row');
	});

	test('o-grid creates multi-column layout', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.goto(HARNESS);

		const columns = await page.evaluate(() => {
			const grid = document.querySelector('.o-grid');
			return grid
				? getComputedStyle(grid).gridTemplateColumns.split(' ').length
				: 0;
		});
		expect(columns).toBeGreaterThan(1);
	});

	test('o-grid collapses to single column on narrow viewport', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 400, height: 800 });
		await page.goto(HARNESS);

		const columns = await page.evaluate(() => {
			const grid = document.querySelector('#objects .o-grid');
			return grid
				? getComputedStyle(grid).gridTemplateColumns.split(' ').length
				: 0;
		});
		expect(columns).toBe(1);
	});

	test('o-box has padding', async ({ page }) => {
		const padding = await page.evaluate(() => {
			const box = document.querySelector('.o-box');
			return box ? getComputedStyle(box).paddingTop : '0px';
		});
		expect(parseFloat(padding)).toBeGreaterThan(0);
	});
});
