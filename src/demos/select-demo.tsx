import { createSignal, For } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { LabelledInput } from '~/shared/components/labelled-control';
import { ListBoxGroup, ListBoxItem } from '~/shared/components/list-box';
import { Select } from '~/shared/components/select';

function SelectDemo() {
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
				<div class="o-stack">
					<LabelledInput
						label="Single selection"
						description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
					>
						<Select
							placeholder="Select a fruit..."
							values={value()}
							onValues={setValue}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</Select>
					</LabelledInput>

					<LabelledInput
						label="Multiple selection"
						description={`Selected: ${Array.from(multiValue()).join(', ') || 'None'}`}
						errorMessage={multiValue().has('red') ? "Don't pick red." : null}
					>
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
					</LabelledInput>

					<LabelledInput
						label="Long selection list"
						description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
					>
						<Select
							placeholder="Select an option..."
							values={value()}
							onValues={setValue}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
						</Select>
					</LabelledInput>

					<LabelledInput label="Disabled selection">
						<Select disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</Select>
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

export { SelectDemo };
