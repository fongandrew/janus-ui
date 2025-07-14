import { describe, expect, it } from 'vitest';

import { getT } from '~/lib/utility/text/t-tag';

describe('t', () => {
	it('works just like a template literal', () => {
		const t = getT('en-US');
		expect(t`Hello, ${'world'}! Testing ${123}`).toBe('Hello, world! Testing 123');
	});
});
