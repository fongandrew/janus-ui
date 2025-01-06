import { memoizeLast } from '~/shared/utility/memoize/memoize-last';

const getDateTimeFormat = memoizeLast(
	(locale?: string) =>
		new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}),
);

/** Format date + time, month, day, year, hour, minutes */
export const formatDateTime = (dateTime: Date | number, locale?: string) =>
	getDateTimeFormat(locale).format(dateTime);

const getDateFormat = memoizeLast(
	(locale?: string) =>
		new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		}),
);

/** Format date, month, day, year */
export const formatDate = (date: Date | number, locale?: string) =>
	getDateFormat(locale).format(date);

const getTimeFormat = memoizeLast(
	(locale?: string) =>
		new Intl.DateTimeFormat(locale, {
			hour: 'numeric',
			minute: 'numeric',
		}),
);

/** Format pure time -- hours and minutes */
export const formatTime = (time: Date | number, locale?: string) =>
	getTimeFormat(locale).format(time);

const getMonthFormat = memoizeLast(
	(locale?: string) =>
		new Intl.DateTimeFormat(locale, {
			month: 'long',
		}),
);

/** Just the month */
export const formatMonth = (date: Date | number, locale?: string) =>
	getMonthFormat(locale).format(date);
