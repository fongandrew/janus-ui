/** More robust attribute checks so we don't have to worry about attr="" vs attr="true" */
export function attrIsTruthy(element: Element, attr: string): boolean {
	const value = element.getAttribute(attr);
	return typeof value === 'string' && value !== 'false';
}
