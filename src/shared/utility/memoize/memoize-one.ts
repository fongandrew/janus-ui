import { memoizeFactory } from '~/shared/utility/memoize/memoize-factory';

export const memoizeOne = memoizeFactory(
	() => 'key',
	() => new Map(),
);
