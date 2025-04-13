import path from 'path';
import { build, type Plugin, type ResolvedConfig, type ViteDevServer } from 'vite';

/**
 * Plugin for server-side generation (SSG) of HTML content
 * Replaces comment blocks like <!-- @render path/to/file.ts --> with rendered content
 */
export default function viteSSGPlugin(): Plugin {
	// Set up options with defaults
	const importRegex = /<!--\s*@render\s*(.*)\s*-->/g;

	// Plugin state
	let server: ViteDevServer | null = null;
	let resolvedConfig: ResolvedConfig | null = null;

	return {
		name: 'ssg',

		configResolved(config: ResolvedConfig) {
			// Store the resolved config for later use
			resolvedConfig = config;
		},

		async transformIndexHtml(html: string, ctx): Promise<string> {
			server = ctx.server ?? null;

			// Determine if we're in build or serve mode
			const isBuild = !server;

			// Make sure we have a resolved config
			if (isBuild && !resolvedConfig) {
				throw new Error('Config was not resolved before transformIndexHtml');
			}

			// Find all render comments
			let result = html;
			const matches = [...result.matchAll(importRegex)];

			for (const match of matches) {
				const [fullMatch, pathMatch] = match;
				if (!pathMatch) continue;

				const importPath = pathMatch.trim();
				try {
					const mod = isBuild
						? await buildAndExecuteModule(importPath, resolvedConfig as ResolvedConfig)
						: await loadAndExecuteModule(importPath, server as ViteDevServer);
					if (typeof mod.render !== 'function') {
						throw new Error(`Module does not export a render function`);
					}
					const rendered = await mod.render();
					result = result.replace(fullMatch, rendered);
				} catch (error: any) {
					console.error(`Error rendering ${importPath}:`, error);
					if (isBuild) {
						throw error;
					} else {
						const errorMsg = `<p>Error rendering ${importPath}: ${error?.message}</p>`;
						result = result.replace(fullMatch, errorMsg);
					}
				}
			}
			return result;
		},
	};
}

/**
 * Interface for SSG module exports
 */
interface SSGModule {
	render: () => string | Promise<string>;
}

/**
 * Loads and executes a module using the dev server's ssrLoadModule
 */
async function loadAndExecuteModule(importPath: string, server: ViteDevServer): Promise<SSGModule> {
	return (await server.ssrLoadModule(importPath)) as SSGModule;
}

/**
 * Builds an SSR module and executes it to get rendered content
 */
async function buildAndExecuteModule(
	importPath: string,
	parentConfig: ResolvedConfig,
): Promise<SSGModule> {
	await build({
		configFile: parentConfig.configFile!,
		build: {
			ssr: importPath,
			ssrEmitAssets: true,
			emptyOutDir: false,
		},
	});

	return (await import(
		path.join(
			path.dirname(parentConfig.configFile!),
			parentConfig.build.outDir,
			`${path.basename(importPath, path.extname(importPath))}.js`,
		)
	)) as SSGModule;
}
