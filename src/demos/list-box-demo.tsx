import { type Component, createSignal } from 'solid-js';

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
import { ListBox, ListBoxGroup, ListBoxItem } from '~/shared/components/list-box';
import { Stack } from '~/shared/components/stack';

const ListBoxDemo: Component = () => {
	const [values, setValues] = createSignal<Set<string>>(new Set());
	const [multiValues, setMultiValues] = createSignal<Set<string>>(new Set());

	return (
		<Card>
			<CardHeader>
				<CardTitle>List box</CardTitle>
				<CardDescription>Single and multiple selection list boxes</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Single selection</Label>
						<Description>
							Selected: {Array.from(values()).join(', ') || 'None'}
						</Description>
						<ListBox name="single-listbox" values={values()} onValues={setValues}>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</ListBox>
					</LabelStack>

					<LabelStack>
						<Label>Multiple selection</Label>
						<Description>
							Selected: {Array.from(multiValues()).join(', ') || 'None'}
						</Description>
						<ListBox
							name="multi-listbox"
							values={multiValues()}
							onValues={setMultiValues}
							multiple
							aria-invalid={multiValues().has('red')}
						>
							<ListBoxGroup heading="Don't Pick These">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<ListBoxGroup>
								<ListBoxItem value="green">Green</ListBoxItem>
								<ListBoxItem value="blue">Blue</ListBoxItem>
							</ListBoxGroup>
						</ListBox>
						<ErrorMessage>
							{multiValues().has('red') ? "Don't pick red." : null}
						</ErrorMessage>
					</LabelStack>

					<LabelStack>
						<Label>Disabled selection</Label>
						<ListBox disabled name="disabled-listbox" values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</ListBox>
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
};

export { ListBoxDemo };
