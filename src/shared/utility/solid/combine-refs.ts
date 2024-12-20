/**
 * Combines multiple Solid ref callbacks
 */
export function combineRefs<T>(
	...refs: (((val: T) => void) | null | undefined)[]
): (val: T) => void {
	return (val: T) => {
		for (const ref of refs) {
			ref?.(val);
		}
	};
}
