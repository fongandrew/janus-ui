import { type Component } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';

const TextareasDemo: Component = () => (
	<Card>
		<CardHeader>
			<CardTitle>Text areas</CardTitle>
			<CardDescription>Larger input areas</CardDescription>
		</CardHeader>
		<CardContent>
			<Stack>
				<LabelStack>
					<Label>Default</Label>
					<Textarea placeholder="Default (medium) textarea" />
				</LabelStack>
				<LabelStack>
					<Label>Error</Label>
					<Textarea aria-invalid placeholder="Error state textarea" />
				</LabelStack>
				<LabelStack>
					<Label>Disabled</Label>
					<Textarea disabled placeholder="Disabled textarea" />
				</LabelStack>
			</Stack>
		</CardContent>
	</Card>
);

export { TextareasDemo };
