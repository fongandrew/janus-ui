/**
 * Library-wide configuration. Producers and the dispatcher both import
 * `JS_ATTR` rather than hardcoding the string `"data-js"`, so a `setup()`
 * override propagates uniformly. (ES module bindings are live references —
 * reassigning the exported `let` here updates every importer.)
 */

export interface JanusDomConfig {
	/** The canonical attribute behaviors are opted into. Default: "data-js". */
	attr: string;
}

/** The currently configured `data-js`-equivalent attribute name. */
export let JS_ATTR = 'data-js';

/**
 * Override library-wide configuration. Call before `mount()` — the
 * dispatcher's document-level listeners read `JS_ATTR` at event time, but
 * elements already scanned before a `setup()` call are unaffected, so this
 * should run before any markup is rendered or mounted.
 */
export function setup(overrides: Partial<JanusDomConfig>): void {
	if (overrides.attr !== undefined) {
		JS_ATTR = overrides.attr;
	}
}
