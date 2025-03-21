/**
 * Get and set some common UI prefs in local storage
 */

import { activeDocuments, registerDocumentSetup } from '~/shared/utility/document-setup';
import { parentDocument } from '~/shared/utility/multi-view';
import { getStoredValue, removeStoredValue, setStoredValue } from '~/shared/utility/storage';

/**
 * Synchronously get the pref value (may not be accurate if registration hasn't had
 * change to run yet).
 */
export function getPref(pref: string): string | null {
	return parentDocument?.documentElement.getAttribute(pref) ?? null;
}

/** Asynchronously get the pref value (more accurate) */
export async function getStoredPref(pref: string): Promise<string | null> {
	return getStoredValue(pref);
}

/** Set one of the prefs we've identified */
export async function setPref(pref: string, value: string | null) {
	if (typeof value === 'string') {
		for (const document of activeDocuments) {
			document.documentElement.setAttribute(pref, value);
		}
		await setStoredValue(pref, value);
	} else {
		for (const document of activeDocuments) {
			document.documentElement.removeAttribute(pref);
		}
		await removeStoredValue(pref);
	}
}

/** Initialize prefs from storage */
export async function registerPrefInit(pref: string) {
	registerDocumentSetup(async (document) => {
		const value = await getStoredPref(pref);
		if (typeof value === 'string') {
			document.documentElement.setAttribute(pref, value);
		}
	});
}
