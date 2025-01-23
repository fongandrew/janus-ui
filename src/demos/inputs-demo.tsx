import { type Component } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Input, InputDate, InputTime } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { Stack } from '~/shared/components/stack';

export const InputsDemo: Component = () => (
	<Card>
		<CardHeader>
			<CardTitle>Inputs</CardTitle>
			<CardDescription>Text input fields in different states</CardDescription>
		</CardHeader>
		<CardContent>
			<Stack>
				<LabelStack>
					<Label>Default Input</Label>
					<Input placeholder="Placeholder content" />
				</LabelStack>
				<LabelStack>
					<Label>Error State Input</Label>
					<Input aria-invalid="true" placeholder="Some wrong value" />
				</LabelStack>
				<LabelStack>
					<Label>Disabled Input</Label>
					<Input disabled placeholder="Can't touch this" />
				</LabelStack>
				<LabelStack>
					<Label>Date Input</Label>
					<InputDate placeholder="Pick a date" value="2024-12-25" />
				</LabelStack>
				<LabelStack>
					<Label>Time Input</Label>
					<InputTime placeholder="Pick a time" value="13:15" />
				</LabelStack>
			</Stack>
		</CardContent>
	</Card>
);
