/*
	Phase 3 component-CSS E2E (desktop). Targets the framework-free component gallery
	(/v2-components.html) — raw markup + CSS, no JS — and asserts the visual chrome the
	components are supposed to apply: button padding/radius/hover, card elevation + surface
	differences, input embossing + focus ring + invalid border, checkbox/toggle checked
	states, and tonal alert colouring. JS behaviours (opening modals, anchor-positioned
	tooltips) are Phase 5 and out of scope here.
*/
import { expect, type Page, test } from '@playwright/test';

const URL = '/v2-components.html';

/** Resolved computed style for the first element matching `selector`. */
async function styleOf(page: Page, selector: string, props: string[]) {
	return page.evaluate(
		({ selector, props }) => {
			const el = document.querySelector(selector);
			if (!el) return null;
			const cs = getComputedStyle(el);
			return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
		},
		{ selector, props },
	);
}

test('c-button: control sizing, radius, and a hover shadow', async ({ page }) => {
	await page.goto(URL);

	const btn = (await styleOf(page, '#buttons .c-button', [
		'min-block-size',
		'border-radius',
		'padding-inline-start',
	]))!;
	// Height = --v-input-height (2.5rem = 40px); the cascade radius + floored inline pad.
	expect(parseFloat(btn['min-block-size']!)).toBeCloseTo(40, 0);
	expect(parseFloat(btn['border-radius']!)).toBeGreaterThan(0);
	expect(parseFloat(btn['padding-inline-start']!)).toBeGreaterThan(0);

	// Hover raises a shadow that isn't present at rest.
	const rest = (await styleOf(page, '#buttons .c-button', ['box-shadow']))!;
	expect(rest['box-shadow']).toBe('none');
	await page.hover('#buttons .c-button');
	const hovered = (await styleOf(page, '#buttons .c-button', ['box-shadow']))!;
	expect(hovered['box-shadow']).not.toBe('none');
});

test('c-button--icon is square; tonal variants change the background', async ({ page }) => {
	await page.goto(URL);

	const icon = await page.locator('#buttons .c-button--icon').boundingBox();
	expect(icon!.width).toBeCloseTo(icon!.height, 0);

	const secondary = (await styleOf(page, '#buttons .c-button', ['background-color']))!;
	const primary = (await styleOf(page, '#buttons .c-button.v-colors-primary', [
		'background-color',
	]))!;
	const danger = (await styleOf(page, '#buttons .c-button.v-colors-danger', [
		'background-color',
	]))!;
	expect(primary['background-color']).not.toBe(secondary['background-color']);
	expect(danger['background-color']).not.toBe(primary['background-color']);
});

test('c-card has a border, radius, and resting shadow; elevated differs from card', async ({
	page,
}) => {
	await page.goto(URL);

	const card = (await styleOf(page, '#cards .c-card', [
		'box-shadow',
		'border-top-width',
		'border-radius',
	]))!;
	expect(card['box-shadow']).not.toBe('none');
	expect(parseFloat(card['border-top-width']!)).toBeGreaterThan(0);
	expect(parseFloat(card['border-radius']!)).toBeGreaterThan(0);

	const surfaceCard = (await styleOf(page, '#cards .v-surface-card', ['box-shadow']))!;
	const elevated = (await styleOf(page, '#cards .v-surface-elevated', ['box-shadow']))!;
	expect(elevated['box-shadow']).not.toBe(surfaceCard['box-shadow']);
});

test('c-input: embossed, control-height, focus ring, and an invalid border', async ({ page }) => {
	await page.goto(URL);

	const input = (await styleOf(page, '#inputs .c-input', ['box-shadow', 'min-block-size']))!;
	expect(input['box-shadow']).not.toBe('none');
	expect(parseFloat(input['min-block-size']!)).toBeCloseTo(40, 0);

	// Focus raises the ring (outline width grows from 0).
	await page.focus('#inputs .c-input');
	const focused = (await styleOf(page, '#inputs .c-input:focus-visible', ['outline-width']))!;
	expect(parseFloat(focused['outline-width']!)).toBeGreaterThan(0);

	// The invalid input's border differs from a normal one.
	const normal = (await styleOf(page, '#inputs .c-input', ['border-top-color']))!;
	const invalid = (await styleOf(page, '#inputs .c-input[aria-invalid="true"]', [
		'border-top-color',
	]))!;
	expect(invalid['border-top-color']).not.toBe(normal['border-top-color']);
});

test('checkbox + toggle: checked states differ from unchecked', async ({ page }) => {
	await page.goto(URL);

	// Checked checkbox box flips tone (background) vs an unchecked one.
	const checked = await page.evaluate(() => {
		const box = document.querySelector(
			'#checks .c-checkbox:has(input:checked) .c-checkbox__box',
		);
		return box ? getComputedStyle(box).backgroundColor : null;
	});
	const unchecked = await page.evaluate(() => {
		const box = document.querySelector(
			'#checks .c-checkbox:not(:has(input:checked)) .c-checkbox__box',
		);
		return box ? getComputedStyle(box).backgroundColor : null;
	});
	expect(checked).not.toBeNull();
	expect(checked).not.toBe(unchecked);

	// The on-toggle's thumb is translated to the far end (the off-toggle's isn't).
	const onThumb = await page.evaluate(() => {
		const t = document.querySelector('#checks .c-toggle:has(input:checked) .c-toggle__thumb');
		return t ? getComputedStyle(t).transform : null;
	});
	expect(onThumb).not.toBe('none');
	expect(onThumb).not.toBeNull();
});

test('alerts: tonal variants colour differently', async ({ page }) => {
	await page.goto(URL);

	const success = (await styleOf(page, '#alerts .v-colors-success', ['background-color']))!;
	const danger = (await styleOf(page, '#alerts .v-colors-danger', ['background-color']))!;
	expect(success['background-color']).not.toBe(danger['background-color']);
});

test('@chromium-only c-tooltip uses the inverted tone (dark in light mode)', async ({ page }) => {
	await page.goto(URL);

	// Parse the tooltip background lightness — it should read as a dark layer in light mode.
	const lightness = await page.evaluate(() => {
		const el = document.querySelector('#overlays .c-tooltip');
		if (!el) return null;
		const probe = document.createElement('div');
		probe.style.color = getComputedStyle(el).backgroundColor;
		document.body.appendChild(probe);
		const [r = 0, g = 0, b = 0] = (
			getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) ?? []
		).map(Number);
		// Rough perceptual lightness from sRGB.
		return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	});
	expect(lightness).not.toBeNull();
	expect(lightness!).toBeLessThan(0.5);
});
