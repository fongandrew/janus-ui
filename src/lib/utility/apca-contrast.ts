export type ApcaUsage = 'body' | 'descriptive' | 'label' | 'subheading' | 'heading';

/** Returns minimum APCA threshold for font size / weight combo for "fluent" text */
export function minContrast(fontSizePx: number, fontWeight: number) {
	if (fontSizePx < 14) return 100;
	if (fontSizePx <= 14) {
		if (fontWeight <= 400) return 100;
		if (fontWeight <= 500) return 100;
		if (fontWeight <= 600) return 90;
		return 75;
	}
	if (fontSizePx <= 15) {
		if (fontWeight <= 400) return 100;
		if (fontWeight <= 500) return 90;
		if (fontWeight <= 600) return 75;
		return 70;
	}
	if (fontSizePx <= 16) {
		if (fontWeight <= 400) return 90;
		if (fontWeight <= 500) return 75;
		if (fontWeight <= 600) return 70;
		return 60;
	}
	if (fontSizePx <= 18) {
		if (fontWeight <= 300) return 100;
		if (fontWeight <= 400) return 75;
		if (fontWeight <= 500) return 70;
		if (fontWeight <= 600) return 60;
		return 55;
	}
	if (fontSizePx <= 21) {
		if (fontWeight <= 300) return 90;
		if (fontWeight <= 400) return 70;
		if (fontWeight <= 500) return 60;
		if (fontWeight <= 600) return 55;
		return 50;
	}
	// Font-size 24 in APCA table
	if (fontWeight <= 300) return 75;
	if (fontWeight <= 400) return 60;
	if (fontWeight <= 500) return 55;
	if (fontWeight <= 600) return 50;
	return 45;
}

/**
 * With modifications based on usage type:
 * - Body text: Paragraphs, many blocks of text
 * - Descriptive text: Also "fluent text", short blocks of text. This 2.5 lines in the APCA
 *   guidelines but can be a little loose with this with tables and wrapping.
 * - Label: Single lines, often in menus or other constrained spaces
 * - Subheading: Larger text, sometimes used in menus or other constrained spaces
 * - Heading: Largest text
 */
export function minContrastForUsage(
	fontSizePx: number,
	fontWeight: number,
	usage: ApcaUsage = 'descriptive',
) {
	const base = minContrast(fontSizePx, fontWeight);

	// APCA rules are actually to add 15 if min is less than 75 but this is sort of weird since
	// it means increasing font size (which lowers the required contrast on the table) can
	// increase contrast requirements.
	if (usage === 'body') return Math.max(base, 75);
	if (usage === 'descriptive') return base;
	return Math.max(base - 15, 40);
}
