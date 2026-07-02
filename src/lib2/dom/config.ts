/**
 * Library-wide configuration (§12.2.2). The canonical behavior attribute is
 * `data-js`; consumers whose markup namespace conflicts can override before
 * mount(). Producers and the dispatcher read the configured name through
 * jsAttr() rather than hardcoding the string, so an override propagates
 * uniformly.
 */

/** The default canonical attribute name. */
export const JS_ATTR = 'data-js';

let currentAttr: string = JS_ATTR;

export interface SetupOptions {
	/** Override the canonical behavior attribute (default "data-js"). */
	attr?: string;
}

/** Configure library-wide settings. Call before mount(). */
export function setup(options: SetupOptions): void {
	if (options.attr) currentAttr = options.attr;
}

/** The currently-configured behavior attribute name. */
export function jsAttr(): string {
	return currentAttr;
}
