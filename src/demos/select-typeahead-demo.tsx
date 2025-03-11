import { createMemo, createSignal, For, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

import { listBoxNoRed } from '~/demos/callbacks/list-box';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { LabelledInput } from '~/shared/components/labelled-control';
import { ListBoxGroup, ListBoxItem } from '~/shared/components/list-box';
import { SelectTypeahead } from '~/shared/components/select-typeahead';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

function SelectTypeaheadDemo() {
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
				<div class="o-stack">
					<LabelledInput
						label="Single selection"
						description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
					>
						<SelectTypeahead
							placeholder="Select a fruit..."
							values={value()}
							onValues={setValue}
							onValueInput={setQuery}
						>
							<For each={parts()}>
								{(part, index) => (
									<ListBoxItem value={`${part}-${index()}`}>{part}</ListBoxItem>
								)}
							</For>
						</SelectTypeahead>
					</LabelledInput>

					<LabelledInput
						label="Multiple selection"
						description={`Selected: ${Array.from(multiValue()).join(', ') || 'None'}`}
						errorMessage={multiValue().has('red') ? "Don't pick red." : null}
					>
						<SelectTypeahead
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onValues={setMultiValue}
							onValueInput={setQuery}
							multiple
							{...callbackAttrs(isServer && listBoxNoRed)}
						>
							<ListBoxGroup heading="Don't Pick This">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<Show when={parts().length > 0}>
								<ListBoxGroup>
									<For each={parts()}>
										{(part, index) => (
											<ListBoxItem value={`${part}-${index()}`}>
												{part}
											</ListBoxItem>
										)}
									</For>
								</ListBoxGroup>
							</Show>
						</SelectTypeahead>
					</LabelledInput>

					<LabelledInput label="Disabled selection">
						<SelectTypeahead disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</SelectTypeahead>
					</LabelledInput>

					<LabelledInput
						label="Long selection list"
						description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
					>
						<SelectTypeahead
							placeholder="Select an option..."
							values={value()}
							onValues={setValue}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
						</SelectTypeahead>
					</LabelledInput>

					<LabelledInput label="Select with no matches">
						<SelectTypeahead placeholder="Won't match" />
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

export { SelectTypeaheadDemo };
