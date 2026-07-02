import { type JSX } from 'solid-js';
import { NoHydration, renderToString } from 'solid-js/web';

/**
 * Render a documentation page to a static HTML string.
 *
 * Pages are Solid JSX modules rendered to static HTML by `vite-plugin-ssg`
 * (§19): no hydration, no `data-js`, zero client JS in the output. Wrapping in
 * `<NoHydration>` keeps Solid from emitting hydration markers.
 */
export function renderPage(content: () => JSX.Element): string {
	return renderToString(() => <NoHydration>{content()}</NoHydration>);
}
