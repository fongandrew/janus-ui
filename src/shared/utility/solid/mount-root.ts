import { type JSX, onMount } from 'solid-js';
import { DelegatedEvents, render } from 'solid-js/web';

import { addMounterRenderEffect } from '~/shared/utility/callback-attrs/mount';
import { parentDocument } from '~/shared/utility/multi-view';
import { useWindow } from '~/shared/utility/solid/window-context';

// Add the change event to the list of delegated events since we make somewhat heavy use of it
DelegatedEvents.add('change');

// Tie mounter attributes into the Solid lifecycle
addMounterRenderEffect((scheduleProcessRoot) => {
	const window = useWindow();
	onMount(() => {
		if (!window) return;
		scheduleProcessRoot(window);
	});
});

export function mountRoot(fn: () => JSX.Element, id = 'root') {
	const root = parentDocument?.getElementById(id);
	if (root instanceof HTMLElement) {
		render(fn, root);
		return;
	}

	throw new Error(
		'Root element not found. Did you forget to add it to your HTML file? Or maybe the id attribute got misspelled?',
	);
}
