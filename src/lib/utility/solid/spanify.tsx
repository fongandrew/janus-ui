import { type JSX, type ResolvedJSXElement } from 'solid-js';

/** Is this an HTML Node? */
function isNode(elm: ResolvedJSXElement): elm is Node {
	return typeof elm === 'object' && elm !== null && 'nodeType' in elm;
}

/**
 * Utility that takes a list of JSX elements and wraps text nodes and strings in spans.
 * The purpose of this is to make it easier for certain components to style their children.
 */
export function spanify(elms: ResolvedJSXElement[]): JSX.Element[] {
	return elms.map((elm) => {
		if (typeof elm === 'string' || (isNode(elm) && elm.nodeType === Node.TEXT_NODE)) {
			return <span>{elm}</span>;
		}
		return elm;
	});
}
