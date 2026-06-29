/**
 * Solid-specific helpers at the framework boundary (§13.1).
 */

/**
 * Enforced: `disabled` → `aria-disabled`. A Janus component never emits the native
 * HTML `disabled` attribute — keeping controls focusable and announced. `dom/`'s
 * form engine filters aria-disabled inputs from submission. Likewise `required` →
 * `aria-required` and `invalid` → `aria-invalid`. Only `true` values are emitted.
 */
export function ariaize(p: {
	disabled?: boolean | undefined;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
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

/**
 * Space-join ARIA token strings (`aria-describedby`, `aria-labelledby`) for the
 * narrow inline case where you've already destructured one attr value and just need
 * a join. Prefer `ca` when merging whole prop objects. Returns `undefined` when no
 * truthy parts remain.
 */
export function attrs(...parts: (string | false | null | undefined)[]): string | undefined {
	const joined = parts
		.filter((p): p is string => typeof p === 'string' && p.length > 0)
		.join(' ');
	return joined.length ? joined : undefined;
}
