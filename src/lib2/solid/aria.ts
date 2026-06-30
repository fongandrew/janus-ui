/**
 * Helpers at the framework boundary (§13.1). `ariaize` is opinionated and
 * non-negotiable: a Janus component never emits the native `disabled` /
 * `required` HTML attributes, only their `aria-*` equivalents -- this keeps
 * controls focusable and announced, and is the contract `dom/form`'s
 * disabled-state filtering relies on.
 */

export interface AriaizeProps {
	disabled?: boolean | undefined;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
}

export interface AriaizeAttrs {
	'aria-disabled'?: true;
	'aria-required'?: true;
	'aria-invalid'?: true;
}

/** `disabled` -> `aria-disabled`, `required` -> `aria-required`, `invalid` -> `aria-invalid`. Never the native `disabled`/`required` attributes. */
export function ariaize(p: AriaizeProps): AriaizeAttrs {
	const attrs: AriaizeAttrs = {};
	if (p.disabled) {
		attrs['aria-disabled'] = true;
	}
	if (p.required) {
		attrs['aria-required'] = true;
	}
	if (p.invalid) {
		attrs['aria-invalid'] = true;
	}
	return attrs;
}

/** Space-join ARIA token strings, skipping falsy parts. Prefer `ca` (from `~/lib2/dom`) when merging whole prop objects. */
export function attrs(...parts: (string | false | null | undefined)[]): string | undefined {
	const joined = parts.filter((part): part is string => !!part).join(' ');
	return joined || undefined;
}
