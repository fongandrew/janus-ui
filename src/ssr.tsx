import { NoHydration, renderToString } from 'solid-js/web';

import { Components } from '~/components';

export function render() {
	return renderToString(() => (
		<NoHydration>
			<Components title="Server Side Rendering" current="/ssr" />
		</NoHydration>
	));
}
