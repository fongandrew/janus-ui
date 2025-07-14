import { createHandler } from '~/lib/utility/callback-attrs/events';
import { createMounter } from '~/lib/utility/callback-attrs/mount';
import { parseIntOrNull } from '~/lib/utility/parse';
import { getStoredAnimationPref, setAnimationPref } from '~/lib/utility/ui-prefs/animation';
import { getStoredColorScheme, setColorScheme } from '~/lib/utility/ui-prefs/color-scheme';
import {
	type FontFamilyOption,
	getFontFamilies,
	getStoredFontFamily,
	setFontFamily,
} from '~/lib/utility/ui-prefs/font-family';
import {
	DEFAULT_FONT_SIZE,
	getStoredFontSize,
	setFontSize,
} from '~/lib/utility/ui-prefs/font-size';

/** Mounter to set initial color scheme value */
export const prefsMountColorScheme = createMounter('$p-prefs__color-scheme-mount', async (el) => {
	const value = await getStoredColorScheme();
	const input = el.querySelector<HTMLInputElement>(`input[value="${value || 'system'}"]`);
	if (input) {
		input.checked = true;
	}
});

/** Change listener to set color scheme pref */
export const prefsChangeColorScheme = createHandler('change', '$p-prefs__color-scheme', (ev) => {
	const value = ev.currentTarget.querySelector('input:checked')?.getAttribute('value');
	setColorScheme(value === 'light' || value === 'dark' ? value : null);
});

/** Mounter to set initial animation value */
export const prefsMountAnimation = createMounter('$p-prefs__animation-mount', async (el) => {
	const value = await getStoredAnimationPref();
	const input = el.querySelector<HTMLInputElement>(`input[value="${value || 'system'}"]`);
	if (input) {
		input.checked = true;
	}
});

/** Change listener to set animation pref */
export const prefsChangeAnimation = createHandler('change', '$p-prefs__animation', (ev) => {
	const value = ev.currentTarget.querySelector('input:checked')?.getAttribute('value');
	setAnimationPref(value === 'true' || value === 'false' ? value === 'true' : null);
});

/** Mounter to set initial font value */
export const prefsMountFontFamily = createMounter('$p-prefs__font-family-mount', async (el) => {
	const value = (await getStoredFontFamily()) || getFontFamilies()[0].value;
	const input = el.querySelector<HTMLInputElement>(`input[value="${value}"]`);
	if (input) {
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}
});

/** Change listener to set font family value */
export const prefsChangeFontFamily = createHandler('change', '$p-prefs__font-family', (ev) => {
	const value = ev.currentTarget.querySelector('input:checked')?.getAttribute('value');
	if (!value) return;
	setFontFamily(value as FontFamilyOption);
});

/** Mounter to set initial font size value */
export const prefsMountFontSize = createMounter('$p-prefs__font-size-mount', async (el) => {
	const value = (await getStoredFontSize()) || DEFAULT_FONT_SIZE;
	// Parse and toString is just to remove the `px` suffix
	(el as HTMLInputElement).value = parseIntOrNull(value)?.toString() ?? '';
	(el as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
});

/** Change listener to set font size value */
export const prefsChangeFontSize = createHandler('change', '$p-prefs__font-size', (ev) => {
	const value = parseIntOrNull((ev.currentTarget as HTMLInputElement).value);
	if (!value) return;
	setFontSize(value ? `${value}px` : null);
});
