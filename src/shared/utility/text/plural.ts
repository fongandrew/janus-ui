import { memoizeLRUSingleArg } from '~/shared/utility/memoize/memoize-lru';
import { formatInteger } from '~/shared/utility/text/number';

/** Rules are something like "# books" */
export interface PluralRules {
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
	other: string;
}

export const getPluralRules = memoizeLRUSingleArg(
	(locale?: string) => new Intl.PluralRules(locale),
);

export function plural(
	count: number,
	rules: PluralRules,
	{
		locale = 'en-US',
		formatNumber = formatInteger,
		placeholder = '#',
	}: {
		locale?: string;
		formatNumber?: (value: number, locale?: string) => string;
		placeholder?: string;
	} = {},
): string {
	const pluralRules = getPluralRules(locale);
	const category = pluralRules.select(count);
	const pattern = rules[category] || rules.other;
	const formattedNumber = formatNumber(count, locale);
	return pattern.replace(placeholder, formattedNumber);
}
