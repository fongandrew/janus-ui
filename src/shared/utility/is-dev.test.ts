import { describe, expect, it } from 'vitest';

import { isDev } from '~/shared/utility/is-dev';

describe('isDev', () => {
	it('returns true when in test mode', () => {
		expect(isDev()).toBe(true);
	});
});
