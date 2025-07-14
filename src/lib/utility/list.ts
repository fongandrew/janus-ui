/** Remove first instance of item from list */
export function pull<T>(arr: T[], item: T) {
	const index = arr.indexOf(item);
	if (index >= 0) {
		arr.splice(index, 1);
	}
}

/** Remove last instance of item from list */
export function pullLast<T>(arr: T[], item: T) {
	const index = arr.lastIndexOf(item);
	if (index >= 0) {
		arr.splice(index, 1);
	}
}
