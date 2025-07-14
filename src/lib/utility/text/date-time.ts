import { isThisYear, isToday } from '~/lib/utility/datetime/same-date';
import { memoizeLast } from '~/lib/utility/memoize/memoize-last';
import { useT } from '~/lib/utility/solid/locale-context';

export function createDateTimeFormatter(options: Intl.DateTimeFormatOptions) {
	const getFormatter = memoizeLast((locale?: string) => new Intl.DateTimeFormat(locale, options));
	return (dateTime: Date | number, locale?: string) => getFormatter(locale).format(dateTime);
}

/** Format date + time, month, day, year, hour, minutes */
export const formatDateTime = createDateTimeFormatter({
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
});

/** Format date and time minus year */
export const formatDateTimeNoYear = createDateTimeFormatter({
	day: 'numeric',
	month: 'short',
	hour: 'numeric',
	minute: 'numeric',
});

/** Format numeric date + time, month, day, year, hour, minutes */
export const formatDateTimeNumeric = createDateTimeFormatter({
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
});

/** Format numeric date and time minus year */
export const formatDateTimeNumericNoYear = createDateTimeFormatter({
	day: 'numeric',
	month: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
});

/** Format date -- month, day, year */
export const formatDate = createDateTimeFormatter({
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

/** Format date -- month and day */
export const formatDateNoYear = createDateTimeFormatter({
	day: 'numeric',
	month: 'short',
});

/** Format date -- numeric */
export const formatDateNumeric = createDateTimeFormatter({
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
});

/** Format date -- month and day, numeric */
export const formatDateNoYearNumeric = createDateTimeFormatter({
	day: 'numeric',
	month: 'numeric',
});

/** Format date contextually, leaving out year if same year */
export function formatDateContextual(date: Date | number, locale?: string) {
	if (isThisYear(date)) {
		return formatDateNoYear(date, locale);
	}
	return formatDate(date, locale);
}

/** Format numeric date contextually, leaving out year if same year */
export function formatDateContextualNumeric(date: Date | number, locale?: string) {
	if (isThisYear(date)) {
		return formatDateNoYearNumeric(date, locale);
	}
	return formatDateNumeric(date, locale);
}

/** Format pure time -- hours and minutes */
export const formatTime = createDateTimeFormatter({
	hour: 'numeric',
	minute: 'numeric',
});

/** Just the month */
export const formatMonth = createDateTimeFormatter({
	month: 'long',
});

const weekdayFormatter = createDateTimeFormatter({
	weekday: 'short',
});

/**
 * Format date and time with weekday -- using this over default Intl because
 * it annoyingly leaves out a comma in en-US and we want it consistent with
 * how it does normal date + time
 */
function formatDateTimeWithWeekday(dateTime: Date | number, locale?: string) {
	const t = useT();
	return t`${weekdayFormatter(dateTime, locale)}, ${formatTime(dateTime, locale)}`;
}

/**
 * Cutoff in ms for contextual date time for switching between absolute date and a
 * contextual weekday ("Wed")
 */
const CONTEXTUAL_DATE_TIME_CUTOFF = 5 * 24 * 60 * 60 * 1000; // 5 days

/**
 * Format date time contextually, leaving out date if today and using weekdays
 * if not too long ago
 */
export function formatDateTimeContextual(dateTime: Date | number, locale?: string) {
	if (isToday(dateTime)) {
		return formatTime(dateTime, locale);
	}
	if (
		(dateTime instanceof Date ? dateTime.getTime() : dateTime) >
		Date.now() - CONTEXTUAL_DATE_TIME_CUTOFF
	) {
		return formatDateTimeWithWeekday(dateTime, locale);
	}
	if (isThisYear(dateTime)) {
		return formatDateTimeNoYear(dateTime, locale);
	}
	return formatDateTime(dateTime, locale);
}

/**
 * Format numeric date time contextually, leaving out date if today and using weekdays
 * if not too long ago
 */
export function formatDateTimeContextualNumeric(dateTime: Date | number, locale?: string) {
	if (isToday(dateTime)) {
		return formatTime(dateTime, locale);
	}
	if (
		(dateTime instanceof Date ? dateTime.getTime() : dateTime) >
		Date.now() - CONTEXTUAL_DATE_TIME_CUTOFF
	) {
		return formatDateTimeWithWeekday(dateTime, locale);
	}
	if (isThisYear(dateTime)) {
		return formatDateTimeNumericNoYear(dateTime, locale);
	}
	return formatDateTimeNumeric(dateTime, locale);
}
