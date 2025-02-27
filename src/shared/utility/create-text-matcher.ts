import { createMagicProp } from '~/shared/utility/magic-prop';
import { normalizeText } from '~/shared/utility/normalize-text';

export interface TextMatcherOptions {
	/** Delay in milliseconds before search string is reset */
	delay?: number;
	/** Regex for characters to ignore (applied after normalization) */
	ignore?: RegExp | undefined;
}

const DEFAULT_OPTIONS = {
	delay: 500,
	ignore: /[^a-z0-9]/g,
};

/**
 * Creates a text matcher that matches input text against a list of nodes' text content.
 * Characters typed within the delay period are appended to form a search string.
 * For performance, normalized versions of node text content are cached during the delay period.
 */
export function createTextMatcher(
	getNodes: () => Iterable<HTMLElement>,
	options: TextMatcherOptions = {},
) {
	const { delay, ignore } = { ...DEFAULT_OPTIONS, ...options };

	let current = '';
	let lastMatchTime = 0;
	const cachedNormalizedText = new Map<Node, string>();

	// Helper to get or compute normalized text for a node
	const getNormalizedText = (node: Node) => {
		let normalized = cachedNormalizedText.get(node);
		if (!normalized) {
			normalized = normalizeText(node.textContent ?? '');
			if (ignore) {
				normalized = normalized.replace(ignore, '');
			}
			cachedNormalizedText.set(node, normalized);
		}
		return normalized;
	};

	return (value: string) => {
		const now = Date.now();

		// Reset cache and current text if outside delay window
		if (now - lastMatchTime >= delay) {
			current = value;
			cachedNormalizedText.clear();
		} else {
			current = `${current}${value}`;
		}
		lastMatchTime = now;

		const currentNormalized = normalizeText(current);
		const nodes = getNodes();
		if (!nodes) return null;

		let includeMatch: Node | null = null;
		for (const node of nodes) {
			const nodeText = getNormalizedText(node);

			// First, check for nodes that start with the search string
			if (nodeText.startsWith(currentNormalized)) {
				return node as HTMLElement;
			}

			// Track inlude match but don't return yet (only if no start matches)
			if (nodeText.includes(currentNormalized)) {
				includeMatch = node;
			}
		}

		// No start match, return include match if any
		return includeMatch as HTMLElement | null;
	};
}

const [textMatcherForElm, setTextMatcherForElm] = createMagicProp<
	(value: string) => HTMLElement | null,
	HTMLElement
>();

/**
 * Text matcher tied to a particular element
 */
export function createTextMatcherForElement(
	selector: (elm: HTMLElement) => Iterable<HTMLElement>,
	options?: TextMatcherOptions,
) {
	return (elm: HTMLElement) => {
		let matcher = textMatcherForElm(elm);
		if (!matcher) {
			matcher = createTextMatcher(() => selector(elm), options);
			setTextMatcherForElm(elm, matcher);
		}
		return matcher;
	};
}
