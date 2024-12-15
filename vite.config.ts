import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import purgeCSSPlugin from './plugins/vite-plugin-purgecss';

export default defineConfig({
	plugins: [
		solidPlugin(),
		purgeCSSPlugin({
			variables: true,
			keyframes: true,
			fontFace: true,
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
