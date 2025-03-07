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
export function attrNoConflict<T = string>(a: T, b: T | null | undefined): T;
export function attrNoConflict<T = string>(a: T | null | undefined, b: T): T;
export function attrNoConflict<T = string>(
	a: T | null | undefined,
	b: T | null | undefined,
): T | null | undefined;
export function attrNoConflict<T = string>(
	a: T | null | undefined,
	b: T | null | undefined,
): T | null | undefined {
	if (a && b && a !== b) {
		throw new Error(`Conflicting attributes: ${String(a)} and ${String(b)}`);
	}
	return a || b;
}

/** Set attribute if truthy, remove otherwise */
export function attrBool(element: Element, attr: string, value: boolean): void {
	if (value) {
		element.setAttribute(attr, '');
	} else {
		element.removeAttribute(attr);
	}
}
