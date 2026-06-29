import { memoizeFactory } from '~/lib2/utils/memoize/memoize-factory';

export const memoizeWeak = memoizeFactory(
	(obj: object) => obj,
	() => new WeakMap(),
);
