import { readdirSync, statSync } from 'fs';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import purgeCSSPlugin from './plugins/vite-plugin-purgecss';
import viteSSGPlugin from './plugins/vite-plugin-ssg';

const TEST_MODE = (process.env as Record<string, string | undefined>)['TEST_MODE'];

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test';

	return {
		plugins: [
			solidPlugin({ ssr: TEST_MODE === 'ssr' || !isTest }),
			purgeCSSPlugin({
				variables: true,
				keyframes: true,
				fontFace: true,

				// Needed to keep nested selectors from getting purged
				// https://github.com/FullHuman/purgecss/issues/1153#issuecomment-2626375284
				safelist: ['&'],
			}),
			viteSSGPlugin(),
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
			globals: true,
			environment: 'jsdom',
			clearMocks: true,
			setupFiles: 'vitest.setup.ts',

			// Two test modes: SPA and SSR. SPA is normal and incudes all tests. SSR
			// is an extra layer of checks for component code to make sure it renders
			// correctly in SSR mode and that the HTML works with non-Solid JS code.
			...(TEST_MODE === 'ssr'
				? {
						include: ['**/*.test.tsx'],
					}
				: {}),
		},
	};
});
