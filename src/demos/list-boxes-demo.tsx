import { createSignal, createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { listBoxNoRed, listBoxUpdateText } from '~/demos/callbacks/list-box';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { LabelledInput } from '~/lib/components/labelled-control';
import { ListBox, ListBoxGroup, ListBoxItem } from '~/lib/components/list-box';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

function ListBoxesDemo() {
	const [values, setValues] = createSignal<Set<string>>(new Set());
	const [multiValues, setMultiValues] = createSignal<Set<string>>(new Set());

	const descriptionId1 = createUniqueId();
	const descriptionId2 = createUniqueId();

	return (
		<Card id="list-boxes-demo">
			<CardHeader>
				<CardTitle>List box</CardTitle>
				<CardDescription>Single and multiple selection list boxes</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledInput
						label="Single selection"
						descriptionId={descriptionId1}
						description={`Selected: ${Array.from(values()).join(', ') || 'None'}`}
					>
						<ListBox
							name="single-listbox"
							values={values()}
							onValues={setValues}
							{...callbackAttrs(isServer && listBoxUpdateText(descriptionId1))}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</ListBox>
					</LabelledInput>

					<LabelledInput
						label="Multiple selection"
						description={`Selected: ${Array.from(multiValues()).join(', ') || 'None'}`}
						descriptionId={descriptionId2}
						errorMessage={multiValues().has('red') ? "Don't pick red." : null}
					>
						<ListBox
							name="multi-listbox"
							values={multiValues()}
							onValues={setMultiValues}
							multiple
							aria-invalid={multiValues().has('red')}
							{...callbackAttrs(
								isServer && listBoxNoRed,
								isServer && listBoxUpdateText(descriptionId2),
							)}
						>
							<ListBoxGroup heading="Don't Pick These">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<ListBoxGroup>
								<ListBoxItem value="green">Green</ListBoxItem>
								<ListBoxItem value="blue">Blue</ListBoxItem>
							</ListBoxGroup>
						</ListBox>
					</LabelledInput>

					<LabelledInput label="Disabled selection">
						<ListBox disabled name="disabled-listbox" values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</ListBox>
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

export { ListBoxesDemo };
