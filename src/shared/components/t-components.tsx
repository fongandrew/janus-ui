/**
 * Utility components for wrapping text for translation.
 */
import { type JSX } from 'solid-js';

import { useLocale } from '~/shared/utility/solid/locale-context';
import {
	formatDate,
	formatDateTime,
	formatDateTimeContextual,
	formatDateTimeContextualNumeric,
	formatMonth,
	formatTime,
} from '~/shared/utility/text/date-time';
import { formatConjunctionParts, formatDisjunctionParts } from '~/shared/utility/text/list';
import { formatCurrency, formatInteger, formatPercentage } from '~/shared/utility/text/number';
import { formatRelativeTime, formatRelativeTimeNarrow } from '~/shared/utility/text/relative-time';

/**
 * Generic text wrapper component. This is a placeholder for a real
 * translation component that would handle translation of text strings.
 */
export function T(props: { children: JSX.Element }) {
	return <>{props.children}</>;
}

/**
 * Create a markup component from a function that takes props and locale
 * and returns React nodes. Also exposes a function to extract the nodes
 * from the props directly.
 */
function createMarkupComponent<TProps>(getNodes: (props: TProps, locale?: string) => JSX.Element) {
	return function MarkupComponent(props: TProps) {
		const locale = useLocale();
		return <>{getNodes(props, locale)}</>;
	};
}

/** Date formatting markup wrapper */
export const FormatDate = createMarkupComponent<{
	value: Date | number;
}>(({ value }, locale) => formatDate(value, locale));

/** Date + time formatting markup wrapper */
export const FormatDateTime = createMarkupComponent<{
	value: Date | number;
}>(({ value }, locale) => formatDateTime(value, locale));

/** Contextual date time */
export const FormatDateTimeContextual = createMarkupComponent<{
	value: Date | number;
	numeric?: boolean;
}>(({ value, numeric }, locale) =>
	numeric
		? formatDateTimeContextual(value, locale)
		: formatDateTimeContextualNumeric(value, locale),
);

/** Time formatting markup wrapper */
export const FormatTime = createMarkupComponent<{
	value: Date | number;
}>(({ value }, locale) => formatTime(value, locale));

/** Time formatting markup wrapper */
export const FormatMonth = createMarkupComponent<{
	value: Date | number;
}>(({ value }, locale) => formatMonth(value, locale));

/** Currency formatting markup wrapper */
export const FormatCurrency = createMarkupComponent<{
	value: number;
	currency?: string;
}>(({ value, currency = 'USD' }, locale) => formatCurrency(value, currency, locale));

/** Integer formatting markup wrapper */
export const FormatInteger = createMarkupComponent<{
	value: number;
}>(({ value }, locale) => formatInteger(value, locale));

/** Percentage formatting markup wrapper */
export const FormatPercentage = createMarkupComponent<{
	value: number;
}>(({ value }, locale) => formatPercentage(value, locale));

/** Relative time formatting markup wrapper */
export const FormatRelativeTime = createMarkupComponent<{
	value: Date | number;
	narrow?: boolean;
}>(({ value, narrow }, locale) =>
	narrow ? formatRelativeTimeNarrow(value, locale) : formatRelativeTime(value, locale),
);

/** List formatting markup wrapper */
export const FormatList = createMarkupComponent<{
	parts: JSX.Element[];
	or?: boolean;
}>(({ parts, or }, locale) =>
	or ? formatDisjunctionParts(parts, locale) : formatConjunctionParts(parts, locale),
);
