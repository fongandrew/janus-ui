import { createHandler } from '~/shared/utility/callback-attrs/events';

/**
 * Treat enter key as a click on the toggle switch. Because toggle is input, general browser
 * behavior is to ignore enter because enter is for submitting forms. But toggle switch
 * functions more like button than input (and is rarely in a form anyways).
 */
export const toggleSwitchEnter = createHandler('keydown', '$c-toggle-switch__enter', (event) => {
	if (event.key === 'Enter') {
		event.currentTarget.click();
		event.preventDefault();
	}
});

/**
 * Synchronize the toggle switch's `aria-checked` attribute with the `checked` property.
 * Kinda unclear whether this is necessary if underlying element *is* a checkbox
 * but https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role
 * says `aria-checked` is required.
 */
export const toggleSwitchChange = createHandler('change', '$c-toggle-switch__change', (event) => {
	const target = event.currentTarget as HTMLElement;
	const checked = (target as HTMLInputElement).checked;
	target.setAttribute('aria-checked', checked.toString());
});
