import '~/shared/style/tailwind.css';

import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

import { Button } from '~/shared/components/button';

const App: Component = () => {
	return (
		<>
			<div class="bg-primary text-primary-fg">Hello world</div>
			<Button>Click me</Button>
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
