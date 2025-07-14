import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as sameDate from '~/lib/utility/datetime/same-date';
import {
	formatDate,
	formatDateContextual,
	formatDateContextualNumeric,
	formatDateNoYear,
	formatDateNoYearNumeric,
	formatDateNumeric,
	formatDateTime,
	formatDateTimeContextual,
	formatDateTimeContextualNumeric,
	formatDateTimeNoYear,
	formatDateTimeNumeric,
	formatDateTimeNumericNoYear,
	formatMonth,
	formatTime,
} from '~/lib/utility/text/date-time';

describe('Date time formatting', () => {
	describe('formatDate', () => {
		it('formats dates', () => {
			expect(formatDate(new Date(2021, 0, 1), 'en-US')).toEqual('Jan 1, 2021');
		});

		it('formats dates with different locales', () => {
			expect(formatDate(new Date(2021, 0, 1), 'fr-FR')).toEqual('1 janv. 2021');
		});
	});

	describe('formatDateNoYear', () => {
		it('formats dates without year', () => {
			expect(formatDateNoYear(new Date(2021, 0, 1), 'en-US')).toEqual('Jan 1');
		});

		it('formats dates without year with different locales', () => {
			expect(formatDateNoYear(new Date(2021, 0, 1), 'fr-FR')).toEqual('1 janv.');
		});
	});

	describe('formatDateNumeric', () => {
		it('formats dates numerically', () => {
			expect(formatDateNumeric(new Date(2021, 0, 1), 'en-US')).toEqual('1/1/2021');
		});

		it('formats dates numerically with different locales', () => {
			expect(formatDateNumeric(new Date(2021, 0, 1), 'fr-FR')).toEqual('01/01/2021');
		});
	});

	describe('formatDateNoYearNumeric', () => {
		it('formats dates numerically without year', () => {
			expect(formatDateNoYearNumeric(new Date(2021, 0, 1), 'en-US')).toEqual('1/1');
		});

		it('formats dates numerically without year with different locales', () => {
			expect(formatDateNoYearNumeric(new Date(2021, 0, 1), 'fr-FR')).toEqual('01/01');
		});
	});

	describe('formatDateContextual', () => {
		it('formats dates without year when it is this year', () => {
			vi.spyOn(sameDate, 'isThisYear').mockReturnValue(true);
			expect(formatDateContextual(new Date(2021, 0, 1), 'en-US')).toEqual('Jan 1');
			vi.restoreAllMocks();
		});

		it('formats dates with year when it is not this year', () => {
			vi.spyOn(sameDate, 'isThisYear').mockReturnValue(false);
			expect(formatDateContextual(new Date(2021, 0, 1), 'en-US')).toEqual('Jan 1, 2021');
			vi.restoreAllMocks();
		});
	});

	describe('formatDateContextualNumeric', () => {
		it('formats dates numerically without year when it is this year', () => {
			vi.spyOn(sameDate, 'isThisYear').mockReturnValue(true);
			expect(formatDateContextualNumeric(new Date(2021, 0, 1), 'en-US')).toEqual('1/1');
			vi.restoreAllMocks();
		});

		it('formats dates numerically with year when it is not this year', () => {
			vi.spyOn(sameDate, 'isThisYear').mockReturnValue(false);
			expect(formatDateContextualNumeric(new Date(2021, 0, 1), 'en-US')).toEqual('1/1/2021');
			vi.restoreAllMocks();
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

	describe('formatMonth', () => {
		it('formats month', () => {
			expect(formatMonth(new Date(2021, 0, 1), 'en-US')).toEqual('January');
		});

		it('formats month with different locales', () => {
			expect(formatMonth(new Date(2021, 0, 1), 'fr-FR')).toEqual('janvier');
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

	describe('formatDateTimeNoYear', () => {
		it('formats date times without year', () => {
			expect(formatDateTimeNoYear(new Date(2021, 0, 1, 13, 34), 'en-US')).toEqual(
				'Jan 1, 1:34 PM',
			);
		});

		it('formats date times without year with different locales', () => {
			expect(formatDateTimeNoYear(new Date(2021, 0, 1, 13, 34), 'fr-FR')).toEqual(
				'1 janv., 13:34',
			);
		});
	});

	describe('formatDateTimeNumeric', () => {
		it('formats date times numerically', () => {
			expect(formatDateTimeNumeric(new Date(2021, 0, 1, 13, 34), 'en-US')).toEqual(
				'1/1/2021, 1:34 PM',
			);
		});

		it('formats date times numerically with different locales', () => {
			expect(formatDateTimeNumeric(new Date(2021, 0, 1, 13, 34), 'fr-FR')).toEqual(
				'01/01/2021 13:34',
			);
		});
	});

	describe('formatDateTimeNumericNoYear', () => {
		it('formats date times numerically without year', () => {
			expect(formatDateTimeNumericNoYear(new Date(2021, 0, 1, 13, 34), 'en-US')).toEqual(
				'1/1, 1:34 PM',
			);
		});

		it('formats date times numerically without year with different locales', () => {
			expect(formatDateTimeNumericNoYear(new Date(2021, 0, 1, 13, 34), 'fr-FR')).toEqual(
				'01/01 13:34',
			);
		});
	});

	describe('formatDateTimeContextual', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('formats times when it is today', () => {
			// Set the current date to January 1, 2021
			const currentDate = new Date(2021, 0, 1, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from the same day
			const date = new Date(2021, 0, 1, 13, 34);
			expect(formatDateTimeContextual(date, 'en-US')).toEqual('1:34 PM');
		});

		it('formats with weekday when within 5 days cutoff', () => {
			// Set the current date to January 5, 2021
			const currentDate = new Date(2021, 0, 5, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from 3 days ago (Jan 2, 2021)
			const date = new Date(2021, 0, 2, 13, 34);

			// This should use formatDateTimeWithWeekday
			expect(formatDateTimeContextual(date, 'en-US')).toEqual('Sat, 1:34 PM');
		});

		it('formats date times without year when it is this year but outside cutoff', () => {
			// Set the current date to January 15, 2021
			const currentDate = new Date(2021, 0, 15, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from more than 5 days ago but same year (Jan 1, 2021)
			const date = new Date(2021, 0, 1, 13, 34);

			// This should use formatDateTimeNoYear
			expect(formatDateTimeContextual(date, 'en-US')).toEqual('Jan 1, 1:34 PM');
		});

		it('formats date times with year when it is not this year', () => {
			// Set the current date to January 1, 2021
			const currentDate = new Date(2021, 0, 1, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from previous year (Dec 25, 2020)
			const date = new Date(2020, 11, 25, 13, 34);

			// This should use formatDateTime
			expect(formatDateTimeContextual(date, 'en-US')).toEqual('Dec 25, 2020, 1:34 PM');
		});
	});

	describe('formatDateTimeContextualNumeric', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('formats times when it is today', () => {
			// Set the current date to January 1, 2021
			const currentDate = new Date(2021, 0, 1, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from the same day
			const date = new Date(2021, 0, 1, 13, 34);
			expect(formatDateTimeContextualNumeric(date, 'en-US')).toEqual('1:34 PM');
		});

		it('formats with weekday when within 5 days cutoff', () => {
			// Set the current date to January 5, 2021
			const currentDate = new Date(2021, 0, 5, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from 3 days ago (Jan 2, 2021)
			const date = new Date(2021, 0, 2, 13, 34);

			// This should use formatDateTimeWithWeekday
			expect(formatDateTimeContextualNumeric(date, 'en-US')).toEqual('Sat, 1:34 PM');
		});

		it('formats date times numerically without year when it is this year but outside cutoff', () => {
			// Set the current date to January 15, 2021
			const currentDate = new Date(2021, 0, 15, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from more than 5 days ago but same year (Jan 1, 2021)
			const date = new Date(2021, 0, 1, 13, 34);

			// This should use formatDateTimeNumericNoYear
			expect(formatDateTimeContextualNumeric(date, 'en-US')).toEqual('1/1, 1:34 PM');
		});

		it('formats date times numerically with year when it is not this year', () => {
			// Set the current date to January 1, 2021
			const currentDate = new Date(2021, 0, 1, 12, 0);
			vi.setSystemTime(currentDate);

			// Date from previous year (Dec 25, 2020)
			const date = new Date(2020, 11, 25, 13, 34);

			// This should use formatDateTimeNumeric
			expect(formatDateTimeContextualNumeric(date, 'en-US')).toEqual('12/25/2020, 1:34 PM');
		});
	});
});
