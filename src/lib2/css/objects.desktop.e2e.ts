import { expect, type Page, test } from '@playwright/test';

/**
 * Object-layer E2E tests (PLAN 2.T). Target: the Objects doc page.
 */

async function radius(page: Page, selector: string): Promise<number> {
	return page.evaluate(
		(sel) => parseFloat(getComputedStyle(document.querySelector(sel)!).borderTopLeftRadius),
		selector,
	);
}

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

test.describe('radius cascade (§8)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/v2-objects.html');
	});

	test('radius steps inward by depth and floors at the min', async ({ page }) => {
		const frame = await px(page, 'var(--v-radius)');
		const min = await px(page, 'var(--v-radius-min)');
		const dialog = await radius(page, '#nest-dialog');
		const box = await radius(page, '#nest-box');
		const control = await radius(page, '#nest-input');
		const innerBox = await radius(page, '#nest-box-inner');
		const innerControl = await radius(page, '#nest-input-inner');
		const thirdBox = await radius(page, '#nest-box-third');

		// dialog radius = window − offset
		const offset = await px(page, 'var(--o-dialog__offset)');
		expect(dialog).toBeCloseTo(frame - offset, 1);

		// Steps inward: dialog > box > control; never sharp
		expect(dialog).toBeLessThan(frame);
		expect(box).toBeLessThan(dialog);
		expect(control).toBeLessThanOrEqual(box);
		expect(control).toBeGreaterThanOrEqual(min);

		// A box in a box rounds one pad-step less (floored); its control steps
		// once more; a third-level box shares the second level's radius.
		expect(innerBox).toBeLessThanOrEqual(box);
		expect(innerBox).toBeGreaterThanOrEqual(min);
		expect(innerControl).toBeGreaterThanOrEqual(min);
		expect(thirdBox).toBeCloseTo(innerBox, 1);
	});

	test('a control nested deeper rounds less than one sitting shallower', async ({ page }) => {
		// Depth, not type: control directly in the dialog's box vs in a nested box
		const shallow = await radius(page, '#nest-input');
		const deep = await radius(page, '#nest-input-inner');
		const min = await px(page, 'var(--v-radius-min)');
		expect(deep).toBeLessThanOrEqual(shallow);
		expect(deep).toBeGreaterThanOrEqual(min);
	});

	test('min == max flattens every corner to one value', async ({ page }) => {
		const dialog = await radius(page, '#nest-flat-dialog');
		const box = await radius(page, '#nest-flat-box');
		const control = await radius(page, '#nest-flat-input');
		const innerBox = await radius(page, '#nest-flat-box-inner');
		expect(box).toBeCloseTo(dialog, 1);
		expect(control).toBeCloseTo(dialog, 1);
		expect(innerBox).toBeCloseTo(dialog, 1);
		expect(dialog).toBeCloseTo(8, 1); // 0.5rem
	});
});

test.describe('bar height modes (§9.7)', () => {
	test('text > contains > input; input mode is exactly control-height', async ({ page }) => {
		await page.goto('/v2-objects.html');
		const heights = await page.evaluate(() => ({
			text: document.querySelector('#bar-text')!.getBoundingClientRect().height,
			contains: document.querySelector('#bar-contains')!.getBoundingClientRect().height,
			input: document.querySelector('#bar-input')!.getBoundingClientRect().height,
		}));
		const inputHeight = await px(page, 'var(--v-input-height)');
		expect(heights.text).toBeGreaterThan(heights.contains);
		expect(heights.contains).toBeGreaterThan(heights.input);
		expect(heights.input).toBeCloseTo(inputHeight, 1);

		// Contains mode: the control's TEXT sits --v-spacing from the bar edge.
		// bar height = input-height + 2 × (spacing − (input-height − 1lh)/2)
		// = 1lh + 2 × spacing.
		const spacing = await px(page, 'var(--v-spacing)');
		const lineHeight = await page.evaluate(() => {
			const input = document.querySelector('#bar-contains input')!;
			return parseFloat(getComputedStyle(input).lineHeight);
		});
		expect(heights.contains).toBeCloseTo(lineHeight + 2 * spacing, 0);
	});
});

test.describe('section flow (§6.2)', () => {
	test('container children separate by the section gap; heading-led prose takes the heading gap', async ({
		page,
	}) => {
		await page.goto('/v2-objects.html');
		const gapSection = await px(page, 'var(--v-gap-section)');

		const boxGap = await page.evaluate(() => {
			const a = document.querySelector('#container-child-1')!.getBoundingClientRect();
			const b = document.querySelector('#container-child-2')!.getBoundingClientRect();
			return b.top - a.bottom;
		});
		expect(boxGap).toBeCloseTo(gapSection, 0);

		// The prose section itself carries no flat gap — the heading's own
		// space-above (1 line in the heading's em) owns the lead-in.
		const proseMargin = await page.evaluate(
			() =>
				getComputedStyle(document.querySelector('#container-heading-prose')!)
					.marginBlockStart,
		);
		expect(parseFloat(proseMargin)).toBe(0);

		const headingMargin = await page.evaluate(() => {
			const heading = document.querySelector('#container-heading')!;
			return {
				margin: parseFloat(getComputedStyle(heading).marginBlockStart),
				fontSize: parseFloat(getComputedStyle(heading).fontSize),
			};
		});
		expect(headingMargin.margin).toBeCloseTo(1.5 * headingMargin.fontSize, 0);
	});
});

