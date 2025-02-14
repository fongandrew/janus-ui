import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import mangleCSSPlugin from './plugins/vite-plugin-manglecss';
import purgeCSSPlugin from './plugins/vite-plugin-purgecss';

export default defineConfig({
	plugins: [
		solidPlugin(),
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
		target: 'esnext',
		outDir: 'dist',
	},
	server: { port: 3000, hmr: { port: 3000 } },
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true,
		setupFiles: 'vitest.setup.ts',
	},
});
