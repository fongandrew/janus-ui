import { memoizeLast } from '~/lib/utility/memoize/memoize-last';

const UnitMilliseconds = {
	YEAR: 365 * 24 * 60 * 60 * 1000,
	MONTH: 30 * 24 * 60 * 60 * 1000,
	DAY: 24 * 60 * 60 * 1000,
	HOUR: 60 * 60 * 1000,
	MINUTE: 60 * 1000,
	SECOND: 1000,
};

function formatRelativeTimeCascade(time: number | Date, formatter: Intl.RelativeTimeFormat) {
	const timeInMs = time instanceof Date ? time.getTime() : time;
	const deltaInMs = timeInMs - Date.now();
	const absDeltaInMs = Math.abs(deltaInMs);
	if (absDeltaInMs >= UnitMilliseconds.YEAR) {
		return formatter.format(Math.round(deltaInMs / UnitMilliseconds.YEAR), 'year');
	} else if (absDeltaInMs >= UnitMilliseconds.MONTH) {
		return formatter.format(Math.round(deltaInMs / UnitMilliseconds.MONTH), 'month');
	} else if (absDeltaInMs >= UnitMilliseconds.DAY) {
		return formatter.format(Math.round(deltaInMs / UnitMilliseconds.DAY), 'day');
	} else if (absDeltaInMs >= UnitMilliseconds.HOUR) {
		return formatter.format(Math.round(deltaInMs / UnitMilliseconds.HOUR), 'hour');
	} else if (absDeltaInMs >= UnitMilliseconds.MINUTE) {
		return formatter.format(Math.round(deltaInMs / UnitMilliseconds.MINUTE), 'minute');
	}
	return formatter.format(Math.round(deltaInMs / UnitMilliseconds.SECOND), 'second');
}

export const getRelativeTimeFormatterLong = memoizeLast(
	(locale?: string) => new Intl.RelativeTimeFormat(locale, { style: 'long', numeric: 'auto' }),
);

/** Format a relative time, cascading down through common units */
export const formatRelativeTime = (time: number | Date, locale?: string) => {
	const formatter = getRelativeTimeFormatterLong(locale);
	return formatRelativeTimeCascade(time, formatter);
};

export const getRelativeTimeFormatterNarrow = memoizeLast(
	(locale?: string) =>
		new Intl.RelativeTimeFormat(locale, {
			style: 'narrow',
			numeric: 'always',
		}),
);

/** Variant for narrow relative time */
export const formatRelativeTimeNarrow = (time: number | Date, locale?: string) => {
	const formatter = getRelativeTimeFormatterNarrow(locale);
	return formatRelativeTimeCascade(time, formatter);
};
