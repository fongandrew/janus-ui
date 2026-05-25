import { normalizeText } from './normalize-text';

export interface TextMatcherOptions<TNode> {
	/** Delay in milliseconds before search string is reset */
	delay?: number;
	/** Regex for characters to ignore (applied after normalization) */
	ignore?: RegExp | undefined;
	/** Callback to extract text from a node */
	getText: (node: TNode) => string;
}

const DEFAULT_DELAY = 500;
const DEFAULT_IGNORE = /[^a-z0-9]/g;

/**
 * Creates a text matcher that matches input text against a list of nodes' text content.
 * Characters typed within the delay period are appended to form a search string.
 * For performance, normalized versions of node text content are cached during the delay period.
 */
export function createTextMatcher<TNode>(
	getNodes: () => Iterable<TNode>,
	options: TextMatcherOptions<TNode>,
) {
	const { delay = DEFAULT_DELAY, ignore = DEFAULT_IGNORE, getText } = options;

	let current = '';
	let lastMatchTime = 0;
	const cachedNormalizedText = new Map<TNode, string>();

	// Helper to get or compute normalized text for a node
	const getNormalizedText = (node: TNode) => {
		let normalized = cachedNormalizedText.get(node);
		if (!normalized) {
			normalized = normalizeText(getText(node));
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

		let includeMatch: TNode | null = null;
		for (const node of nodes) {
			const nodeText = getNormalizedText(node);

			// First, check for nodes that start with the search string
			if (nodeText.startsWith(currentNormalized)) {
				return node;
			}

			// Track include match but don't return yet (only if no start matches)
			if (nodeText.includes(currentNormalized)) {
				includeMatch = node;
			}
		}

		// No start match, return include match if any
		return includeMatch;
	};
}
