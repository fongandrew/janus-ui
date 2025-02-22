import { renderToString } from 'solid-js/web';

import { App } from '~/app';

function Main() {
	return (
		<App heading={<h1>Server-Side Rendering</h1>} current="/ssr">
			Hello World
		</App>
	);
}

export function render() {
	return renderToString(() => <Main />);
}
