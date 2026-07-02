import { readdirSync, statSync } from 'fs';
import path from 'path';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

import janusBundlePlugin from './plugins/vite-plugin-janus-bundle';
import purgeCSSPlugin from './plugins/vite-plugin-purgecss';
import viteSSGPlugin from './plugins/vite-plugin-ssg';

/** Recursively collect `*.html` entry points under a directory. */
function collectHtmlEntries(dir: string, base = dir): Record<string, string> {
	const entries: Record<string, string> = {};
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) {
			Object.assign(entries, collectHtmlEntries(full, base));
		} else if (name.endsWith('.html')) {
			// Key is the path relative to repo root without extension, e.g. `site/index`
			const key = path.relative('.', full).slice(0, -5);
			entries[key] = full;
		}
	}
	return entries;
}

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
			// SSR-driven handler purge (§12.4): emits a client entry importing only
			// the handler modules referenced by data-js tokens in the SSR output.
			janusBundlePlugin(),
		],
		resolve: {
			alias: {
				'@': '/assets',
				// v2 pseudo-package aliases — must precede the catch-all `~` so they win.
				'~/lib2/css': '/src/lib2/css',
				'~/lib2/utils': '/src/lib2/utils',
				'~/lib2/dom': '/src/lib2/dom',
				'~/lib2/solid': '/src/lib2/solid',
				'~': '/src',
			},
		},
		build: {
			outDir: 'dist',
			rollupOptions: {
				input: {
					// v1 demo site: root-level HTML files (index, colors, typography, ssr).
					...Object.fromEntries(
						readdirSync('.')
							.filter(
								(file) =>
									file.endsWith('.html') && statSync(file).isFile(),
							)
							.map((file) => [file.slice(0, -5), file]),
					),
					// v2 documentation site: HTML entry points under `site/`.
					...collectHtmlEntries('site'),
				},
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
