import { type Component, createSignal, For } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { ListBoxGroup, ListBoxItem } from '~/shared/components/list-box';
import { Select } from '~/shared/components/select';
import { Stack } from '~/shared/components/stack';

const SelectDemo: Component = () => {
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [multiValue, setMultiValue] = createSignal<Set<string>>(new Set());

	return (
		<Card>
			<CardHeader>
				<CardTitle>Select</CardTitle>
				<CardDescription>
					Dropdown select with single and multiple selection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Single Selection</Label>
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
						<Select
							placeholder="Select a fruit..."
							values={value()}
							onValues={setValue}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</Select>
					</LabelStack>

					<LabelStack>
						<Label>Multiple Selection</Label>
						<Description>
							Selected: {Array.from(multiValue()).join(', ') || 'None'}
						</Description>
						<Select
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onValues={setMultiValue}
							multiple
						>
							<ListBoxGroup heading="Don't Pick These">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<ListBoxGroup>
								<ListBoxItem value="green">Green</ListBoxItem>
								<ListBoxItem value="blue">Blue</ListBoxItem>
							</ListBoxGroup>
						</Select>
						<ErrorMessage>
							{multiValue().has('red') ? "Don't pick red." : null}
						</ErrorMessage>
					</LabelStack>

					<LabelStack>
						<Label>Long Selection List</Label>
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
						<Select
							placeholder="Select an option..."
							values={value()}
							onValues={setValue}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
						</Select>
					</LabelStack>

					<LabelStack>
						<Label>Disabled Selection</Label>
						<Select disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</Select>
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
};

export { SelectDemo };
