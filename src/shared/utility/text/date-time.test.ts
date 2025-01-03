import { formatDate, formatDateTime, formatTime } from '~/shared/utility/text/date-time';

describe('Date time formatting', () => {
	describe('formatDate', () => {
		it('formats dates', () => {
			expect(formatDate(new Date(2021, 0, 1), 'en-US')).toEqual('Jan 1, 2021');
		});

		it('formats dates with different locales', () => {
			expect(formatDate(new Date(2021, 0, 1), 'fr-FR')).toEqual('1 janv. 2021');
		});
	});

	describe('formatTime', () => {
		it('formats times', () => {
			expect(formatTime(new Date(2021, 0, 1, 13, 34), 'en-US')).toEqual('1:34 PM');
		});

		it('formats times with different locales', () => {
			expect(formatTime(new Date(2021, 0, 1, 13, 34), 'fr-FR')).toEqual('13:34');
		});
	});

	describe('formatDateTime', () => {
		it('formats date times', () => {
			expect(formatDateTime(new Date(2021, 0, 1, 13, 34), 'en-US')).toEqual(
				'Jan 1, 2021, 1:34 PM',
			);
		});

		it('formats date times with different locales', () => {
			expect(formatDateTime(new Date(2021, 0, 1, 13, 34), 'fr-FR')).toEqual(
				'1 janv. 2021, 13:34',
			);
		});
	});
});
