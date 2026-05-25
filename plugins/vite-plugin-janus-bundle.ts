import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { type Plugin } from 'vite';

interface JanusBundleOptions {
	handlersDir?: string;
	attr?: string;
}

const VIRTUAL_MODULE_ID = 'virtual:janus-handlers';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export default function vitePluginJanusBundle(options: JanusBundleOptions = {}): Plugin {
	const {
		handlersDir = 'src/lib/dom/handlers',
		attr = 'data-js',
	} = options;

	let availableHandlers: Set<string>;

	function scanHandlersDir(root: string): Set<string> {
		const dir = path.resolve(root, handlersDir);
		try {
			return new Set(
				readdirSync(dir)
					.filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
					.map((f) => f.replace(/\.ts$/, '')),
			);
		} catch {
			return new Set();
		}
	}

	function scanTokensInBundle(bundle: Record<string, { type: string; source?: string | Uint8Array; code?: string }>): Set<string> {
		const tokens = new Set<string>();
		const attrRegex = new RegExp(`${attr}="([^"]*)"`, 'g');

		for (const fileName in bundle) {
			const chunk = bundle[fileName];
			if (!chunk) continue;
			if (fileName.endsWith('.map')) continue;

			let source = '';
			if (chunk.type === 'chunk' && 'code' in chunk) {
				source = chunk.code as string;
			} else if (chunk.type === 'asset' && 'source' in chunk) {
				source = String(chunk.source);
			}

			for (const match of source.matchAll(attrRegex)) {
				const value = match[1];
				if (value) {
					for (const token of value.split(/\s+/)) {
						if (token.match(/^[tcp]-/)) {
							tokens.add(token);
						}
					}
				}
			}
		}
		return tokens;
	}

	return {
		name: 'janus-bundle',

		configResolved(config) {
			availableHandlers = scanHandlersDir(config.root);
		},

		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
		},

		load(id) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				const imports = [...availableHandlers]
					.map((name) => `import '~/lib/dom/handlers/${name}';`)
					.join('\n');
				return imports + '\n';
			}
		},

		generateBundle(_, bundle) {
			const usedTokens = scanTokensInBundle(bundle);
			const neededHandlers = [...usedTokens].filter((t) => availableHandlers.has(t));

			if (neededHandlers.length > 0) {
				const code = neededHandlers
					.map((name) => `import '~/lib/dom/handlers/${name}';`)
					.join('\n') + '\n';

				this.emitFile({
					type: 'asset',
					fileName: 'janus-handlers-manifest.json',
					source: JSON.stringify(neededHandlers, null, 2),
				});

				this.emitFile({
					type: 'asset',
					fileName: 'janus-handlers.js',
					source: code,
				});
			}
		},
	};
}
