import { expect, test } from '@playwright/test';

/*
	Phase 2 object-layer tests (PLAN 2.T). Target the framework-free Objects doc page.
	Cover the radius cascade (stepping inward, floored, flat when min==max), box
	spacing, and layout reflow / gaps.
*/

const OBJECTS_URL = '/v2-objects.html';

test('radius cascade steps inward, floors at the min, and flattens when min == max', async ({
	page,
}) => {
	await page.goto(OBJECTS_URL);

	const radii = () =>
		page.evaluate(() => {
			const r = (id: string) =>
				parseFloat(getComputedStyle(document.getElementById(id)!).borderTopLeftRadius);
			return {
				dialog: r('cascade-dialog'),
				box: r('cascade-box'),
				input: r('cascade-input'),
			};
		});

	// Concentric default (radius 2.5rem, pad 0.5rem, offset 0.5rem → 32 / 24 / 16px).
	const stepped = await radii();
	expect(stepped.dialog).toBeGreaterThan(stepped.box);
	expect(stepped.box).toBeGreaterThan(stepped.input);
	// Each level steps inward by one pad (0.5rem = 8px).
	expect(stepped.dialog - stepped.box).toBeCloseTo(8, 0);
	expect(stepped.box - stepped.input).toBeCloseTo(8, 0);
	// dialog radius = window (40px) − offset (8px).
	expect(stepped.dialog).toBeCloseTo(32, 0);
	// Nothing falls below the floor (--v-radius-min = 0.25rem = 4px).
	expect(stepped.input).toBeGreaterThanOrEqual(4);

	// Flat: set --v-radius-min == --v-radius on the demo root → every corner identical.
	await page.evaluate(() => {
		document.getElementById('cascade-root')!.style.setProperty('--v-radius-min', '2.5rem');
	});
	const flat = await radii();
	expect(flat.dialog).toBeCloseTo(flat.box, 0);
	expect(flat.box).toBeCloseTo(flat.input, 0);
});

test('o-box and o-text-box padding match the spacing knobs', async ({ page }) => {
	await page.goto(OBJECTS_URL);

	const box = await page.evaluate(() => {
		const cs = getComputedStyle(document.getElementById('demo-box')!);
		return { top: cs.paddingTop, bottom: cs.paddingBottom, left: cs.paddingLeft };
	});
	// Default --v-pad-* = --v-spacing = 1rem = 16px.
	expect(parseFloat(box.top)).toBeCloseTo(16, 0);
	expect(parseFloat(box.left)).toBeCloseTo(16, 0);

	const textBox = await page.evaluate(() => {
		const cs = getComputedStyle(document.getElementById('demo-text-box')!);
		return { top: parseFloat(cs.paddingTop), bottom: parseFloat(cs.paddingBottom) };
	});
	// Uniform block padding (text-box-trim handles optical alignment — no subtraction).
	expect(textBox.top).toBeCloseTo(textBox.bottom, 1);
	expect(textBox.top).toBeCloseTo(16, 0);
});

test('o-grid reflows from multi-column (wide) to single-column (narrow)', async ({ page }) => {
	await page.goto(OBJECTS_URL);

	const trackCount = () =>
		page.evaluate(() => {
			const cols = getComputedStyle(
				document.getElementById('demo-grid')!,
			).gridTemplateColumns;
			return cols.trim().split(/\s+/).length;
		});

	await page.setViewportSize({ width: 1280, height: 900 });
	expect(await trackCount()).toBeGreaterThan(1);

	await page.setViewportSize({ width: 400, height: 900 });
	expect(await trackCount()).toBe(1);
});

test('o-split collapses to stacked at narrow width', async ({ page }) => {
	await page.goto(OBJECTS_URL);

	const wrapped = () =>
		page.evaluate(() => {
			const kids = [...document.getElementById('demo-split')!.children] as HTMLElement[];
			return kids[1]!.offsetTop > kids[0]!.offsetTop;
		});

	await page.setViewportSize({ width: 1280, height: 900 });
	expect(await wrapped()).toBe(false); // side by side

	await page.setViewportSize({ width: 400, height: 900 });
	expect(await wrapped()).toBe(true); // stacked
});

test('o-stack spaces children vertically; o-group keeps them on one row', async ({ page }) => {
	await page.goto(OBJECTS_URL);
	await page.setViewportSize({ width: 1000, height: 900 });

	const layout = await page.evaluate(() => {
		const tops = (id: string) =>
			[...document.getElementById(id)!.children].map((c) => (c as HTMLElement).offsetTop);
		return { stack: tops('demo-stack'), group: tops('demo-group') };
	});

	// Stack: each child sits below the previous.
	expect(layout.stack[1]!).toBeGreaterThan(layout.stack[0]!);
	expect(layout.stack[2]!).toBeGreaterThan(layout.stack[1]!);
	// Group: the first items share a row.
	expect(layout.group[1]!).toBe(layout.group[0]!);
});
