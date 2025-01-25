import plugin from 'tailwindcss/plugin';

function flattenColorPalette(
	colors: Record<string, string | Record<string, any>>,
	parentKey = '',
): Record<string, string> {
	return Object.entries(colors).reduce<Record<string, string>>((acc, [key, value]) => {
		const fullKey = parentKey ? `${parentKey}-${key}` : key;

		// Handle DEFAULT case
		if (key === 'DEFAULT' && typeof value === 'string') {
			acc[parentKey] = value;
			return acc;
		}

		// Handle nested objects
		if (typeof value === 'object') {
			return {
				...acc,
				...flattenColorPalette(value, fullKey),
			};
		}

		// Handle string values
		if (typeof value === 'string') {
			// Ignore transparent
			if (value === 'transparent') {
				return acc;
			}
			acc[fullKey] = value;
		}

		return acc;
	}, {});
}

/** Generates a X% darker version of each color */
export const twBorderDynamicPlugin = plugin(({ addUtilities, theme }) => {
	const base = theme('borderDynamic.base', 'black');
	const mix = theme('borderDynamic.mix', '15%');
	const colors = theme('colors');
	if (!colors) return;

	for (const [key, value] of Object.entries(flattenColorPalette(colors))) {
		addUtilities({
			[`.border-dynamic-${key}`]: {
				'border-color': `color-mix(in hsl, ${base} ${mix}, ${value})`,
				'--inner-border-color': `color-mix(in hsl, ${base} ${mix}, ${value})`,
			},
		});
	}
});
