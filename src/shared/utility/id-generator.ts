let index = 0;

export function generateId(prefix = 'id-') {
	return `${prefix}-${index++}`;
}
