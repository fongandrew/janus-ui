import { t } from '~/shared/utility/text/t-tag';

describe('t', () => {
	it('works just like a template literal', () => {
		expect(t`Hello, ${'world'}! Testing ${123}`).toBe('Hello, world! Testing 123');
	});
});
