/**
 * Get and set some common UI prefs in local storage as CSS variables
 */

import { activeDocuments, registerDocumentSetup } from '~/lib/utility/document-setup';
import { parentDocument } from '~/lib/utility/multi-view';
import { getStoredValue, removeStoredValue, setStoredValue } from '~/lib/utility/storage';

/**
 * Synchronously get the pref value as a CSS style attribute (may not be accurate if
 * registration hasn't had a chance to run yet).
 */
export function getStylePref(pref: string): string | null {
	return parentDocument?.documentElement.style.getPropertyValue(pref) || null;
}

/** Asynchronously get the pref value (more accurate) */
export async function getStoredStylePref(pref: string): Promise<string | null> {
	return getStoredValue(pref);
}

/** Set one of the prefs as a CSS variable */
export async function setStylePref(pref: string, value: string | null) {
	if (typeof value === 'string') {
		for (const document of activeDocuments) {
			document.documentElement.style.setProperty(pref, value);
		}
		await setStoredValue(pref, value);
	} else {
		for (const document of activeDocuments) {
			document.documentElement.style.removeProperty(pref);
		}
		await removeStoredValue(pref);
	}
}

/** Array of UI prefs we're tracking */
const prefs = new Set<string>();

/** Initialize an style pref to initialize */
export async function registerStylePref(pref: string) {
	prefs.add(pref);
}

/** Initialize CSS variable prefs from storage */
export async function evalStylePrefs(document: Document) {
	for (const pref of prefs) {
		const value = await getStoredStylePref(pref);
		if (typeof value === 'string') {
			document.documentElement.style.setProperty(pref, value);
		} else {
			document.documentElement.style.removeProperty(pref);
		}
	}
}

/**
 * Register init function for style prefs -- don't call it right away in case
 * we want to muck with storage first
 */
export async function registerStylePrefSetup() {
	registerDocumentSetup(evalStylePrefs);
}
