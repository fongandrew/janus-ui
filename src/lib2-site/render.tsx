import { type JSX } from 'solid-js';
import { NoHydration, renderToString } from 'solid-js/web';

/**
 * Render a static (zero client JS) documentation page to an HTML string.
 * Used by every v2 doc page's `render()` export, invoked by vite-plugin-ssg.
 */
export function renderStatic(page: () => JSX.Element): string {
	return renderToString(() => <NoHydration>{page()}</NoHydration>);
}
