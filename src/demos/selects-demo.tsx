import { createSignal, createUniqueId, For } from 'solid-js';
import { isServer } from 'solid-js/web';

import { listBoxNoRed, listBoxUpdateText } from '~/demos/callbacks/list-box';
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
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

function SelectsDemo() {
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [withInitValue, setWithInitValue] = createSignal<Set<string>>(new Set(['banana']));
	const [longValue, setLongValue] = createSignal<Set<string>>(new Set());
	const [multiValue, setMultiValue] = createSignal<Set<string>>(new Set());

	const descriptionId1 = createUniqueId();
	const descriptionId2 = createUniqueId();
	const descriptionId3 = createUniqueId();
	const descriptionId4 = createUniqueId();

	return (
		<Card id="selects-demo">
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
						descriptionId={descriptionId1}
					>
						<Select
							placeholder="Select a fruit..."
							values={value()}
							onValues={setValue}
							{...callbackAttrs(isServer && listBoxUpdateText(descriptionId1))}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</Select>
					</LabelledInput>

					<LabelledInput
						label="Single selection with initial value"
						description={`Selected: ${Array.from(withInitValue()).join(', ') || 'None'}`}
						descriptionId={descriptionId2}
					>
						<Select
							placeholder="Select a fruit..."
							values={withInitValue()}
							onValues={setWithInitValue}
							{...callbackAttrs(isServer && listBoxUpdateText(descriptionId2))}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</Select>
					</LabelledInput>

					<LabelledInput
						label="Multiple selection"
						description={`Selected: ${Array.from(multiValue()).join(', ') || 'None'}`}
						descriptionId={descriptionId3}
						errorMessage={multiValue().has('red') ? "Don't pick red." : null}
					>
						<Select
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onValues={setMultiValue}
							multiple
							{...callbackAttrs(
								isServer && listBoxNoRed,
								isServer && listBoxUpdateText(descriptionId3),
							)}
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
						description={`Selected: ${Array.from(longValue()).join(', ') || 'None'}`}
						descriptionId={descriptionId4}
					>
						<Select
							placeholder="Select an option..."
							values={longValue()}
							onValues={setLongValue}
							{...callbackAttrs(isServer && listBoxUpdateText(descriptionId4))}
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

export { SelectsDemo };
