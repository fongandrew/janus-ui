import { memoizeFactory } from './memoize-factory';

export const memoizeWeak = memoizeFactory(
	(obj: object) => obj,
	() => new WeakMap(),
);
