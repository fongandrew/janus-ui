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

/**
 * Get the translation function associated with a given locale. This is a placeholder
 * for a real translation function that would handle translation of text strings.
 */
export function getT(_locale: string) {
	return t;
}

/**
 * Get the translation function associated with a given element.
 */
export function elmT(element: Element) {
	const locale = element.ownerDocument.documentElement.lang || DEFAULT_LOCALE;
	return getT(locale);
}
