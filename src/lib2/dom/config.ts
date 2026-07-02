/**
 * Library-wide DOM-layer configuration (§12.2.2). The single canonical
 * attribute is `data-js` by default; a consumer whose markup namespace would
 * conflict overrides it before `mount()`.
 */

export const DEFAULT_JS_ATTR = 'data-js';

export interface JanusDomConfig {
	/** The canonical behavior attribute name (default `data-js`). */
	attr: string;
}

const config: JanusDomConfig = { attr: DEFAULT_JS_ATTR };

/** Override configuration. Call before `mount()`. */
export function setup(opts: Partial<JanusDomConfig>): void {
	Object.assign(config, opts);
}

/** The configured behavior attribute name. Producers read this, never a literal. */
export function jsAttr(): string {
	return config.attr;
}
