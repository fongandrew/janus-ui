/**
 * Minimal Solid helpers internal to `src/lib2/solid`. Kept intentionally tiny —
 * the wrappers are thin, so this only holds genuinely shared glue.
 */

export type Ref<T> = ((el: T) => void) | T | undefined;

/**
 * Combine multiple Solid refs into a single ref callback. Lets a wrapper attach
 * its own ref (e.g. to wire a DOM listener) while still forwarding a
 * consumer-supplied `ref`. Only function refs are invoked — that's what Solid
 * passes down when a parent spreads `ref` onto a component.
 */
export function mergeRefs<T>(...refs: Ref<T>[]): (el: T) => void {
	return (el: T) => {
		for (const ref of refs) {
			if (typeof ref === 'function') (ref as (el: T) => void)(el);
		}
	};
}
