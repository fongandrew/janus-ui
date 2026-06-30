/** Combine multiple Solid ref callbacks into one (e.g. a component's own ref need plus a consumer-supplied `ref`). */
export function combineRefs<T>(...refs: (((el: T) => void) | T | undefined)[]): (el: T) => void {
	return (el: T) => {
		for (const ref of refs) {
			if (typeof ref === 'function') {
				(ref as (el: T) => void)(el);
			}
		}
	};
}
