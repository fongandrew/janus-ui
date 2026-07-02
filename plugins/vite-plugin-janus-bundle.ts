import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { type Plugin } from 'vite';

/**
 * vite-plugin-janus-bundle — SSR-driven handler purge (design spec §12.4).
 *
 * For apps with separate SSR and client builds: run the SSR build first,
 * then build the client with this plugin pointed at the SSR output. It
 * text-scans the emitted output for `data-js` attribute values
 * (PurgeCSS-style — no module-graph introspection), maps each token to a
 * handler file via the filename-as-manifest convention (`t-roving-focus` →
 * `handlers/t-roving-focus.ts`), and serves a virtual client entry that
 * statically imports exactly those modules:
 *
 *   // client entry
 *   import 'virtual:janus-handlers';
 *   import { mount } from '~/lib2/dom';
 *   mount();
 *
 * Dev mode defaults to Pattern A (the everything bundle) — fast HMR, no
 * dev-vs-prod behavior divergence; only bundle composition differs.
 *
 * One hard rule this depends on: behavior names always appear as literal
 * strings in markup/source. No `data-js="t-${dynamic}"` construction.
 */

export interface JanusBundleOptions {
	/** Directory of SSR-emitted output to scan (html/js). */
	scanDir?: string;
	/** Handlers directory (filename-as-manifest). */
	handlersDir?: string;
	/** Module specifier prefix used in generated imports. */
	handlersImportPrefix?: string;
	/** The catchall entry used in dev / when no scan output exists. */
	allEntry?: string;
	/** The canonical behavior attribute (override via dom setup()). */
	attr?: string;
	/** Force Pattern A (everything bundle) even in build mode. */
	all?: boolean;
}

const VIRTUAL_ID = 'virtual:janus-handlers';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** Scan text for data-js attribute values and return the token set. */
export function scanTokens(source: string, attr = 'data-js'): Set<string> {
	const tokens = new Set<string>();
	const attrPattern = new RegExp(`${attr}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'g');
	for (const match of source.matchAll(attrPattern)) {
		const value = match[2] ?? match[3] ?? '';
		for (const token of value.split(/\s+/)) {
			// Behavior tokens carry the CSS prefix scheme (§12.2.2)
			if (/^[tcp]-[\w-]+(__[\w-]+)?$/.test(token)) tokens.add(token);
		}
	}
	return tokens;
}

/** Recursively collect scannable files (html + js output). */
function collectFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) out.push(...collectFiles(full));
		else if (/\.(html|js|mjs)$/.test(entry)) out.push(full);
	}
	return out;
}

/** Which of the scanned tokens map to real handler modules. */
export function resolveHandlerTokens(tokens: Iterable<string>, handlersDir: string): string[] {
	const available = new Set(
		readdirSync(handlersDir)
			.filter((file) => /\.(ts|js|tsx|jsx)$/.test(file))
			.map((file) => file.replace(/\.(ts|js|tsx|jsx)$/, '')),
	);
	return [...tokens].filter((token) => available.has(token)).sort();
}

/** Generate the virtual entry source for a token list. */
export function generateEntry(handlerTokens: string[], importPrefix: string): string {
	if (!handlerTokens.length) {
		return '// janus-bundle: no data-js tokens found in the scanned output\nexport {};\n';
	}
	return (
		handlerTokens.map((token) => `import '${importPrefix}/${token}';`).join('\n') +
		'\nexport {};\n'
	);
}

export default function janusBundlePlugin(options: JanusBundleOptions = {}): Plugin {
	const {
		scanDir = 'dist',
		handlersDir = 'src/lib2/dom/handlers',
		handlersImportPrefix = '~/lib2/dom/handlers',
		allEntry = '~/lib2/dom/all',
		attr = 'data-js',
		all = false,
	} = options;

	let isBuild = false;

	return {
		name: 'janus-bundle',

		configResolved(config) {
			isBuild = config.command === 'build';
		},

		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
			return null;
		},

		load(id) {
			if (id !== RESOLVED_ID) return null;

			// Dev / forced Pattern A: everything bundle.
			if (!isBuild || all) {
				return `import '${allEntry}';\nexport {};\n`;
			}

			// Build: scan the SSR output emitted by the prior pass.
			let files: string[];
			try {
				files = collectFiles(scanDir);
			} catch {
				this.warn(
					`janus-bundle: scan directory "${scanDir}" not found — falling back to the everything bundle (${allEntry}). Run the SSR build first for a purged client bundle.`,
				);
				return `import '${allEntry}';\nexport {};\n`;
			}

			const tokens = new Set<string>();
			for (const file of files) {
				for (const token of scanTokens(readFileSync(file, 'utf8'), attr)) {
					tokens.add(token);
				}
			}
			const handlerTokens = resolveHandlerTokens(tokens, handlersDir);
			this.info(
				`janus-bundle: ${handlerTokens.length} handler(s) referenced in ${files.length} scanned file(s)`,
			);
			return generateEntry(handlerTokens, handlersImportPrefix);
		},
	};
}
