import { expect, test } from '@playwright/test';

const HARNESS = '/src/lib/css/test-harness.html';

function getCSSVar(varName: string) {
	return `getComputedStyle(document.documentElement).getPropertyValue('${varName}').trim()`;
}

test.describe('CSS tokens', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(HARNESS);
	});

	test('primary knobs resolve to non-empty values', async ({ page }) => {
		const knobs = [
			'--v-spacing',
			'--v-radius',
			'--v-border-width',
			'--v-input-height',
			'--v-font-size',
			'--v-line-height',
			'--v-bg',
			'--v-fg',
			'--v-link',
			'--v-accent',
			'--v-muted',
			'--v-shadow-outer',
			'--v-shadow-inner',
		];

		for (const knob of knobs) {
			const value = await page.evaluate(getCSSVar(knob));
			expect(value, `${knob} should be non-empty`).not.toBe('');
		}
	});

	test('secondary knobs resolve to non-empty values', async ({ page }) => {
		const knobs = [
			'--v-pad-block',
			'--v-pad-inline',
			'--v-gap-block',
			'--v-gap-inline',
			'--v-font-size-h1',
			'--v-font-size-h2',
			'--v-font-size-h3',
			'--v-font-size-caption',
			'--v-font-size-code',
			'--v-border-color',
			'--v-ring',
			'--v-ring-alt',
			'--v-shadow-focus',
			'--v-duration',
			'--v-ease',
		];

		for (const knob of knobs) {
			const value = await page.evaluate(getCSSVar(knob));
			expect(value, `${knob} should be non-empty`).not.toBe('');
		}
	});

	test('dark mode changes --v-bg and --v-fg', async ({ page }) => {
		const lightBg = await page.evaluate(getCSSVar('--v-bg'));

		await page.evaluate(() => {
			document.documentElement.setAttribute(
				'data-v-color-scheme',
				'dark',
			);
		});

		const darkBg = await page.evaluate(getCSSVar('--v-bg'));
		expect(lightBg).not.toBe(darkBg);
	});

	test('headings have decreasing font sizes', async ({ page }) => {
		const sizes = await page.evaluate(() => {
			const headings = ['h1', 'h2', 'h3'] as const;
			return headings.map((tag) => {
				const el = document.querySelector(tag);
				return el ? parseFloat(getComputedStyle(el).fontSize) : 0;
			});
		});

		expect(sizes[0]!).toBeGreaterThan(sizes[1]!);
		expect(sizes[1]!).toBeGreaterThan(sizes[2]!);
	});

	test('links have --v-link color', async ({ page }) => {
		const linkColor = await page.evaluate(() => {
			const link = document.querySelector('a[href]');
			return link ? getComputedStyle(link).color : '';
		});
		expect(linkColor).not.toBe('');
		expect(linkColor).not.toBe('rgb(0, 0, 0)');
	});

	test('body has background from --v-body-bg', async ({ page }) => {
		const bg = await page.evaluate(() =>
			getComputedStyle(document.body).background,
		);
		expect(bg).toContain('linear-gradient');
	});
});
