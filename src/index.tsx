import '~/shared/style/tailwind.css';

import { Settings } from 'lucide-solid';
import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

import { Box } from '~/shared/components/box';
import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Group } from '~/shared/components/group';
import { Stack } from '~/shared/components/stack';

const App: Component = () => {
	return (
		<Box>
			<Card>
				<CardHeader>
					<CardTitle>Buttons</CardTitle>
					<CardDescription>Different variations on your standard button</CardDescription>
				</CardHeader>
				<CardContent>
					<Stack>
						<Group>
							<Button class="c-btn--sm">
								<Settings /> Small Button
							</Button>

							<Button>
								<Settings /> Default Button
							</Button>

							<Button class="c-btn--lg">
								<Settings /> Large Button
							</Button>
						</Group>
						<Group>
							<Button class="c-btn--primary">Primary</Button>
							<Button class="c-btn--danger">Danger</Button>
							<Button class="c-btn--ghost">Ghost</Button>
							<Button class="c-btn--link">Link</Button>
						</Group>
					</Stack>
				</CardContent>
			</Card>
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
