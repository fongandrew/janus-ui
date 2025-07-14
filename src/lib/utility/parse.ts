/** parseInt but with isNaN built in */
export function parseIntOrNull(value: string | null, radix = 10): number | null {
	const parsed = parseInt(value ?? '', radix);
	return isNaN(parsed) ? null : parsed;
}

/** parseFloat but with isNaN built in */
export function parseFloatOrNull(value: string | null): number | null {
	const parsed = parseFloat(value ?? '');
	return isNaN(parsed) ? null : parsed;
}
