import { createSignal, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

import { formOutputClear, formOutputWrite } from '~/demos/callbacks/form-output';
import { listBoxMinMax } from '~/demos/callbacks/list-box';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/lib/components/card';
import { BaseDescription } from '~/lib/components/description';
import { Form } from '~/lib/components/form';
import { ResetButton, SubmitButton } from '~/lib/components/form-buttons';
import { FormContextProvider } from '~/lib/components/form-context';
import { Label } from '~/lib/components/label';
import { LabelledInput } from '~/lib/components/labelled-control';
import { ListBox, ListBoxItem } from '~/lib/components/list-box';
import { Select } from '~/lib/components/select';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

export function SelectionValidationDemo() {
	const [formData, setFormData] = createSignal<{
		fruits: string[];
		colors: string[];
		animals: string[];
		cities: string[];
	} | null>(null);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		setFormData({
			fruits: data.getAll('fruits') as string[],
			colors: data.getAll('colors') as string[],
			animals: data.getAll('animals') as string[],
			cities: data.getAll('cities') as string[],
		});
	};

	const handleReset = () => {
		setFormData(null);
	};

	const validateMultiple = (values: Set<string>) => {
		if (values.size < 2) {
			return 'Select at least 2 options';
		}
		if (values.size > 3) {
			return 'Select at most 3 options';
		}
		return null;
	};

	const FormNames = {
		colors: 'colors',
		fruits: 'fruits',
		animals: 'animals',
		cities: 'cities',
	};

	return (
		<Card id="selection-validation-demo">
			<CardHeader>
				<CardTitle>Selection validation</CardTitle>
				<CardDescription>Validation with ListBox and Select components</CardDescription>
			</CardHeader>
			<FormContextProvider>
				<CardContent>
					<div class="o-stack">
						<Form
							onSubmit={handleSubmit}
							names={FormNames}
							{...callbackAttrs(isServer && formOutputWrite)}
						>
							<LabelledInput label="Select Fruits (2-3)" required>
								<ListBox
									name={FormNames.fruits}
									multiple
									onValidate={validateMultiple}
									{...callbackAttrs(isServer && listBoxMinMax('2', '3'))}
								>
									<ListBoxItem value="apple">Apple</ListBoxItem>
									<ListBoxItem value="banana">Banana</ListBoxItem>
									<ListBoxItem value="orange">Orange</ListBoxItem>
									<ListBoxItem value="grape">Grape</ListBoxItem>
									<ListBoxItem value="kiwi">Kiwi</ListBoxItem>
								</ListBox>
							</LabelledInput>

							<LabelledInput label="Select Colors (2-3)" required>
								<Select
									name={FormNames.colors}
									multiple
									onValidate={validateMultiple}
									{...callbackAttrs(isServer && listBoxMinMax('2', '3'))}
								>
									<ListBoxItem value="red">Red</ListBoxItem>
									<ListBoxItem value="blue">Blue</ListBoxItem>
									<ListBoxItem value="green">Green</ListBoxItem>
									<ListBoxItem value="yellow">Yellow</ListBoxItem>
									<ListBoxItem value="purple">Purple</ListBoxItem>
								</Select>
							</LabelledInput>

							<LabelledInput label="Select Animal" required>
								<ListBox name={FormNames.animals}>
									<ListBoxItem value="dog">Dog</ListBoxItem>
									<ListBoxItem value="cat">Cat</ListBoxItem>
									<ListBoxItem value="rabbit">Rabbit</ListBoxItem>
								</ListBox>
							</LabelledInput>

							<LabelledInput label="Select City" required>
								<Select name={FormNames.cities}>
									<ListBoxItem value="boston">Boston</ListBoxItem>
									<ListBoxItem value="new-york">New York</ListBoxItem>
									<ListBoxItem value="san-francisco">San Francisco</ListBoxItem>
								</Select>
							</LabelledInput>
						</Form>

						<Show when={formData()}>
							<output>
								<Card>
									<CardHeader>
										<CardTitle>Submitted form data</CardTitle>
									</CardHeader>
									<CardContent>
										<div class="o-stack">
											<div class="o-label-stack">
												<Label>Selected fruits</Label>
												<BaseDescription>
													{formData()?.fruits.join(', ')}
												</BaseDescription>
											</div>
											<div class="o-label-stack">
												<Label>Selected colors</Label>
												<BaseDescription>
													{formData()?.colors.join(', ')}
												</BaseDescription>
											</div>
											<div class="o-label-stack">
												<Label>Selected animals</Label>
												<BaseDescription>
													{formData()?.animals.join(', ')}
												</BaseDescription>
											</div>
											<div class="o-label-stack">
												<Label>Selected cities</Label>
												<BaseDescription>
													{formData()?.cities.join(', ')}
												</BaseDescription>
											</div>
										</div>
									</CardContent>
								</Card>
							</output>
						</Show>
					</div>
				</CardContent>
				<CardFooter>
					<ResetButton
						{...callbackAttrs(isServer && formOutputClear)}
						onClick={handleReset}
					/>
					<SubmitButton />
				</CardFooter>
			</FormContextProvider>
		</Card>
	);
}
