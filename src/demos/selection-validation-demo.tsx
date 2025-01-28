import { createSignal, Show } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { Form } from '~/shared/components/form';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledInput } from '~/shared/components/labelled-control';
import { ListBox, ListBoxItem } from '~/shared/components/list-box';
import { Select } from '~/shared/components/select';
import { Stack } from '~/shared/components/stack';

export function SelectionValidationDemo() {
	const [formData, setFormData] = createSignal<{
		fruits: string[];
		colors: string[];
	} | null>(null);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		setFormData({
			fruits: data.getAll('fruits') as string[],
			colors: data.getAll('colors') as string[],
		});
	};

	const handleReset = () => {
		setFormData(null);
	};

	const validateMultiple = (values: Set<string>) => {
		if (values.size < 2) {
			return 'Please select at least 2 items';
		}
		if (values.size > 3) {
			return 'Please select no more than 3 items';
		}
		return null;
	};

	const FormNames = {
		colors: 'colors',
		fruits: 'fruits',
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Selection validation</CardTitle>
				<CardDescription>Validation with ListBox and Select components</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Form onSubmit={handleSubmit} onReset={handleReset} names={FormNames}>
						<LabelledInput label="Select Fruits (2-3)">
							<ListBox
								name={FormNames.fruits}
								multiple
								onValidate={validateMultiple}
								required
							>
								<ListBoxItem value="apple">Apple</ListBoxItem>
								<ListBoxItem value="banana">Banana</ListBoxItem>
								<ListBoxItem value="orange">Orange</ListBoxItem>
								<ListBoxItem value="grape">Grape</ListBoxItem>
								<ListBoxItem value="kiwi">Kiwi</ListBoxItem>
							</ListBox>
						</LabelledInput>

						<LabelledInput label="Select Colors (2-3)">
							<Select
								name={FormNames.colors}
								multiple
								onValidate={validateMultiple}
								required
							>
								<ListBoxItem value="red">Red</ListBoxItem>
								<ListBoxItem value="blue">Blue</ListBoxItem>
								<ListBoxItem value="green">Green</ListBoxItem>
								<ListBoxItem value="yellow">Yellow</ListBoxItem>
								<ListBoxItem value="purple">Purple</ListBoxItem>
							</Select>
						</LabelledInput>
					</Form>

					<Show when={formData()}>
						<o>
							<Card>
								<CardHeader>
									<CardTitle>Submitted form data</CardTitle>
								</CardHeader>
								<CardContent>
									<Stack>
										<LabelStack>
											<Label>Selected fruits</Label>
											<Description>
												{formData()?.fruits.join(', ')}
											</Description>
										</LabelStack>
										<LabelStack>
											<Label>Selected colors</Label>
											<Description>
												{formData()?.colors.join(', ')}
											</Description>
										</LabelStack>
									</Stack>
								</CardContent>
							</Card>
						</o>
					</Show>
				</Stack>
			</CardContent>
			<CardFooter>
				<ResetButton />
				<SubmitButton />
			</CardFooter>
		</Card>
	);
}
