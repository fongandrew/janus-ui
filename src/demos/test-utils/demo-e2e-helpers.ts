import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * Test a component by navigating to its demo page and running the provided test function
 * @param [pages] Optional array of page paths to test the component on. Defaults to both
 * root and SSR pages.
 * @param id The HTML ID of the demo section
 * @param fn The test function to run, which receives a locator function
 */
export function describeComponent(
	id: string,
	fn: (locator: () => Locator, page: string) => void,
): void;
export function describeComponent(
	pages: string[],
	id: string,
	fn: (locator: () => Locator, page: string) => void,
): void;
export function describeComponent(
	idOrPaths: string | string[],
	idOrFn: string | ((locator: () => Locator, page: string) => void),
	fn?: (locator: () => Locator, page: string) => void,
): void {
	// By default, test both main component page and SSR specific one
	const paths = Array.isArray(idOrPaths) ? idOrPaths : ['/', '/ssr'];
	const id = typeof idOrPaths === 'string' ? idOrPaths : (idOrFn as string);
	const testFn = typeof idOrFn === 'function' ? idOrFn : fn;
	if (!testFn) return;

	for (const path of paths) {
		test.describe(`${path}#${id}`, () => {
			let locator: Locator;

			test.beforeEach(async ({ page }) => {
				locator = await navigateToDemo(page, path, id);
			});

			testFn(() => locator, path);
		});
	}
}

/**
 * Helper to navigate to and get a specific demo container
 * @param page Playwright page object
 * @param demoId The HTML ID of the demo section
 * @returns The demo container locator
 */
export async function navigateToDemo(page: Page, path: string, demoId: string): Promise<Locator> {
	await page.goto(path);

	// Find the demo element and scroll to it
	const demoContainer = page.locator(`#${demoId}`);
	await demoContainer.scrollIntoViewIfNeeded();

	// Verify the demo is visible
	await expect(demoContainer).toBeVisible();

	// Return the container so tests can scope their selectors to it
	return demoContainer;
}
