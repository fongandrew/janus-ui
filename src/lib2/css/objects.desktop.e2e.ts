import { expect, type Locator, test } from '@playwright/test';

/*
 * Object-layer E2E (PLAN.md §2.T). Targets the framework-free Objects doc page.
 */

const OBJECTS = '/v2-objects.html';

/** Computed border-radius (top-left) of an element, in px. */
async function radiusPx(el: Locator): Promise<number> {
	return el.evaluate((node) => parseFloat(getComputedStyle(node).borderTopLeftRadius));
}

test('concentric preset rounds radii outward, never sharp', async ({ page }) => {
	await page.goto(OBJECTS);

	const input = await radiusPx(page.locator('#cc-input'));
	const box = await radiusPx(page.locator('#cc-box'));
	const dialog = await radiusPx(page.locator('#cc-dialog'));

	// Outward-increasing concentric corners.
	expect(box).toBeGreaterThan(input);
	expect(dialog).toBeGreaterThan(box);

	// Never sharp — the control floors at --v-radius-min (> 0).
	expect(input).toBeGreaterThan(0);
});

test('uniform preset assigns flat radii', async ({ page }) => {
	await page.goto(OBJECTS);

	const input = await radiusPx(page.locator('#cu-input'));
	const box = await radiusPx(page.locator('#cu-box'));
	const dialog = await radiusPx(page.locator('#cu-dialog'));

	// Two flat values: control and box share one, dialog is larger.
	expect(box).toBeCloseTo(input, 1);
	expect(dialog).toBeGreaterThan(box);
});

test('o-box padding matches the spacing tokens', async ({ page }) => {
	await page.goto(OBJECTS);

	const box = page.locator('#demo-box');
	const { padBlock, padInline, varBlock, varInline } = await box.evaluate((node) => {
		const cs = getComputedStyle(node);
		const root = getComputedStyle(document.documentElement);
		const toPx = (v: string) => {
			const probe = document.createElement('div');
			probe.style.cssText = `position:absolute;visibility:hidden;width:${v}`;
			document.body.appendChild(probe);
			const px = parseFloat(getComputedStyle(probe).width);
			probe.remove();
			return px;
		};
		return {
			padBlock: parseFloat(cs.paddingTop),
			padInline: parseFloat(cs.paddingLeft),
			varBlock: toPx(root.getPropertyValue('--v-pad-block')),
			varInline: toPx(root.getPropertyValue('--v-pad-inline')),
		};
	});

	expect(padBlock).toBeCloseTo(varBlock, 0);
	expect(padInline).toBeCloseTo(varInline, 0);
});

test('o-text-box has uniform block padding', async ({ page }) => {
	await page.goto(OBJECTS);

	const { top, bottom } = await page.locator('#demo-text-box').evaluate((node) => {
		const cs = getComputedStyle(node);
		return { top: parseFloat(cs.paddingTop), bottom: parseFloat(cs.paddingBottom) };
	});
	// Uniform block padding — text-box-trim handles optical alignment, no subtraction.
	expect(top).toBeCloseTo(bottom, 1);
});

test('o-grid reflows from multi-column to single-column', async ({ page }) => {
	await page.goto(OBJECTS);
	const grid = page.locator('#demo-grid');

	const columns = async () =>
		grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);

	await page.setViewportSize({ width: 1280, height: 900 });
	expect(await columns()).toBeGreaterThan(1);

	await page.setViewportSize({ width: 400, height: 900 });
	expect(await columns()).toBe(1);
});

test('o-split collapses to stacked at narrow width', async ({ page }) => {
	await page.goto(OBJECTS);
	const split = page.locator('#demo-split');

	const sameRow = async () =>
		split.evaluate((node) => {
			const kids = Array.from(node.children) as HTMLElement[];
			return kids[0]!.offsetTop === kids[1]!.offsetTop;
		});

	await page.setViewportSize({ width: 1280, height: 900 });
	expect(await sameRow()).toBe(true);

	await page.setViewportSize({ width: 360, height: 900 });
	expect(await sameRow()).toBe(false);
});

test('o-stack stacks vertically, o-group lays out horizontally', async ({ page }) => {
	await page.goto(OBJECTS);

	const stackVertical = await page.locator('#demo-stack').evaluate((node) => {
		const kids = Array.from(node.children) as HTMLElement[];
		return kids[1]!.offsetTop > kids[0]!.offsetTop;
	});
	expect(stackVertical).toBe(true);

	const groupHorizontal = await page.locator('#demo-group').evaluate((node) => {
		const kids = Array.from(node.children) as HTMLElement[];
		return (
			kids[1]!.offsetLeft > kids[0]!.offsetLeft && kids[1]!.offsetTop === kids[0]!.offsetTop
		);
	});
	expect(groupHorizontal).toBe(true);
});
