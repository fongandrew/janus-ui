export function ariaize(props: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(props)) {
		if (key === 'disabled') {
			result['aria-disabled'] = value ? 'true' : undefined;
		} else {
			result[key] = value;
		}
	}
	return result;
}

export function attrs(...values: (string | undefined | null | false)[]): string | undefined {
	const filtered = values.filter((v): v is string => typeof v === 'string' && v.length > 0);
	return filtered.length > 0 ? filtered.join(' ') : undefined;
}
