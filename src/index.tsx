import '~/shared/style/tailwind.css';

import { Settings } from 'lucide-solid';
import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

import { Box } from '~/shared/components/box';
import { Button } from '~/shared/components/button';
import { Group } from '~/shared/components/group';

const App: Component = () => {
	return (
		<Box class="p-lg">
			<Group>
				<Button class="btnSm">
					<Settings /> Small Button
				</Button>

				<Button>
					<Settings /> Default Button
				</Button>

				<Button class="btnLg">
					<Settings /> Large Button
				</Button>
			</Group>
			<Group>
				<Button class="btnPrimary">Primary</Button>
				<Button class="btnDanger">Danger</Button>
			</Group>
		</Box>
	);
};

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
	);
}

render(() => <App />, root!);
