import { createMounter } from '~/lib/utility/callback-attrs/mount';

/**
 * Set attribute on mount -- used this to render with certain props in SSR
 * that get undone when JS is loaded.
 */
export const mountAttr = createMounter<[string, string]>(
	'$t-no-js__attr',
	(node, attr: string, value: string) => {
		node.setAttribute(attr, value);
	},
);

/**
 * Remove attribute on mount -- similar usage as mountAttr but reversed
 */
export const mountRmAttr = createMounter<[string]>('$t-no-js__rm-attr', (node, attr: string) => {
	node.removeAttribute(attr);
});
