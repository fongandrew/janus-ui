export function setBoolAttr(
	element: HTMLElement,
	name: string,
	value: string | boolean | null | undefined,
) {
	if (value || typeof value === 'string') {
		element.setAttribute(name, String(value));
	} else {
		element.removeAttribute(name);
	}
}
