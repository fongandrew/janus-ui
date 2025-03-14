/**
 * Generic text wrapper template tag. This is a placeholder for a real
 * translation tag that would handle translation of text strings.
 */
export function t(strings: TemplateStringsArray, ...values: any[]): string {
	return strings.reduce((result, string, i) => {
		return result + string + (values[i] !== undefined ? values[i] : '');
	}, '');
}
