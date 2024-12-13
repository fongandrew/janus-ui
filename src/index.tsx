import '~/shared/style/tailwind.css';

import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

const App: Component = () => {
	return (
		<>
			<div class="text-blue-500">Hello world</div>
		</>
	);
};

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
	);
}

render(() => <App />, root!);
