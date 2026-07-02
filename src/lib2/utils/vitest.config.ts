import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Resolve the repo root so path aliases work when this config is run standalone
// (e.g. `vitest --config src/lib2/utils/vitest.config.ts`).
const root = fileURLToPath(new URL('../../..', import.meta.url)).replace(/\/$/, '');

export default defineConfig({
	resolve: {
		alias: {
			'~/lib2/utils': `${root}/src/lib2/utils`,
			'~': `${root}/src`,
		},
	},
	test: {
		// Node environment (not jsdom) — these utilities are DOM-free.
		environment: 'node',
		clearMocks: true,
		restoreMocks: true,
		// Colocated unit tests under this pseudo-package.
		include: ['**/*.test.ts'],
		// Tests assume a fixed timezone for date formatting.
		env: { TZ: 'UTC' },
	},
});
