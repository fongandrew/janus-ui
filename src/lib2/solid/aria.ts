/**
 * Helpers at the framework boundary (§13.1).
 */

/**
 * Enforced: `disabled` -> `aria-disabled` (never the native `disabled`), so
 * Janus controls stay focusable + announced and the form engine can filter them
 * from submission. Also maps `required` / `invalid` to their ARIA forms.
 */
export function ariaize(p: {
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
}): {
	'aria-disabled'?: true;
	'aria-required'?: true;
	'aria-invalid'?: true;
} {
	const out: { 'aria-disabled'?: true; 'aria-required'?: true; 'aria-invalid'?: true } = {};
	if (p.disabled) out['aria-disabled'] = true;
	if (p.required) out['aria-required'] = true;
	if (p.invalid) out['aria-invalid'] = true;
	return out;
}

/** Space-join ARIA token strings, dropping falsy parts. */
export function attrs(...parts: (string | false | null | undefined)[]): string | undefined {
	const kept = parts.filter((p): p is string => typeof p === 'string' && p.length > 0);
	return kept.length ? kept.join(' ') : undefined;
}
