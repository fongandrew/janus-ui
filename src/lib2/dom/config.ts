/**
 * Library-wide configuration for the DOM layer.
 *
 * The canonical opt-in attribute is `data-js` by default. Consumers whose markup
 * namespace would conflict can override it via `setup()` before calling `mount()`.
 * Producers read {@link JS_ATTR} rather than hardcoding the string, so an override
 * propagates uniformly across producers and the dispatcher.
 */

export interface JanusConfig {
	/** The canonical behavior opt-in attribute. Default `"data-js"`. */
	attr: string;
}

const config: JanusConfig = {
	attr: 'data-js',
};

/**
 * Override library-wide settings. Call before `mount()`.
 *
 * ```ts
 * import { setup } from '~/lib2/dom';
 * setup({ attr: 'data-foo' });
 * ```
 */
export function setup(overrides: Partial<JanusConfig>): void {
	Object.assign(config, overrides);
}

/** The configured behavior opt-in attribute name (e.g. `"data-js"`). */
export const JS_ATTR = {
	get value(): string {
		return config.attr;
	},
};

/** Read the configured opt-in attribute name. */
export function jsAttr(): string {
	return config.attr;
}
