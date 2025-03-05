/** More robust attribute checks so we don't have to worry about attr="" vs attr="true" */
export function attrIsTruthy(element: Element, attr: string): boolean {
	const value = element.getAttribute(attr);
	return typeof value === 'string' && value !== 'false';
}

/**
 * Given two attribute strings, return the truthy one. If both truthy, throw.
 * This is used in prop mods where, e.g, a parent wants to pass down an ID
 * and we want to make sure the child doesn't pass a conflicting one.
 */
export function attrNoConflict(a: string, b: string | null | undefined): string;
export function attrNoConflict(a: string | null | undefined, b: string): string;
export function attrNoConflict(
	a: string | null | undefined,
	b: string | null | undefined,
): string | null | undefined {
	if (a && b && a !== b) {
		throw new Error(`Conflicting attributes: ${a} and ${b}`);
	}
	return a || b;
}
