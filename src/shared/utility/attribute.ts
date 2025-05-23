/** More robust attribute checks so we don't have to worry about attr="" vs attr="true" */
export function attrIsTruthy(element: Element, attr: string): boolean {
	const value = element.getAttribute(attr);
	return typeof value === 'string' && value !== 'false';
}

/**
 * Given two attribute values, return the non-null / defined one. If both
 * non-null and defined, throw. This is used in prop mods where, e.g, a
 * parent wants to pass down an ID and we want to make sure the child doesn't
 * pass a conflicting one.
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
	if ((a ?? b ?? null) !== (b ?? a ?? null)) {
		throw new Error(`Conflicting attributes: ${String(a)} and ${String(b)}`);
	}
	if (a === null && b === undefined) {
		return null;
	}
	return a || b;
}

/**
 * Set multiple attributes on an element. Generally use something like Solid or
 * a rendering framework for this but this works when we want vanilla JS
 */
export function setAttrs(
	element: HTMLElement,
	attributes: Record<string, string | number | boolean | null | undefined>,
) {
	for (const key in attributes) {
		const value = attributes[key];
		if (value === undefined) {
			continue;
		}
		if (value === null) {
			element.removeAttribute(key);
			continue;
		}
		element.setAttribute(key, String(value));
	}
	return element;
}
