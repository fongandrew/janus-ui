/**
 * Are we in a dev environment? Test counts as dev in this context.
 */
export function isDev() {
	return !!import.meta.env.MODE && import.meta.env.MODE !== 'production';
}
