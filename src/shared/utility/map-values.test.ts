import { mapValues } from '~/shared/utility/map-values';

describe('mapValues', () => {
	it('transforms the values of a record', () => {
		const obj = { a: 1, b: 2, c: 3 };
		const result = mapValues(obj, (value) => value * 2);
		expect(result).toEqual({ a: 2, b: 4, c: 6 });
	});
});
