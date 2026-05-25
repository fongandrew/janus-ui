import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test';

	const htmlEntries = Object.fromEntries(
		readdirSync('.')
			.filter(
				(file) => file.endsWith('.html') && statSync(file).isFile(),
			)
			.map((file) => [file.slice(0, -5), file]),
	);

	const testHarnesses = Object.fromEntries(
		['src/lib/css/test-harness.html', 'src/lib/dom/test-harness.html']
			.filter((f) => {
				try {
					statSync(f);
					return true;
				} catch {
					return false;
				}
			})
			.map((f) => [f.replace(/\.html$/, '').replace(/\//g, '-'), f]),
	);

	return {
		base: process.env['BASE_URL'] || '/',
		plugins: [solidPlugin({ ssr: !isTest })],
		resolve: {
			alias: {
				'@': '/assets',
				'~': '/src',
				'~/lib/css': resolve('src/lib/css'),
				'~/lib/utils': resolve('src/lib/utils'),
				'~/lib/dom': resolve('src/lib/dom'),
				'~/lib/solid': resolve('src/lib/solid'),
			},
		},
		build: {
			outDir: 'dist',
			rollupOptions: {
				input: { ...htmlEntries, ...testHarnesses },
			},
			target: ['safari17', 'ios17', 'chrome135', 'firefox137'],
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
