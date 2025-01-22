import { type Component, createMemo, createSignal, For, Show } from 'solid-js';

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
import { SelectTypeahead } from '~/shared/components/select-typeahead';
import { Stack } from '~/shared/components/stack';

const SelectTypeaheadDemo: Component = () => {
	// Value selection
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [multiValue, setMultiValue] = createSignal<Set<string>>(new Set());

	// Create values from typeaheads
	const [query, setQuery] = createSignal('');
	const parts = createMemo(() =>
		query()
			.split(/\s+/)
			.map((word) => word.trim())
			.filter((word) => word.length > 0),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Typeahead</CardTitle>
				<CardDescription>Search input with single and multiple selection</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Single Selection</Label>
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
						<SelectTypeahead
							placeholder="Select a fruit..."
							values={value()}
							onValues={setValue}
							onValueInput={setQuery}
						>
							<For each={parts()}>
								{(part) => <ListBoxItem value={part}>{part}</ListBoxItem>}
							</For>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Multiple Selection</Label>
						<Description>
							Selected: {Array.from(multiValue()).join(', ') || 'None'}
						</Description>
						<SelectTypeahead
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onValues={setMultiValue}
							onValueInput={setQuery}
							multiple
						>
							<ListBoxGroup heading="Don't Pick This">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<Show when={parts().length > 0}>
								<ListBoxGroup>
									<For each={parts()}>
										{(part) => <ListBoxItem value={part}>{part}</ListBoxItem>}
									</For>
								</ListBoxGroup>
							</Show>
						</SelectTypeahead>
						<ErrorMessage>
							{multiValue().has('red') ? "Don't pick red." : null}
						</ErrorMessage>
					</LabelStack>

					<LabelStack>
						<Label>Disabled Selection</Label>
						<SelectTypeahead disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Long Selection List</Label>
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
						<SelectTypeahead
							placeholder="Select an option..."
							values={value()}
							onValues={setValue}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Select With No Matches</Label>
						<SelectTypeahead placeholder="Won't match" />
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
};

export { SelectTypeaheadDemo };
