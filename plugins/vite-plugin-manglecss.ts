import type { Plugin } from 'vite';

const CLASS_NAME_REGEX = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;

const CSS_VARIABLE_REGEX = /(--[a-zA-Z][a-zA-Z0-9_-]*):/g;

interface CSSManglerOptions {
	// Regex to further narrow classnames to mangle (default: none)
	classNamePattern?: RegExp;
	// Regex to further narrow CSS variables to mangle (default: none)
	variablePattern?: RegExp;
	// Function to generate mangled name (default: prefix using class name + sequential hex ID)
	generateMangledClassName?: (className: string, sequenceId: number) => string;
	// Function to generate mangled name (default: prefix using class name + sequential hex ID)
	generateMangledVarName?: (varName: string, sequenceId: number) => string;
	// File extensions to collect class names from (default: ['.css'])
	collectFromExtensions?: string[];
	// File extensions to replace class names in (default: ['.css', '.html', '.js', '.jsx', '.ts', '.tsx'])
	replaceInExtensions?: string[];
	// Whether to enable in development mode
	enabled?: boolean | ((mode: string) => boolean);
	// Whether to log statistics
	verbose?: boolean;
}

export default function vitePluginMangleCss(options: CSSManglerOptions = {}): Plugin {
	const {
		classNamePattern,
		variablePattern,
		generateMangledClassName = (className, sequenceId) =>
			`${className[0] ?? 'c'}-${sequenceId.toString(36)}`,
		generateMangledVarName = (varName, sequenceId) =>
			`--${varName[2] ?? 'v'}-${sequenceId.toString(36)}`,
		collectFromExtensions = ['.css', '.less', '.scss'],
		replaceInExtensions = ['.css', '.html', '.js', '.jsx', '.ts', '.tsx'],
		enabled = (mode) => mode === 'production',
		verbose = false,
	} = options;

	// Store original to mangled class name mappings
	const classNameMap = new Map<string, string>();

	// Store original to mangled var name mappings
	const varNameMap = new Map<string, string>();

	// Counter for generating sequential class names
	let nameCounter = 1;

	// Is this plugin enabled?
	let isBuildEnabled: boolean;

	return {
		name: 'vite-plugin-css-mangler',

		configResolved(config) {
			isBuildEnabled = typeof enabled === 'function' ? enabled(config.mode) : enabled;
		},

		// First pass: collect all CSS class names
		transform(code: string, id: string) {
			if (!isBuildEnabled) {
				return;
			}

			// Check if we should process this file extension
			const ext = id.slice(id.lastIndexOf('.'));
			if (!collectFromExtensions.includes(ext)) {
				return null;
			}

			// Collect class names if this extension is in the collection list
			const classMatches = code.match(CLASS_NAME_REGEX);
			if (classMatches) {
				classMatches.forEach((match) => {
					const className = match.slice(1); // Remove dot
					if (classNamePattern && !classNamePattern.test(className)) {
						return;
					}
					if (!classNameMap.has(className)) {
						classNameMap.set(
							className,
							generateMangledClassName(className, nameCounter++),
						);
					}
				});
			}

			// Collect var names if this extension is in the collection list
			const varMatches = code.match(CSS_VARIABLE_REGEX);
			if (varMatches) {
				varMatches.forEach((match) => {
					const varName = match.slice(0, -1); // Remove colon
					if (variablePattern && !variablePattern.test(varName)) {
						return;
					}
					if (!varNameMap.has(varName)) {
						varNameMap.set(varName, generateMangledVarName(varName, nameCounter++));
					}
				});
			}

			return null;
		},

		// Second pass: replace class names in all files
		generateBundle(_, bundle) {
			if (!isBuildEnabled) {
				return;
			}

			for (const fileName in bundle) {
				const chunk = bundle[fileName];

				// Check if this file extension is in our replace list
				const ext = fileName.slice(fileName.lastIndexOf('.'));
				if (!replaceInExtensions.includes(ext)) {
					continue;
				}

				if (chunk.type === 'chunk' || chunk.type === 'asset') {
					let source = chunk.type === 'chunk' ? chunk.code : chunk.source;

					if (typeof source === 'string') {
						// Replace all class names using the mapping
						for (const [original, mangled] of classNameMap) {
							// Create a regex that matches the class name in various contexts
							const contextPattern = new RegExp(
								`(?:^|[^a-zA-Z0-9_-])(${original})(?=$|[^a-zA-Z0-9_-])`,
								'g',
							);

							source = source.replace(contextPattern, (match) => {
								return match.replace(original, mangled);
							});
						}

						// Replace all class names using the mapping
						for (const [original, mangled] of varNameMap) {
							// Create a regex that matches the class name in various contexts
							const contextPattern = new RegExp(
								`(?:^|[^a-zA-Z0-9_-])(${original})(?=$|[^a-zA-Z0-9_-])`,
								'g',
							);

							source = source.replace(contextPattern, (match) => {
								return match.replace(original, mangled);
							});
						}

						if (chunk.type === 'chunk') {
							chunk.code = source;
						} else {
							chunk.source = source;
						}
					}
				}
			}
		},

		// Optional: provide debug information
		closeBundle() {
			if (verbose) {
				console.log('CSS Mangler Statistics:');
				console.log(`Total classes mangled: ${classNameMap.size}`);
				console.log(`Total variables mangled: ${varNameMap.size}`);
				console.log('Class name mapping:');
				console.log(Object.fromEntries(classNameMap));
				console.log('Var name mapping:');
				console.log(Object.fromEntries(varNameMap));
			}
		},
	};
}
