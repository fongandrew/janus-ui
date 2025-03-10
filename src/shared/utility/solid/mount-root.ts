import { type JSX } from 'solid-js';
import { DelegatedEvents, render } from 'solid-js/web';

// Add the change event to the list of delegated events since we make somewhat heavy use of it
DelegatedEvents.add('change');

export function mountRoot(fn: () => JSX.Element, id = 'root') {
	const root = document.getElementById(id);
	if (root instanceof HTMLElement) {
		render(fn, root);
		return;
	}

	throw new Error(
		'Root element not found. Did you forget to add it to your HTML file? Or maybe the id attribute got misspelled?',
	);
}
