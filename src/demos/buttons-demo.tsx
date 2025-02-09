import { Ellipsis, Settings } from 'lucide-solid';

import { Button, GhostButton, IconButton, LinkButton } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
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
					<div class="o-group">
						<Button class="v-input-sm">
							<Settings /> Small Button
						</Button>

						<Button>
							<Settings /> Default Button
						</Button>

						<Button class="v-input-lg">
							<Settings /> Large Button
						</Button>
					</div>
					<div class="o-group">
						<Button class="v-primary-colors">Primary</Button>
						<Button class="v-danger-colors">Danger</Button>
						<Button disabled>Disabled</Button>
						<GhostButton>Ghost</GhostButton>
						<LinkButton>Link</LinkButton>
						<IconButton label="Settings">
							<Settings />
						</IconButton>
						<IconButton label="More options">
							<Ellipsis />
						</IconButton>
					</div>
				</Stack>
			</CardContent>
		</Card>
	);
}
