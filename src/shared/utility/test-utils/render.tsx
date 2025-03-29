import { render as testRender } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

import { processRoot } from '~/shared/utility/callback-attrs/mount';

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
export async function render(cb: () => JSX.Element) {
	const { container, unmount } = testRender(cb);
	if (!isServer) {
		// Mount callbacks don't run synchronously
		await new Promise((resolve) => requestAnimationFrame(resolve));
		return container;
	}

	const html = container.innerHTML;
	unmount();

	const tempContainer = document.createElement('div');
	tempContainer.innerHTML = html;
	document.body.appendChild(tempContainer);

	// Run mount callbacks
	processRoot(tempContainer);

	// Schedule cleanup
	cleanUps.add(() => {
		// Remove the temporary container from the document
		tempContainer.remove();
	});

	return tempContainer;
}
