/**
 * Get and set some common UI prefs in local storage as HTML attributes
 */

import { activeDocuments, registerDocumentSetup } from '~/shared/utility/document-setup';
import { parentDocument } from '~/shared/utility/multi-view';
import { getStoredValue, removeStoredValue, setStoredValue } from '~/shared/utility/storage';

/**
 * Synchronously get the pref value as an attribute (may not be accurate if registration hasn't had
 * change to run yet).
 */
export function getAttrPref(pref: string): string | null {
	return parentDocument?.documentElement.getAttribute(pref) ?? null;
}

/** Asynchronously get the pref value (more accurate) */
export async function getStoredAttrPref(pref: string): Promise<string | null> {
	return getStoredValue(pref);
}

/** Set one of the prefs as an attribute */
export async function setAttrPref(pref: string, value: string | null) {
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

/** Array of UI prefs we're tracking */
const prefs = new Set<string>();

/** Initialize an attribute pref to initialize */
export async function registerAttrPref(pref: string) {
	prefs.add(pref);
}

/** Initialize attribute prefs from storage -- can call to re-eval if needed */
export async function evalAttrPrefs(document: Document) {
	for (const pref of prefs) {
		const value = await getStoredAttrPref(pref);
		if (typeof value === 'string') {
			document.documentElement.setAttribute(pref, value);
		} else {
			document.documentElement.removeAttribute(pref);
		}
	}
}

/**
 * Register init function for attr prefs -- don't call it right away in case
 * we want to muck with storage first
 */
export async function registerAttrPrefSetup() {
	registerDocumentSetup(evalAttrPrefs);
}
