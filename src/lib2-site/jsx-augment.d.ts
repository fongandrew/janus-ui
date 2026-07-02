import 'solid-js';

/**
 * Augment Solid's JSX types for modern HTML/CSS features the shipped
 * `solid-js` / `csstype` versions don't yet know about: the Invoker Commands
 * API (`command` / `commandfor`) and CSS anchor positioning.
 */
declare module 'solid-js' {
	namespace JSX {
		interface ButtonHTMLAttributes<T> {
			command?: string;
			commandfor?: string;
		}
		interface CSSProperties {
			'anchor-name'?: string;
			'position-anchor'?: string;
			'position-area'?: string;
		}
	}
}
