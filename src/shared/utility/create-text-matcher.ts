import { normalizeText } from '~/shared/utility/normalize-text';

/**
 * Creates a text matcher that matches input text against a list of nodes' text content.
 * Characters typed within the delay period are appended to form a search string.
 * For performance, normalized versions of node text content are cached during the delay period.
 */
export function createTextMatcher(getNodes: () => Iterable<HTMLElement>, delay = 500) {
	let current = '';
	let lastMatchTime = 0;
	const cachedNormalizedText = new Map<Node, string>();

	// Helper to get or compute normalized text for a node
	const getNormalizedText = (node: Node) => {
		let normalized = cachedNormalizedText.get(node);
		if (!normalized) {
			normalized = normalizeText(node.textContent ?? '');
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
