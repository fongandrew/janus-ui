import { createSignal, createUniqueId, For } from 'solid-js';
import { isServer } from 'solid-js/web';

import { listBoxNoRed, listBoxUpdateText } from '~/demos/callbacks/list-box';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { LabelledInput } from '~/lib/components/labelled-control';
import { ListBoxGroup, ListBoxItem } from '~/lib/components/list-box';
import { Select } from '~/lib/components/select';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

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
						data-testid="single-selection-container"
					>
						<Select
							placeholder="Select a fruit..."
							values={value()}
							onValues={setValue}
							data-testid="single-selection"
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
						data-testid="initial-value-container"
					>
						<Select
							placeholder="Select a fruit..."
							values={withInitValue()}
							onValues={setWithInitValue}
							data-testid="initial-value-selection"
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
						data-testid="multiple-selection-container"
					>
						<Select
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onValues={setMultiValue}
							multiple
							data-testid="multiple-selection"
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
						data-testid="long-selection-container"
					>
						<Select
							placeholder="Select an option..."
							values={longValue()}
							onValues={setLongValue}
							data-testid="long-selection"
							{...callbackAttrs(isServer && listBoxUpdateText(descriptionId4))}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
						</Select>
					</LabelledInput>

					<LabelledInput
						label="Disabled selection"
						data-testid="disabled-selection-container"
					>
						<Select
							disabled
							values={new Set(['fixed'])}
							data-testid="disabled-selection"
						>
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
