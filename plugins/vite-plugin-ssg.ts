import type { Plugin } from 'vite';
import { createServer } from 'vite';

export default function viteSSGPlugin(): Plugin {
	let root = '';
	let server: any = null;

	return {
		name: 'vite:ssg',

		configResolved(config) {
			root = config.root;
		},

		async transformIndexHtml(html: string, ctx) {
			// Use dev server if we're in dev mode
			if (ctx.server) {
				return processHTML(html, ctx.server);
			}

			// For production build, create a temp server if we don't have one
			if (!server) {
				server = await createServer({
					root,
					server: { middlewareMode: true },
				});
				await server.pluginContainer.buildStart({});
			}

			return processHTML(html, server);
		},

		async closeBundle() {
			// Clean up the temporary server if we created one
			if (server) {
				await server.close();
				server = null;
			}
		},
	};
}

async function processHTML(html: string, server: any) {
	const importRegex = /<!--\s*@render\s*(.*)\s*-->/g;
	let result = html;
	const matches = [...result.matchAll(importRegex)];

	for (const match of matches) {
		const [fullMatch, importPath] = match;

		// Load and execute the module directly
		const mod = await server.ssrLoadModule(importPath.trim());

		const rendered =
			typeof mod.render === 'function'
				? await mod.render()
				: typeof mod.default === 'function'
					? await mod.default()
					: null;

		if (rendered === null) {
			throw new Error(`No render function found in module: ${importPath}`);
		}

		result = result.replace(fullMatch, rendered);
	}

	return result;
}
