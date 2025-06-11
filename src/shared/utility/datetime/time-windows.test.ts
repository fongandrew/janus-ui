import { describe, expect, it } from 'vitest';

import {
	decodeTimeStrToMinutes,
	decodeTimeStrToTuple,
	deltaMinutes,
	encodeTimestampToTimeStr,
	getNextTimeOccurrence,
	isTimeInWindow,
	type TimeWindow,
} from '~/shared/utility/datetime/time-windows';

process.env.TZ = 'UTC'; // Set timezone to UTC for consistent testing

describe('Time Windows Utilities', () => {
	describe('decodeTimeStrToTuple', () => {
		it('decodes valid time strings correctly', () => {
			expect(decodeTimeStrToTuple('09:30')).toEqual([9, 30]);
			expect(decodeTimeStrToTuple('00:00')).toEqual([0, 0]);
			expect(decodeTimeStrToTuple('23:59')).toEqual([23, 59]);
		});

		it('throws an error for invalid time strings', () => {
			expect(() => decodeTimeStrToTuple('24:00')).toThrow();
			expect(() => decodeTimeStrToTuple('12:60')).toThrow();
			expect(() => decodeTimeStrToTuple('invalid')).toThrow();
		});
	});

	describe('decodeTimeStrToMinutes', () => {
		it('converts time strings to total minutes correctly', () => {
			expect(decodeTimeStrToMinutes('00:00')).toBe(0);
			expect(decodeTimeStrToMinutes('12:30')).toBe(750);
			expect(decodeTimeStrToMinutes('23:59')).toBe(1439);
		});
	});

	describe('encodeTimestampToTimeStr', () => {
		it('converts timestamps to time strings correctly', () => {
			// Assumes we're hard-coded to UTC
			expect(encodeTimestampToTimeStr(1704067200)).toBe('00:00');
			expect(encodeTimestampToTimeStr(1704110400)).toBe('12:00');
			expect(encodeTimestampToTimeStr(1704112530)).toBe('12:35');
			expect(encodeTimestampToTimeStr(1704153599)).toBe('23:59');
		});
	});

	describe('isTimeInWindow', () => {
		it('returns true for times within the window', () => {
			const window: TimeWindow = { start: '09:00', end: '17:00' };
			expect(isTimeInWindow('10:00', window)).toBe(true);
			expect(isTimeInWindow('09:00', window)).toBe(true);
			expect(isTimeInWindow('17:00', window)).toBe(true);
		});

		it('returns false for times outside the window', () => {
			const window: TimeWindow = { start: '09:00', end: '17:00' };
			expect(isTimeInWindow('08:59', window)).toBe(false);
			expect(isTimeInWindow('17:01', window)).toBe(false);
		});

		it('handles windows that cross midnight', () => {
			const window: TimeWindow = { start: '22:00', end: '06:00' };
			expect(isTimeInWindow('23:00', window)).toBe(true);
			expect(isTimeInWindow('05:00', window)).toBe(true);
			expect(isTimeInWindow('22:00', window)).toBe(true);
			expect(isTimeInWindow('06:00', window)).toBe(true);
			expect(isTimeInWindow('21:00', window)).toBe(false);
			expect(isTimeInWindow('07:00', window)).toBe(false);
		});

		describe('with buffers', () => {
			it('includes times within the pre-buffer', () => {
				const window: TimeWindow = { start: '09:00', end: '17:00' };
				expect(isTimeInWindow('08:45', window, 30)).toBe(true);
				expect(isTimeInWindow('08:29', window, 30)).toBe(false);
			});

			it('includes times within the post-buffer', () => {
				const window: TimeWindow = { start: '09:00', end: '17:00' };
				expect(isTimeInWindow('17:15', window, 0, 30)).toBe(true);
				expect(isTimeInWindow('17:31', window, 0, 30)).toBe(false);
			});

			it('handles windows that become midnight-crossing due to buffers', () => {
				const window: TimeWindow = { start: '23:00', end: '23:59' };
				// Without buffer
				expect(isTimeInWindow('22:45', window)).toBe(false);
				expect(isTimeInWindow('00:05', window)).toBe(false);
				// With buffer
				expect(isTimeInWindow('22:45', window, 30, 30)).toBe(true);
				expect(isTimeInWindow('00:05', window, 30, 30)).toBe(true);
			});

			it('handles full day coverage due to buffers', () => {
				const window: TimeWindow = { start: '00:00', end: '23:59' };
				expect(isTimeInWindow('00:00', window, 1, 1)).toBe(true);
				expect(isTimeInWindow('12:00', window, 1, 1)).toBe(true);
				expect(isTimeInWindow('23:59', window, 1, 1)).toBe(true);
			});

			it('handles negative post-buffer', () => {
				const window: TimeWindow = { start: '09:00', end: '17:00' };
				expect(isTimeInWindow('17:00', window, 0, -1)).toBe(false);
				expect(isTimeInWindow('16:59', window, 0, -1)).toBe(true);
			});
		});
	});

	describe('deltaMinutes', () => {
		describe('with string inputs', () => {
			it('should calculate delta within same day (morning to afternoon)', () => {
				expect(deltaMinutes('09:00', '17:00')).toBe(480); // 8 hours = 480 minutes
			});

			it('should calculate delta within same hour', () => {
				expect(deltaMinutes('09:15', '09:45')).toBe(30);
			});

			it('should handle same time', () => {
				expect(deltaMinutes('12:00', '12:00')).toBe(0);
			});

			it('should wrap around midnight (night to morning)', () => {
				expect(deltaMinutes('23:00', '01:00')).toBe(120); // 23:00 to 01:00 = 2 hours
			});
		});

		describe('with number inputs (minutes since midnight)', () => {
			it('should calculate delta with number inputs', () => {
				expect(deltaMinutes(540, 1020)).toBe(480); // 9:00 to 17:00 = 480 minutes
			});

			it('should wrap around midnight with numbers', () => {
				expect(deltaMinutes(1380, 60)).toBe(120); // 23:00 to 01:00 = 2 hours
			});
		});

		describe('with mixed string and number inputs', () => {
			it('should handle string from, number to', () => {
				expect(deltaMinutes('09:00', 1020)).toBe(480); // 9:00 to 17:00
			});

			it('should handle number from, string to', () => {
				expect(deltaMinutes(540, '17:00')).toBe(480); // 9:00 to 17:00
			});

			it('should handle midnight wrap with mixed inputs', () => {
				expect(deltaMinutes('23:30', 30)).toBe(60); // 23:30 to 00:30
			});
		});

		describe('getNextTimeOccurrence', () => {
			it('returns the target time today if it has not passed', () => {
				const currentTime = new Date('2024-01-01T10:00:00Z').getTime();
				const result = getNextTimeOccurrence('15:30', currentTime);
				const expected = new Date('2024-01-01T15:30:00Z').getTime();
				expect(result).toBe(expected);
			});

			it('returns the target time tomorrow if it has already passed today', () => {
				const currentTime = new Date('2024-01-01T16:00:00Z').getTime();
				const result = getNextTimeOccurrence('15:30', currentTime);
				const expected = new Date('2024-01-02T15:30:00Z').getTime();
				expect(result).toBe(expected);
			});

			it('returns the target time tomorrow if current time equals target time', () => {
				const currentTime = new Date('2024-01-01T15:30:00Z').getTime();
				const result = getNextTimeOccurrence('15:30', currentTime);
				const expected = new Date('2024-01-02T15:30:00Z').getTime();
				expect(result).toBe(expected);
			});

			it('handles midnight target time correctly', () => {
				const currentTime = new Date('2024-01-01T23:30:00Z').getTime();
				const result = getNextTimeOccurrence('00:00', currentTime);
				const expected = new Date('2024-01-02T00:00:00Z').getTime();
				expect(result).toBe(expected);
			});
		});
	});
});
