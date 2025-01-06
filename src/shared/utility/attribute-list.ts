/**
 * Given an attribute list that is a space separated list of items (like ARIA ID lists
 * or class names), this adds or removes the given items from the list.
 */
export function updateAttributeList(
	element: HTMLElement,
	attribute: string,
	toAdd: string[],
	toRemove: string[] = [],
) {
	const current = element.getAttribute(attribute) ?? '';
	const currentSet = current ? new Set(current.split(' ')) : new Set<string>();
	for (const item of toAdd) {
		currentSet.add(item);
	}
	for (const item of toRemove) {
		currentSet.delete(item);
	}
	const updated = Array.from(currentSet).join(' ');
	if (updated) {
		element.setAttribute(attribute, updated);
	} else {
		element.removeAttribute(attribute);
	}
}
