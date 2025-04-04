import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createMounter } from '~/shared/utility/callback-attrs/mount';

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
