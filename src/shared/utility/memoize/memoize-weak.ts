import { memoizeFactory } from '~/shared/utility/memoize/memoize-factory';

export const memoizeWeak = memoizeFactory(
	(obj: object) => obj,
	() => new WeakMap(),
);
