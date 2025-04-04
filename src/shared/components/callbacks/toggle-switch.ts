import { createHandler } from '~/shared/utility/callback-attrs/events';

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
