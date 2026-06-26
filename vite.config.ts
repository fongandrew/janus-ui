import { readdirSync, statSync } from 'fs';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import purgeCSSPlugin from './plugins/vite-plugin-purgecss';
import viteSSGPlugin from './plugins/vite-plugin-ssg';

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test';

	return {
		base: process.env['BASE_URL'] || '/',
		plugins: [
			solidPlugin({ ssr: !isTest }),
			purgeCSSPlugin({
				variables: true,
				keyframes: true,
				fontFace: true,

				// Uncomment to debug PurgeCSS issues
				// rejected: true,

				safelist: [
					// Needed to keep nested selectors from getting purged
					// https://github.com/FullHuman/purgecss/issues/1153#issuecomment-2626375284
					'&',
					// See https://github.com/FullHuman/purgecss/issues/1282#issuecomment-2887364147
					':is',
				],
			}),
			viteSSGPlugin(),
		],
		resolve: {
			alias: {
				// v2 pseudo-package aliases (coexist with v1 `~/lib/*` during migration)
				'~/lib2/css': '/src/lib2/css',
				'~/lib2/utils': '/src/lib2/utils',
				'~/lib2/dom': '/src/lib2/dom',
				'~/lib2/solid': '/src/lib2/solid',
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
			target: ['safari26', 'ios26', 'chrome135', 'firefox144'],
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
