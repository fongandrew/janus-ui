import { createHandler } from '~/lib/utility/callback-attrs/events';
import { createMounter } from '~/lib/utility/callback-attrs/mount';

/**
 * Treat enter key as a click on certain elements. With inputs, general browser
 * behavior is to ignore enter because enter is for submitting forms. But forms
 * don't submit on checkbox or radios or toggle switches. So we treat enter
 * as a click on these elements.
 */
export const checkboxEnter = createHandler('keydown', '$c-checkbox__enter', (event) => {
	if (event.key === 'Enter') {
		event.currentTarget.click();
		event.preventDefault();
	}
});

/**
 * Set this checkbox to indeterminate state on mount. This is useful for checkboxes that
 */
export const checkboxIndeterminate = createMounter('$c-checkbox__indeterminate', (elm) => {
	(elm as HTMLInputElement).indeterminate = true;
});

/**
 * Update checked state on click. This is needed because the checkbox input itself is visually
 * hidden, and we need to toggle it when the parent is clicked.
 * Screenreaders will do this automatically when interacting with the input directly.
 */
export const checkboxClick = createHandler('click', '$c-checkbox__click', (event) => {
	// If we clicked directly on the input, let the browser handle it
	if (event.target instanceof HTMLInputElement) return;

	// Find the input inside the checkbox container
	const input = event.currentTarget.querySelector<HTMLInputElement>('input');
	if (input) {
		// Stop propagation and prevent default to avoid double toggling a checkbox
		event.stopImmediatePropagation();
		event.preventDefault();

		// Move click to input itself
		input.click();
	}
});
