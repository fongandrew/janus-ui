import { readdirSync, statSync } from 'fs';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import mangleCSSPlugin from './plugins/vite-plugin-manglecss';
import purgeCSSPlugin from './plugins/vite-plugin-purgecss';
import viteSSGPlugin from './plugins/vite-plugin-ssg';

export default defineConfig({
	plugins: [
		solidPlugin({ ssr: process.env.NODE_ENV !== 'test' }),
		purgeCSSPlugin({
			variables: true,
			keyframes: true,
			fontFace: true,

			// Needed to keep nested selectors from getting purged
			// https://github.com/FullHuman/purgecss/issues/1153#issuecomment-2626375284
			safelist: ['&'],
		}),
		mangleCSSPlugin({
			classNamePattern: /^[cotv]-/,
		}),
		viteSSGPlugin(),
	],
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
	resolve: {
		alias: {
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
		target: 'esnext',
	},
	server: { port: 3000, hmr: { port: 3000 } },
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true,
		setupFiles: 'vitest.setup.ts',
	},
});
