/**
 * Combines multiple Solid ref callbacks
 */
export function combineRefs<T>(
	...refs: (((val: T) => void) | T | null | undefined)[]
): (val: T) => void {
	return (val: T) => {
		for (const ref of refs) {
			// Solid allows `let` variable assignment in JSX, which results in the ref
			// being typed as `T` itself, but Solid will actually pass a function as
			// the actual props.ref the first time it's called, so we can work with that.
			if (typeof ref === 'function') {
				(ref as (val: T) => void)(val);
			}
		}
	};
}
