import { parentWindow } from '~/shared/utility/multi-view';
import {
	getPref,
	getStoredPref,
	registerPrefInit,
	setPref,
} from '~/shared/utility/ui-prefs/ui-prefs';

/** Animations on or off */
const ANIMATION_ATTR = 'data-animation';

/** Set the animation pref, null = system*/
export function setAnimationPref(value: boolean | null) {
	return setPref(ANIMATION_ATTR, typeof value === 'boolean' ? String(value) : null);
}

/** Convert animation pref string to value */
function parseAnimationPref(value: string | null): boolean | null {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return null;
}

/** Get the animation pref override (if any) */
export async function getStoredAnimationPref() {
	return parseAnimationPref(await getStoredPref(ANIMATION_ATTR));
}

/** Get the animation pref based on override + browser settings */
export function getAnimationPref() {
	const current = parseAnimationPref(getPref(ANIMATION_ATTR));
	if (current) return current;
	return parentWindow?.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : true;
}

registerPrefInit(ANIMATION_ATTR);
