/**
 * Helpers at the framework boundary (§13.1).
 */

export interface AriaizeInput {
	disabled?: boolean | undefined;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
}

export interface AriaizeOutput {
	'aria-disabled'?: 'true';
	'aria-required'?: 'true';
	'aria-invalid'?: 'true';
}

/**
 * Enforced: `disabled` -> `aria-disabled`. Native `disabled` is never
 * emitted by a Janus component — keeps controls focusable + announced.
 * dom/'s form engine filters aria-disabled inputs from submission.
 */
export function ariaize(p: AriaizeInput): AriaizeOutput {
	const out: AriaizeOutput = {};
	if (p.disabled) out['aria-disabled'] = 'true';
	if (p.required) out['aria-required'] = 'true';
	if (p.invalid) out['aria-invalid'] = 'true';
	return out;
}

/**
 * Space-join ARIA token strings (aria-describedby, aria-labelledby, data-js)
 * for the narrow inline case where you've already destructured one attr
 * value and just need a join. Prefer `ca` when merging whole prop objects.
 */
export function attrs(...parts: (string | false | null | undefined)[]): string | undefined {
	const joined = parts.filter(Boolean).join(' ');
	return joined || undefined;
}