test.describe('inline text insets (§6.1)', () => {
	test('prose beside boxes insets; prose in a box stays flush; code breaks out', async ({
		page,
	}) => {
		await page.goto('/v2-objects.html');
		const padInline = await px(page, 'var(--v-pad-inline)');

		// Boxes anchor the container edge — the box does not move.
		const containerEdges = await page.evaluate(() => {
			const container = document.querySelector('#inset-container')!.getBoundingClientRect();
			const box = document.querySelector('#inset-box')!.getBoundingClientRect();
			const prose = document.querySelector('#inset-prose')!.getBoundingClientRect();
			const proseP = document.querySelector('#inset-prose > p')!.getBoundingClientRect();
			const pre = document.querySelector('#inset-pre')!.getBoundingClientRect();
			return {
				containerLeft: container.left,
				boxLeft: box.left,
				proseLeft: prose.left,
				prosePLeft: proseP.left,
				preLeft: pre.left,
			};
		});

		// Container has zero own padding in this demo, so box sits on its edge
		expect(containerEdges.boxLeft).toBeCloseTo(containerEdges.containerLeft, 0);
		// Prose text insets by --v-pad-inline (the cards' inner-text level)
		expect(containerEdges.prosePLeft - containerEdges.containerLeft).toBeCloseTo(padInline, 0);
		// The code block breaks back out to the box edge
		expect(containerEdges.preLeft).toBeCloseTo(containerEdges.boxLeft, 0);

		// Prose inside a box has no additional inset (flush with box padding)
		const inBox = await page.evaluate(() => {
			const style = getComputedStyle(document.querySelector('#inset-prose-in-box')!);
			return style.paddingInlineStart;
		});
		expect(parseFloat(inBox)).toBe(0);
	});
});

test.describe('spacing (§6)', () => {
	test('o-box padding matches the pad tokens', async ({ page }) => {
		await page.goto('/v2-objects.html');
		const padBlock = await px(page, 'var(--v-pad-block)');
		const padInline = await px(page, 'var(--v-pad-inline)');
		const padding = await page.evaluate(() => {
			const style = getComputedStyle(document.querySelector('#box-basic')!);
			return {
				top: parseFloat(style.paddingTop),
				left: parseFloat(style.paddingLeft),
			};
		});
		expect(padding.top).toBeCloseTo(padBlock, 1);
		// inline pad floors at the box radius — at defaults they coincide
		expect(padding.left).toBeGreaterThanOrEqual(padInline - 0.5);
	});

	test('stack and group gaps apply', async ({ page }) => {
		await page.goto('/v2-objects.html');
		const gapBlock = await px(page, 'var(--v-gap-block)');
		const gapInline = await px(page, 'var(--v-gap-inline)');

		const stackGap = await page.evaluate(() => {
			const children = document.querySelectorAll('#stack-basic > *');
			const a = children[0]!.getBoundingClientRect();
			const b = children[1]!.getBoundingClientRect();
			return b.top - a.bottom;
		});
		expect(stackGap).toBeCloseTo(gapBlock, 1);

		const groupGap = await page.evaluate(() => {
			const children = document.querySelectorAll('#group-basic > *');
			const a = children[0]!.getBoundingClientRect();
			const b = children[1]!.getBoundingClientRect();
			return b.left - a.right;
		});
		expect(groupGap).toBeCloseTo(gapInline, 1);
	});
});

test.describe('layout reflow', () => {
	test('o-grid is multi-column wide, single-column narrow', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 900 });
		await page.goto('/v2-objects.html');
		const wideColumns = await page.evaluate(
			() =>
				getComputedStyle(document.querySelector('#grid-basic')!).gridTemplateColumns.split(
					' ',
				).length,
		);
		expect(wideColumns).toBeGreaterThan(1);

		await page.setViewportSize({ width: 400, height: 900 });
		const narrowColumns = await page.evaluate(
			() =>
				getComputedStyle(document.querySelector('#grid-basic')!).gridTemplateColumns.split(
					' ',
				).length,
		);
		expect(narrowColumns).toBe(1);
	});

	test('o-split collapses to stacked at narrow width', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 900 });
		await page.goto('/v2-objects.html');
		const wide = await page.evaluate(
			() => getComputedStyle(document.querySelector('#split-basic')!).flexDirection,
		);
		expect(wide).toBe('row');

		await page.setViewportSize({ width: 500, height: 900 });
		const narrow = await page.evaluate(
			() => getComputedStyle(document.querySelector('#split-basic')!).flexDirection,
		);
		expect(narrow).toBe('column');
	});
});
