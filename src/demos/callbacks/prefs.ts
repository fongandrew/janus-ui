import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createMounter } from '~/shared/utility/callback-attrs/mount';
import { getStoredAnimationPref, setAnimationPref } from '~/shared/utility/ui-prefs/animation';
import { getStoredColorScheme, setColorScheme } from '~/shared/utility/ui-prefs/color-scheme';

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
