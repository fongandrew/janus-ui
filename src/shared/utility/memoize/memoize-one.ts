import { memoizeFactory } from '~/shared/utility/memoize/memoize-factory';

/** Memoize a single static value that never changes */
export const memoizeOne = memoizeFactory(
	() => 'key',
	() => new Map(),
);
