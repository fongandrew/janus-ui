/**
 * Invoker Commands API (commandfor/command) — shipped in Chrome 135+,
 * Firefox 144+, Safari 26.2+ (the §15 browser floor) but not yet in
 * solid-js's JSX attribute types.
 */
import 'solid-js';

declare module 'solid-js' {
	namespace JSX {
		interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
			commandfor?: string;
			command?: string;
		}

		interface CSSProperties {
			'anchor-name'?: string;
			'position-anchor'?: string;
		}
	}
}
