// Pre-compile all regular expressions
const DIACRITICS_REGEX = /[̀-ͯ]/g;
const SMART_QUOTES_SINGLE = /[‘’‚‛′‵]/g;
const SMART_QUOTES_DOUBLE = /[“”„‟″‶]/g;
const DASHES = /[‒–—―]/g;
const ZERO_WIDTH = /[​-‍﻿]/g;
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
