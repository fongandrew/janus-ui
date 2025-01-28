import { Ellipsis, Settings } from 'lucide-solid';

import { Button, IconButton } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Group } from '~/shared/components/group';
import { Stack } from '~/shared/components/stack';

export function ButtonsDemo() {
	return (
		<Card class="col-span-full">
			<CardHeader>
				<CardTitle>Buttons</CardTitle>
				<CardDescription>Different variations on your standard button</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Group>
						<Button class="c-button--sm">
							<Settings /> Small Button
						</Button>

						<Button>
							<Settings /> Default Button
						</Button>

						<Button class="c-button--lg">
							<Settings /> Large Button
						</Button>
					</Group>
					<Group>
						<Button class="c-button--primary">Primary</Button>
						<Button class="c-button--danger">Danger</Button>
						<Button disabled>Disabled</Button>
						<Button class="c-button--ghost">Ghost</Button>
						<Button class="c-button--link">Link</Button>
						<IconButton label="Settings">
							<Settings />
						</IconButton>
						<IconButton label="More options">
							<Ellipsis />
						</IconButton>
					</Group>
				</Stack>
			</CardContent>
		</Card>
	);
}
