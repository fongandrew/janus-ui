import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';

import { getServer } from './vite-plugin-ssr-server';

/**
 * Vite plugin that processes HTML files and replaces special comments
 * with the rendered output of the specified module.
 */
export default function viteRenderHTMLPlugin(): Plugin {
	let config: ResolvedConfig;

	return {
		name: 'vite:ssg',

		configResolved(cfg) {
			config = cfg;
		},

		async transformIndexHtml(html: string) {
			const server = await getServer(config);
			return processHTML(html, server);
		},
	};
}

async function processHTML(html: string, server: ViteDevServer) {
	const importRegex = /<!--\s*@render\s*(.*)\s*-->/g;
	let result = html;
	const matches = [...result.matchAll(importRegex)];

	for (const match of matches) {
		const [fullMatch, importPath] = match;

		// Load and execute the module directly
		const mod = await server.ssrLoadModule(importPath.trim());

		let rendered: string | null = null;
		if (typeof mod.render === 'function') {
			rendered = await mod.render();
		} else if (typeof mod.default === 'function') {
			rendered = await mod.default();
		} else if (typeof mod.default === 'string') {
			rendered = mod.default;
		}

		if (rendered === null) {
			throw new Error(`No render function found in module: ${importPath}`);
		}

		result = result.replace(fullMatch, rendered);
	}

	return result;
}
