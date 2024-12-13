import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [solidPlugin()],
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
