import { createComponent, NoHydration, renderToString } from 'solid-js/web';
import type { Plugin, ResolvedConfig } from 'vite';

import { getServer } from './vite-plugin-ssr-server';

const PREFIX = 'solid-html';
const SEPARATOR = ':';

/**
 * This plugin transforms special imports like 'solid-html:./Component.jsx'
 * into a static non-hydration render of the component's HTML.
 */
export default function viteSolidHTMLPlugin(): Plugin {
	let config: ResolvedConfig;

	return {
		name: 'vite:solid-html',

		configResolved(cfg) {
			config = cfg;
		},

		// Add a custom resolver for special imports
		resolveId(id) {
			// Match imports like 'solid-html:./Component.jsx'
			if (id.startsWith(`${PREFIX}${SEPARATOR}`)) {
				return `\0${id}`;
			}
			return null;
		},

		async load(id) {
			// Handle our special virtual modules
			if (id.startsWith(`\0${PREFIX}${SEPARATOR}`)) {
				const server = await getServer(config);

				const [_prefix, path, name] = id.split(SEPARATOR);
				if (!path) {
					throw new Error(`Invalid import path: ${id}`);
				}
				const module = await server.ssrLoadModule(path);
				const str = renderToString(() =>
					createComponent(NoHydration, {
						get children() {
							return createComponent(module[name ?? 'default'], {});
						},
					}),
				);
				return `export default ${JSON.stringify(str)}`;
			}
			return null;
		},
	};
}
