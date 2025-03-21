import { Ellipsis, Settings } from 'lucide-solid';

import { Button, GhostButton, IconButton, LinkButton } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';

export function ButtonsDemo() {
	return (
		<Card id="buttons-demo" class="t-col-span-full">
			<CardHeader>
				<CardTitle>Buttons</CardTitle>
				<CardDescription>Different variations on your standard button</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
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
						<Button class="v-colors-primary">Primary</Button>
						<Button class="v-colors-danger">Danger</Button>
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
				</div>
			</CardContent>
		</Card>
	);
}
