import { parentWindow } from '~/shared/utility/multi-view';
import {
	getPref,
	getStoredPref,
	registerPrefInit,
	setPref,
} from '~/shared/utility/ui-prefs/ui-prefs';

/** Dark mode / light mode */
const COLOR_SCHEME_ATTR = 'data-color-scheme';

/** Set the color scheme, null = system */
export function setColorScheme(value: 'light' | 'dark' | null) {
	return setPref(COLOR_SCHEME_ATTR, value);
}

/** Normalize color scheme values */
function parseColorScheme(value: string | null): 'light' | 'dark' | null {
	if (value === 'light') return 'light';
	if (value === 'dark') return 'dark';
	return null;
}

/** Get the color scheme override (if any) */
export async function getStoredColorScheme() {
	return parseColorScheme(await getStoredPref(COLOR_SCHEME_ATTR));
}

/** Get the color scheme based on override + browser settings */
export function getColorScheme() {
	const current = parseColorScheme(getPref(COLOR_SCHEME_ATTR));
	if (current) return current;
	return parentWindow?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

registerPrefInit(COLOR_SCHEME_ATTR);
