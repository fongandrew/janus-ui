import { memoizeLRUMultiArg, memoizeLRUSingleArg } from '~/shared/utility/memoize/memoize-lru';

export const getIntegerFormat = memoizeLRUSingleArg(
	(locale?: string) => new Intl.NumberFormat(locale),
);

export const formatInteger = (integer: number, locale?: string) =>
	getIntegerFormat(locale).format(Math.round(integer));

export const getCurrencyFormat = memoizeLRUMultiArg(
	(currency = 'USD', locale?: string) =>
		new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency as string,
		}),
);

export const formatCurrency = (value: number, currency = 'USD', locale = 'en-US') =>
	getCurrencyFormat(currency, locale).format(value);

export const getPercentageFormat = memoizeLRUSingleArg(
	(locale?: string) =>
		new Intl.NumberFormat(locale, {
			style: 'percent',
			maximumFractionDigits: 1,
		}),
);

export const formatPercentage = (percentage: number, locale?: string) =>
	getPercentageFormat(locale).format(percentage);
