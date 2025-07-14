import {
	getStoredStylePref,
	getStylePref,
	registerStylePref,
	setStylePref,
} from '~/lib/utility/ui-prefs/ui-style-prefs';

/** Font size property */
export const FONT_SIZE_PROP = 'font-size';

/** Default font size when no preference is set */
export const DEFAULT_FONT_SIZE = '16px';

/** Valid font size pattern (in pixels) */
const VALID_FONT_SIZE_PATTERN = /^\d+px$/;

/** Validate font size value */
function isValidFontSize(value: string): boolean {
	return VALID_FONT_SIZE_PATTERN.test(value);
}

/** Set the font size, null = system default */
export function setFontSize(value: string | null) {
	if (value !== null && !isValidFontSize(value)) {
		throw new Error(`Invalid font size: ${value}. Font size must be in pixels (e.g., "16px").`);
	}
	return setStylePref(FONT_SIZE_PROP, value);
}

/** Get the font size override from storage (if any) */
export async function getStoredFontSize(): Promise<string | null> {
	return getStoredStylePref(FONT_SIZE_PROP);
}

/** Get the current font size based on override or default */
export function getFontSize(): string {
	return getStylePref(FONT_SIZE_PROP) || DEFAULT_FONT_SIZE;
}

/** Initialize the font size preference */
registerStylePref(FONT_SIZE_PROP);
