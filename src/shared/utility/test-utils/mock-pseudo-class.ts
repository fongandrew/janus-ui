import { expect, type Mock, vi } from 'vitest';

/**
 * Replacements object we can add to. Should be a map of things like
 * `:popover-open` to `[data-test-popover-open]`
 */
const selectorReplacements: Record<string, string> = {};

/** Register a specific selector replacement */
export function mockPseudoClass(cls: string, replacement: string) {
	// Verify this mock still makes sense
	if (!isMock(document.querySelector)) {
		expect(() => document.querySelector(cls)).toThrow();
	}

	selectorReplacements[cls] = replacement;
	mockAll();
}

/** Mock all of the methods used for query selection */
function mockAll() {
	mockSelector(document, 'querySelector');
	mockSelector(document, 'querySelectorAll');
	mockSelector(Element.prototype, 'closest');
	mockSelector(Element.prototype, 'matches');
	mockSelector(Element.prototype, 'querySelector');
	mockSelector(Element.prototype, 'querySelectorAll');
}

/** Mock a single selector method */
function mockSelector<TProto>(proto: TProto, method: keyof TProto) {
	const originalMethod = proto[method] as (this: TProto, selector: string) => Node | null;
	if (isMock(originalMethod)) return;

	return vi.spyOn(proto, method as any).mockImplementation(function (
		this: TProto,
		selector: string,
	) {
		const pseudoSelectors = findAllPseudoSelectors(selector);

		// Sort by length (descending) to replace longest matches first
		// This prevents partial replacements of longer selectors
		pseudoSelectors.sort((a, b) => b.length - a.length);

		for (const pseudoSelector of pseudoSelectors) {
			if (selectorReplacements[pseudoSelector]) {
				selector = selector.replace(pseudoSelector, selectorReplacements[pseudoSelector]);
			}
		}

		return originalMethod.call(this, selector);
	} as any);
}

/** Detects if current method is mock */
function isMock(obj: unknown): obj is Mock {
	return (obj as Mock)?.mock !== undefined;
}

/** Mocks CSS pseudo-class in selectors */

const PSEUDO_SELECTOR_REGEX = /(:+[a-zA-Z-]+)(?:\([^)]*\))?/g;

/** Helper function to find all pseudo selectors (including nested ones) */
function findAllPseudoSelectors(selectorString: string): string[] {
	const matches: string[] = [];

	// Find all direct matches first
	for (const match of selectorString.matchAll(PSEUDO_SELECTOR_REGEX)) {
		if (!match[1]) continue; // Appease type checker
		matches.push(match[1]); // Add the captured pseudo selector

		// Check for nested pseudo selectors inside parentheses
		const fullMatch = match[0];
		if (fullMatch.includes('(')) {
			const nestedContent = fullMatch.slice(
				fullMatch.indexOf('(') + 1,
				fullMatch.lastIndexOf(')'),
			);

			// If nested content exists, recursively find pseudo selectors in it
			if (nestedContent) {
				const nestedMatches = findAllPseudoSelectors(nestedContent);
				matches.push(...nestedMatches);
			}
		}
	}

	// Remove duplicates and return
	return [...new Set<string>(matches)];
}
