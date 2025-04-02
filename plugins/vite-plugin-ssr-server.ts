import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { createServer } from 'vite';

const NAME = 'vite:ssr-server';

/**
 * Vite plugin that provides a lazily loaded second server for SSR rendering
 * of modules. Used by vite-plugin-render-html and vite-plugin-solid-html.
 */
export default function viteSSRServerPlugin(): Plugin {
	let root = '';
	let mode = 'development';
	let server: ViteDevServer | null = null;
	let port: number | undefined;

	return {
		name: NAME,

		configResolved(config) {
			root = config.root;
			mode = config.mode;
			port = (config.server?.port ?? 3000) + 1;
		},

		configureServer(devServer) {
			server = devServer;
		},

		api: {
			async getServer() {
				if (server) {
					return server;
				}
				console.log(mode);
				server = await createServer({
					root,
					mode,
					server: {
						middlewareMode: true,
						port,
						hmr: false,
					},
				});
				await server.pluginContainer.buildStart({});
				return server;
			},
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

/** Helper function other plugins can use to get access to this one */
export function getServer(config: ResolvedConfig): Promise<ViteDevServer> {
	const plugin = config.plugins.find((p) => p.name === NAME);
	if (!plugin) {
		throw new Error(`Plugin ${NAME} not found`);
	}
	if (typeof plugin.api?.getServer !== 'function') {
		throw new Error(`Plugin ${NAME} does not support getServer`);
	}
	return plugin.api.getServer();
}
