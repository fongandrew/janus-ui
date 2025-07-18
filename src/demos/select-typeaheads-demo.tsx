import { createEffect, createSignal, createUniqueId, For } from 'solid-js';
import { isServer } from 'solid-js/web';

import { listBoxNoRed, listBoxUpdateText } from '~/demos/callbacks/list-box';
import { selectQuery } from '~/demos/callbacks/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { LabelledInput } from '~/lib/components/labelled-control';
import { ListBoxContext, ListBoxItem } from '~/lib/components/list-box';
import { SelectTypeahead } from '~/lib/components/select-typeahead';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

const COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];

function SelectTypeaheadsDemo() {
	return (
		<Card id="select-typeaheads-demo">
			<CardHeader>
				<CardTitle>Typeahead</CardTitle>
				<CardDescription>Search input with single and multiple selection</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<SingleTypeahead />
					<MultiTypeahead />
					<LongTypeahead />
					<DisabledTypeahead />
					<InitialSelectionTypeahead />
				</div>
			</CardContent>
		</Card>
	);
}

function SingleTypeahead() {
	const descriptionId = createUniqueId();
	const templateId = createUniqueId();
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [query, setQuery] = createSignal('');
	const [busy, parts] = useAsyncParts(query);

	return (
		<>
			<LabelledInput
				label="Single selection"
				description={`Selected: ${Array.from(value()).join(', ') || 'None'}`}
				descriptionId={descriptionId}
				data-testid="single-typeahead-container"
			>
				<SelectTypeahead
					busy={busy()}
					name="select-typeahead__single"
					placeholder="Select a color..."
					values={value()}
					onValues={setValue}
					onValueInput={setQuery}
					data-testid="single-typeahead"
					{...callbackAttrs(
						isServer && listBoxUpdateText(descriptionId),
						isServer && selectQuery(templateId),
					)}
				>
					<For each={parts()}>
						{(part) => <ListBoxItem value={part.toLowerCase()}>{part}</ListBoxItem>}
					</For>
				</SelectTypeahead>
			</LabelledInput>
			<ResultsTemplate id={templateId} name="select-typeahead__single" />
		</>
	);
}

function MultiTypeahead(props: {
	label?: string | undefined;
	initialValues?: Set<string>;
	'data-testid'?: string | undefined;
}) {
	const descriptionId = createUniqueId();
	const templateId = createUniqueId();
	const [values, setValues] = createSignal<Set<string>>(props.initialValues ?? new Set());
	const [query, setQuery] = createSignal('');
	const [busy, parts] = useAsyncParts(query);

	return (
		<>
			<LabelledInput
				label={props.label ?? 'Multiple selection'}
				description={`Selected: ${Array.from(values()).join(', ') || 'None'}`}
				descriptionId={descriptionId}
				errorMessage={values().has('red') ? "Don't pick red." : null}
				data-testid={
					props['data-testid']
						? `${props['data-testid']}-container`
						: 'multiple-typeahead-container'
				}
			>
				<SelectTypeahead
					busy={busy()}
					name="select-typeahead__multiple"
					placeholder="Select colors..."
					values={values()}
					onValues={setValues}
					onValueInput={setQuery}
					multiple
					data-testid={props['data-testid'] ?? 'multiple-typeahead'}
					{...callbackAttrs(
						isServer && listBoxNoRed,
						isServer && listBoxUpdateText(descriptionId),
						isServer && selectQuery(templateId),
					)}
				>
					<For each={parts()}>
						{(part) => <ListBoxItem value={part.toLowerCase()}>{part}</ListBoxItem>}
					</For>
				</SelectTypeahead>
			</LabelledInput>
			<ResultsTemplate id={templateId} name="select-typeahead__multiple" multiple />
		</>
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
			data-testid="long-typeahead-container"
		>
			<SelectTypeahead
				placeholder="Select an option..."
				values={value()}
				onValues={setValue}
				data-testid="long-typeahead"
				{...callbackAttrs(isServer && listBoxUpdateText(descriptionId))}
			>
				<For each={[...Array(100).keys()]}>
					{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
				</For>
			</SelectTypeahead>
		</LabelledInput>
	);
}

function DisabledTypeahead() {
	return (
		<LabelledInput label="Disabled selection" data-testid="disabled-typeahead-container">
			<SelectTypeahead disabled values={new Set(['fixed'])} data-testid="disabled-typeahead">
				<ListBoxItem value="fixed">Can't change me</ListBoxItem>
				<ListBoxItem value="different">Can't pick me</ListBoxItem>
			</SelectTypeahead>
		</LabelledInput>
	);
}

function InitialSelectionTypeahead() {
	return (
		<MultiTypeahead
			label="With initial selection"
			initialValues={new Set(['blue', 'green'])}
			data-testid="initial-selection-typeahead"
		/>
	);
}

/** Used to approximate an XHR response with SSR demos */
function ResultsTemplate(props: { id: string; name: string; multiple?: boolean }) {
	return (
		<template {...props}>
			<ListBoxContext.Provider value={props}>
				<For each={COLORS}>
					{(part) => <ListBoxItem value={part.toLowerCase()}>{part}</ListBoxItem>}
				</For>
			</ListBoxContext.Provider>
		</template>
	);
}

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
			normalized ? 1000 : 0,
		);
	});
	return [busy, results] as const;
}

export { SelectTypeaheadsDemo };
