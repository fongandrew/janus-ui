import { createHandler } from '~/shared/utility/callback-attrs/events';

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
