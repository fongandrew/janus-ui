import { memoizeLast } from '~/lib/utility/memoize/memoize-last';

export const getIntegerFormat = memoizeLast((locale?: string) => new Intl.NumberFormat(locale));

export const formatInteger = (integer: number, locale?: string) =>
	getIntegerFormat(locale).format(Math.round(integer));

export const getCurrencyFormat = memoizeLast(
	(currency = 'USD', locale?: string) =>
		new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency as string,
		}),
);

export const formatCurrency = (value: number, currency = 'USD', locale = 'en-US') =>
	getCurrencyFormat(currency, locale).format(value);

export const getPercentageFormat = memoizeLast(
	(locale?: string) =>
		new Intl.NumberFormat(locale, {
			style: 'percent',
			maximumFractionDigits: 1,
		}),
);

export const formatPercentage = (percentage: number, locale?: string) =>
	getPercentageFormat(locale).format(percentage);
