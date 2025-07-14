import { createMemo, createUniqueId } from 'solid-js';

/**
 * Memo function for automatically generating a prop or deferring to explicit prop
 */
export function createAuto<TProps extends Record<string, any>, TKey extends keyof TProps>(
	props: TProps,
	key: TKey & (TProps[TKey] extends string | null | undefined ? TKey : never),
): () => string {
	// Just complaining because we return result and it can't analyze that
	// eslint-disable-next-line solid/reactivity
	return createMemo(() => props[key] ?? createUniqueId());
}

/**
 * Memoized ID generator
 */
export function createAutoId(props: { id?: string | null | undefined }) {
	return createAuto(props, 'id');
}
