import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isThisYear, isToday, sameDate, sameYear } from '~/shared/utility/datetime/same-date';

describe('datetime utility functions', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('sameDate', () => {
		it('returns true for same dates with different times', () => {
			const dateA = new Date('2023-05-15T00:00:00Z');
			const dateB = new Date('2023-05-15T23:59:59Z');
			expect(sameDate(dateA, dateB)).toBe(true);
		});

		it('returns false for different dates', () => {
			const dateA = new Date('2023-05-15T12:00:00Z');
			const dateB = new Date('2023-05-16T12:00:00Z');
			expect(sameDate(dateA, dateB)).toBe(false);
		});

		it('accepts timestamp numbers as parameters', () => {
			const dateA = new Date('2023-05-15T00:00:00Z').getTime();
			const dateB = new Date('2023-05-15T23:59:59Z').getTime();
			expect(sameDate(dateA, dateB)).toBe(true);
		});

		it('accepts mixed Date and number parameters', () => {
			const dateA = new Date('2023-05-15T00:00:00Z');
			const dateB = new Date('2023-05-15T23:59:59Z').getTime();
			expect(sameDate(dateA, dateB)).toBe(true);
		});
	});

	describe('isToday', () => {
		const fixedDate = new Date('2023-05-15T12:00:00Z');

		beforeEach(() => {
			vi.setSystemTime(fixedDate);
		});

		it('returns true for today', () => {
			const todayDate = new Date('2023-05-15T08:30:00Z');
			expect(isToday(todayDate)).toBe(true);
		});

		it('returns false for yesterday', () => {
			const yesterdayDate = new Date('2023-05-14T12:00:00Z');
			expect(isToday(yesterdayDate)).toBe(false);
		});

		it('returns false for tomorrow', () => {
			const tomorrowDate = new Date('2023-05-16T12:00:00Z');
			expect(isToday(tomorrowDate)).toBe(false);
		});

		it('accepts timestamp number as parameter', () => {
			const todayTimestamp = new Date('2023-05-15T08:30:00Z').getTime();
			expect(isToday(todayTimestamp)).toBe(true);
		});
	});

	describe('sameYear', () => {
		it('returns true for dates in the same year', () => {
			const dateA = new Date('2023-01-01T00:00:00Z');
			const dateB = new Date('2023-12-31T23:59:59Z');
			expect(sameYear(dateA, dateB)).toBe(true);
		});

		it('returns false for dates in different years', () => {
			const dateA = new Date('2023-12-31T12:00:00Z');
			const dateB = new Date('2024-01-01T12:00:00Z');
			expect(sameYear(dateA, dateB)).toBe(false);
		});

		it('accepts timestamp numbers as parameters', () => {
			const dateA = new Date('2023-01-01T00:00:00Z').getTime();
			const dateB = new Date('2023-12-31T23:59:59Z').getTime();
			expect(sameYear(dateA, dateB)).toBe(true);
		});

		it('accepts mixed Date and number parameters', () => {
			const dateA = new Date('2023-01-01T00:00:00Z');
			const dateB = new Date('2023-12-31T23:59:59Z').getTime();
			expect(sameYear(dateA, dateB)).toBe(true);
		});
	});

	describe('isThisYear', () => {
		const fixedDate = new Date('2023-05-15T12:00:00Z');

		beforeEach(() => {
			vi.setSystemTime(fixedDate);
		});

		it('returns true for a date in the current year', () => {
			const currentYearDate = new Date('2023-01-01T08:30:00Z');
			expect(isThisYear(currentYearDate)).toBe(true);
		});

		it('returns false for a date in the previous year', () => {
			const lastYearDate = new Date('2022-12-31T12:00:00Z');
			expect(isThisYear(lastYearDate)).toBe(false);
		});

		it('returns false for a date in the next year', () => {
			const nextYearDate = new Date('2024-01-01T12:00:00Z');
			expect(isThisYear(nextYearDate)).toBe(false);
		});

		it('accepts timestamp number as parameter', () => {
			const currentYearTimestamp = new Date('2023-11-30T08:30:00Z').getTime();
			expect(isThisYear(currentYearTimestamp)).toBe(true);
		});
	});
});
