import { render as testRender } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

import { processRoot } from '~/shared/utility/callback-attrs/mount';
import { raf } from '~/shared/utility/test-utils/raf';
import { getTestMode } from '~/shared/utility/test-utils/test-mode';

/** Auto clean up between tests */
const cleanUps = new Set<() => void>();

afterEach(() => {
	cleanUps.forEach((fn) => fn());
	cleanUps.clear();
});

/**
 * A SolidJS test renderer that works in both reactive SPA mode and an SSR + vanilla JS modes,
 * depending on whether `isServer` is set (see vitest.setup.ts). SSR mode is really a "fake"
 * SSR mode that renders the component using the client-side test renderer and then extracts
 * the HTML string. But it allows us to test that the HTML works with non-Solid JS handler
 * code without spinning up a second process or server.
 */
export async function renderContainer(cb: () => JSX.Element) {
	const { container, unmount } = testRender(cb);
	if (!isServer) {
		// Mount callbacks don't run synchronously
		await raf();

		// This normally happens via `addMounterRenderEffect` but not guarantee
		// that's loaded in test, so do it manually here
		processRoot(container);

		return container;
	}

	const html = container.innerHTML;
	unmount();

	const tempContainer = document.createElement('div');
	tempContainer.innerHTML = html;
	document.body.appendChild(tempContainer);

	// Keep async so server tests can test pre-mount code by just
	// checking DOM synchronously
	await raf();

	// Run mount callbacks
	processRoot(tempContainer);

	// Schedule cleanup
	cleanUps.add(() => {
		// Remove the temporary container from the document
		tempContainer.remove();
	});

	return tempContainer;
}

/**
 * Renders a SolidJS component from a given module. Takes an actual module string
 * because this switches between CSR and SSR (with help from vite-plugin-solid-html)
 * depending on the TEST_MODE). For when we want to run the same set of tests on
 * the CSR + SSR & vanilla JS variants of a component.
 */
export async function renderImport(path: string, name = 'default') {
	if (getTestMode() === 'ssr') {
		const mod = (await import(`solid-html:${path}:${name}`)) as { default?: string };
		const html = mod.default;
		if (typeof html !== 'string') {
			throw new Error(`Unable to render ${name} from ${path} as string`);
		}

		const tempContainer = document.createElement('div');
		tempContainer.innerHTML = html;
		document.body.appendChild(tempContainer);

		// Keep async so server tests can test pre-mount code by just
		// checking DOM synchronously
		await raf();

		// Run mount callbacks
		processRoot(tempContainer);

		// Schedule cleanup
		cleanUps.add(() => {
			// Remove the temporary container from the document
			tempContainer.remove();
		});

		return tempContainer;
	}

	const mod = await import(path);
	const Component = mod[name];

	if (typeof Component !== 'function') {
		throw new Error(`${name} from ${path} is not a function`);
	}

	const { container } = testRender(() => <Component />);

	// Mount callbacks don't run synchronously
	await raf();

	// This normally happens via `addMounterRenderEffect` but not guarantee
	// that's loaded in test, so do it manually here
	processRoot(container);

	return container;
}
