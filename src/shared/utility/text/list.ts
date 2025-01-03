import { memoizeLRUSingleArg } from '~/shared/utility/memoize/memoize-lru';

export const getConjunctionFormat = memoizeLRUSingleArg(
	(locale?: string) =>
		new Intl.ListFormat(locale, {
			style: 'long',
			type: 'conjunction',
		}),
);

export const formatConjunctionStr = (parts: string[], locale?: string) =>
	getConjunctionFormat(locale).format(parts);

export const formatConjunctionParts = <T>(parts: T[], locale?: string): (T | string)[] => {
	const partsCopy = [...parts];
	return getConjunctionFormat(locale)
		.formatToParts(parts.map(() => '#'))
		.map(({ type, value }) => (type === 'element' ? (partsCopy.shift() ?? '') : value));
};

export const getDisjunctionFormat = memoizeLRUSingleArg(
	(locale?: string) =>
		new Intl.ListFormat(locale, {
			style: 'long',
			type: 'disjunction',
		}),
);

export const formatDisjunctionStr = (parts: string[], locale?: string) =>
	getDisjunctionFormat(locale).format(parts);

export const formatDisjunctionParts = <T>(parts: T[], locale?: string): (T | string)[] => {
	const partsCopy = [...parts];
	return getDisjunctionFormat(locale)
		.formatToParts(parts.map(() => '#'))
		.map(({ type, value }) => (type === 'element' ? (partsCopy.shift() ?? '') : value));
};
