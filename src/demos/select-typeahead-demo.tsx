import { createEffect, createSignal, createUniqueId, For } from 'solid-js';
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
import { ListBoxItem } from '~/shared/components/list-box';
import { SelectTypeahead } from '~/shared/components/select-typeahead';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

const COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];

function useAsyncParts(query: () => string) {
	const [busy, setBusy] = createSignal(false);
	const [results, setResults] = createSignal<string[]>([]);
	createEffect((prevTimeout?: ReturnType<typeof setTimeout>) => {
		if (prevTimeout) {
			clearTimeout(prevTimeout);
		}

		const normalized = query().trim().toLowerCase();
		if (normalized) setBusy(true);

		return setTimeout(
			() => {
				setResults(
					normalized
						? COLORS.filter((color) => color.toLowerCase().includes(normalized))
						: [],
				);
				setBusy(false);
			},
			normalized ? 2000 : 0,
		);
	});
	return [busy, results] as const;
}

function SingleTypeahead() {
	const descriptionId = createUniqueId();
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [query, setQuery] = createSignal('');
	const [busy, parts] = useAsyncParts(query);

	return (
		<LabelledInput
			label="Single selection"
			description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
			descriptionId={descriptionId}
		>
			<SelectTypeahead
				busy={busy()}
				placeholder="Select a color..."
				values={value()}
				onValues={setValue}
				onValueInput={setQuery}
				{...callbackAttrs(isServer && listBoxUpdateText(descriptionId))}
			>
				<For each={parts()}>
					{(part) => <ListBoxItem value={part.toLowerCase()}>{part}</ListBoxItem>}
				</For>
			</SelectTypeahead>
		</LabelledInput>
	);
}

function MultiTypeahead() {
	const descriptionId = createUniqueId();
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [query, setQuery] = createSignal('');
	const [busy, parts] = useAsyncParts(query);

	return (
		<LabelledInput
			label="Multiple selection"
			description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
			descriptionId={descriptionId}
			errorMessage={value().has('red') ? "Don't pick red." : null}
		>
			<SelectTypeahead
				busy={busy()}
				placeholder="Select colors..."
				values={value()}
				onValues={setValue}
				onValueInput={setQuery}
				multiple
				{...callbackAttrs(
					isServer && listBoxNoRed,
					isServer && listBoxUpdateText(descriptionId),
				)}
			>
				<For each={parts()}>
					{(part) => <ListBoxItem value={part.toLowerCase()}>{part}</ListBoxItem>}
				</For>
			</SelectTypeahead>
		</LabelledInput>
	);
}

function LongTypeahead() {
	const descriptionId = createUniqueId();
	const [value, setValue] = createSignal<Set<string>>(new Set());
	return (
		<LabelledInput
			label="Long selection list"
			description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
			descriptionId={descriptionId}
		>
			<SelectTypeahead
				placeholder="Select an option..."
				values={value()}
				onValues={setValue}
				{...callbackAttrs(isServer && listBoxUpdateText(descriptionId))}
			>
				<For each={[...Array(100).keys()]}>
					{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
				</For>
			</SelectTypeahead>
		</LabelledInput>
	);
}

function SelectTypeaheadDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Typeahead</CardTitle>
				<CardDescription>Search input with single and multiple selection</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<SingleTypeahead />
					<MultiTypeahead />
					<LongTypeahead />

					<LabelledInput label="Disabled selection">
						<SelectTypeahead disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
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
