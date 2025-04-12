import { readdirSync, statSync } from 'fs';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import purgeCSSPlugin from './plugins/vite-plugin-purgecss';
import viteRenderHTMLPlugin from './plugins/vite-plugin-render-html';
import viteSolidHTMLPlugin from './plugins/vite-plugin-solid-html';
import viteSSRServerPlugin from './plugins/vite-plugin-ssr-server';

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test';

	return {
		// Set the base path for deployment in a subdirectory
		base: './',
		plugins: [
			solidPlugin({ ssr: !isTest }),
			purgeCSSPlugin({
				variables: true,
				keyframes: true,
				fontFace: true,

				// Needed to keep nested selectors from getting purged
				// https://github.com/FullHuman/purgecss/issues/1153#issuecomment-2626375284
				safelist: ['&'],
			}),
			viteSSRServerPlugin(),
			viteSolidHTMLPlugin(),
			viteRenderHTMLPlugin(),
		],
		resolve: {
			alias: {
				'@': '/assets',
				'~': '/src',
			},
		},
		build: {
			outDir: 'dist',
			rollupOptions: {
				input: Object.fromEntries(
					readdirSync('.')
						.filter(
							(file) =>
								// Must be HTML file
								file.endsWith('.html') &&
								// Must be a file (not directory)
								statSync(file).isFile(),
						)
						.map((file) => [file.slice(0, -5), file]),
				),
			},
		},
		target: 'esnext',
		server: { port: 3000, hmr: { port: 3000 } },
		test: {
			environment: 'jsdom',
			clearMocks: true,
			restoreMocks: true,
			setupFiles: './vitest.setup.ts',
		},
	};
});
