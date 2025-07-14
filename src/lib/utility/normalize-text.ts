// Pre-compile all regular expressions
const DIACRITICS_REGEX = /[\u0300-\u036f]/g;
const SMART_QUOTES_SINGLE = /[\u2018\u2019\u201A\u201B\u2032\u2035]/g;
const SMART_QUOTES_DOUBLE = /[\u201C\u201D\u201E\u201F\u2033\u2036]/g;
const DASHES = /[\u2012\u2013\u2014\u2015]/g;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const WHITESPACE = /\s+/g;
const PUNCTUATION = /[.,/#!$%^&*;:{}=\-_`~()]/g;
const LIGATURES_REGEX = /[æœꜵꜷ]/g;

// Common replacements as objects for faster lookup
const LIGATURES = {
	æ: 'ae',
	œ: 'oe',
	ꜵ: 'ao',
	ꜷ: 'au',
};

/**
 * Normalize text for matching
 */
export function normalizeText(text: string) {
	if (!text) return '';

	return (
		text
			.normalize('NFKD')
			.toLowerCase()
			.replace(DIACRITICS_REGEX, '')
			// Handle ligatures with single replace using callback
			.replace(LIGATURES_REGEX, (match) => LIGATURES[match as keyof typeof LIGATURES] ?? '')
			.replace(SMART_QUOTES_SINGLE, "'")
			.replace(SMART_QUOTES_DOUBLE, '"')
			.replace('…', '...')
			.replace(DASHES, '-')
			.replace(ZERO_WIDTH, '')
			.replace(WHITESPACE, ' ')
			.replace(PUNCTUATION, ' ')
			.trim()
			.replace(WHITESPACE, ' ')
	);
}
