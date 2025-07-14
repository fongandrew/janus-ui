import { memoizeLast } from '~/lib/utility/memoize/memoize-last';
import { formatInteger } from '~/lib/utility/text/number';

/** Rules are something like "# books" */
export interface PluralRules {
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
	other: string;
}

export const getPluralRules = memoizeLast((locale?: string) => new Intl.PluralRules(locale));

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
