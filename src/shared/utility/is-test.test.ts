import { isTest } from '~/shared/utility/is-test';

describe('isTest', () => {
	it('returns true when in test mode', () => {
		expect(isTest()).toBe(true);
	});
});
