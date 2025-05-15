import { useT } from '~/shared/utility/solid/locale-context';
import {
	getStoredStylePref,
	registerStylePref,
	setStylePref,
} from '~/shared/utility/ui-prefs/ui-style-prefs';

/** Font family CSS variable */
export const FONT_FAMILY_VAR = '--v-default-font-family';

/**
 * Min-boldness variable -- used to bump the "bold" font weight for certain
 * fonts that often don't support the full range of weights.
 */
export const MIN_BOLDNESS_VAR = '--v-font-weight-min-bold';

/** Default font family when no preference is set */
export const DEFAULT_FONT_FAMILY = 'system-ui, sans-serif';

/** Web safe font options with descriptive names */
export const getFontFamilies = () => {
	const t = useT();
	return [
		{
			name: t`System UI`,
			value: 'system-ui, sans-serif',
			minBold: null,
		},
		{
			name: t`Arial`,
			value: 'Arial, sans-serif',
			minBold: 600,
		},
		{
			name: t`Comic Sans`,
			value: '"Comic Sans MS", Comic Neue, cursive, sans-serif',
			minBold: 600,
		},
		{
			name: t`Courier New`,
			value: 'Courier New, Courier, monospace',
			minBold: 600,
		},
		{
			name: t`Georgia`,
			value: 'Georgia, serif',
			minBold: 600,
		},
		{
			name: t`Times New Roman`,
			value: 'Times New Roman, Times, serif',
			minBold: 600,
		},
		{
			name: t`Verdana`,
			value: 'Verdana, Geneva, sans-serif',
			minBold: 600,
		},
	] as const;
};

/** Font family option keys */
export type FontFamilyOption = ReturnType<typeof getFontFamilies>[number]['value'] | null;

/** Set the font family, null = system default */
export async function setFontFamily(option: FontFamilyOption) {
	const fontFamiles = getFontFamilies();
	if (option?.startsWith('system-ui')) {
		option = fontFamiles[0].value;
	}
	for (const family of fontFamiles) {
		if (family.value !== option) continue;
		await setStylePref(FONT_FAMILY_VAR, option?.startsWith('system-ui') ? null : option);
		await setStylePref(MIN_BOLDNESS_VAR, family.minBold && String(family.minBold));
		return;
	}
}

/** Get the font family override from storage (if any) */
export async function getStoredFontFamily(): Promise<FontFamilyOption> {
	return getStoredStylePref(FONT_FAMILY_VAR) as Promise<FontFamilyOption>;
}

/** Initialize the font family preference */
registerStylePref(FONT_FAMILY_VAR);
