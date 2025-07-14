import { createHandler } from '~/lib/utility/callback-attrs/events';

/** Data attribute for identifying which icon to show */
export const TOGGLE_ICON_ATTR = 'data-toggle-icon';

/**
 * Synchronize the toggle switch's `aria-checked` attribute with the `checked` property.
 * Kinda unclear whether this is necessary if underlying element *is* a checkbox
 * but https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role
 * says `aria-checked` is required.
 *
 * Also changes the icon
 */
export const toggleSwitchChange = createHandler('change', '$c-toggle-switch__change', (event) => {
	const target = event.target as HTMLInputElement;
	const checked = target.checked;
	target.setAttribute('aria-checked', checked.toString());

	// Assume this handler is on the container
	event.currentTarget
		?.querySelector<HTMLElement>(`[${TOGGLE_ICON_ATTR}='on']`)
		?.classList.toggle('t-hidden', !checked);
	event.currentTarget
		?.querySelector<HTMLElement>(`[${TOGGLE_ICON_ATTR}='off']`)
		?.classList.toggle('t-hidden', checked);
});
