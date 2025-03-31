import { DEFAULT_LOCALE } from '~/shared/utility/text/default-locale';

/**
 * Generic text wrapper template tag. This is a placeholder for a real
 * translation tag that would handle translation of text strings.
 */
function t(strings: TemplateStringsArray, ...values: any[]): string {
	return strings.reduce((result, string, i) => {
		return result + string + (values[i] !== undefined ? values[i] : '');
	}, '');
}

// Registry to store custom t functions for testing
const tFunctionRegistry: Record<string, typeof t> = {};

/**
 * Register a custom t function for a specific locale (for testing purposes)
 */
export function registerTFunction(locale: string, tFunction: typeof t) {
	tFunctionRegistry[locale] = tFunction;
}

/**
 * Clear all registered custom t functions (for testing cleanup)
 */
export function clearTFunctions() {
	Object.keys(tFunctionRegistry).forEach((key) => {
		delete tFunctionRegistry[key];
	});
}

/**
 * Get the translation function associated with a given locale. This is a placeholder
 * for a real translation function that would handle translation of text strings.
 */
export function getT(locale: string) {
	return tFunctionRegistry[locale] || t;
}

/**
 * Get the translation function associated with a given element.
 */
export function elmT(element: Element) {
	const locale = element.ownerDocument.documentElement.lang || DEFAULT_LOCALE;
	return getT(locale);
}
