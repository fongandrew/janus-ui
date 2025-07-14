/** Returns a base-36 hash using djb2 */
export function djb2Base36(str: string): string {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return (hash >>> 0).toString(36);
}
