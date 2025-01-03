import { formatRelativeTime, formatRelativeTimeNarrow } from '~/shared/utility/text/relative-time';

describe('relative time formmating', () => {
	const now = new Date(2021, 0, 1, 12, 34).getTime();

	beforeEach(() => {
		vi.spyOn(Date, 'now').mockReturnValue(now);
	});

	describe('formatRelativeTime', () => {
		it('formats relative time in the future', () => {
			const time = new Date(2021, 0, 1, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('in 2 minutes');
		});

		it('cascades units for relative time in the future', () => {
			let time = new Date(2021, 0, 1, 14, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('in 2 hours');

			time = new Date(2021, 0, 3, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('in 2 days');

			time = new Date(2021, 1, 1, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('next month');

			time = new Date(2022, 0, 1, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('next year');
		});

		it('formats relative time in the past', () => {
			const time = new Date(2021, 0, 1, 12, 32).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('2 minutes ago');
		});

		it('cascades units for relative time in the past', () => {
			let time = new Date(2021, 0, 1, 10, 34).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('2 hours ago');

			time = new Date(2020, 11, 30, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('2 days ago');

			time = new Date(2020, 11, 1, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('last month');

			time = new Date(2020, 0, 1, 12, 36).getTime();
			expect(formatRelativeTime(time, 'en-US')).toEqual('last year');
		});
	});

	describe('formatRelativeTimeNarrow', () => {
		it('formats relative time in the future', () => {
			const time = new Date(2021, 0, 1, 12, 36).getTime();
			expect(formatRelativeTimeNarrow(time, 'en-US')).toEqual('in 2m');
		});

		it('formats relative time in the past', () => {
			const time = new Date(2021, 0, 1, 12, 32).getTime();
			expect(formatRelativeTimeNarrow(time, 'en-US')).toEqual('2m ago');
		});
	});
});
