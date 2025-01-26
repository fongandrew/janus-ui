import { type Component, createSignal, Show } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { Description } from '~/shared/components/description';
import { Form, type TypedSubmitEvent } from '~/shared/components/form';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledInline, LabelledInput } from '~/shared/components/labelled-control';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';

export const AsyncFormDemo: Component = () => {
	enum FormNames {
		name = 'name',
		message = 'message',
		shouldError = 'shouldError',
	}

	const [formData, setFormData] = createSignal<{
		name: string;
		message: string;
	} | null>(null);

	const handleSubmit = async (e: TypedSubmitEvent<FormNames>) => {
		e.preventDefault();

		// Artificial delay
		await new Promise((resolve) => setTimeout(resolve, 3000));

		if (e.data.get(FormNames.shouldError)) {
			setFormData(null);
			throw new Error('Form submission failed (as requested)');
		}

		setFormData({
			name: e.data.get(FormNames.name) as string,
			message: e.data.get(FormNames.message) as string,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Async Form</CardTitle>
				<CardDescription>Form with async submission and loading state</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Form names={FormNames} onSubmit={handleSubmit}>
						<LabelledInput label="Name">
							<Input name={FormNames.name} autocomplete="none" />
						</LabelledInput>
						<LabelledInput label="Message">
							<Textarea name={FormNames.message} />
						</LabelledInput>
						<LabelledInline label="Force Error">
							<Checkbox name={FormNames.shouldError} />
						</LabelledInline>
					</Form>

					<Show when={formData()}>
						<output>
							<Card>
								<CardHeader>
									<CardTitle>Submitted Form Data</CardTitle>
								</CardHeader>
								<CardContent>
									<Stack>
										<LabelStack>
											<Label>Name</Label>
											<Description>{formData()?.name}</Description>
										</LabelStack>
										<LabelStack>
											<Label>Message</Label>
											<Description>{formData()?.message}</Description>
										</LabelStack>
									</Stack>
								</CardContent>
							</Card>
						</output>
					</Show>
				</Stack>
			</CardContent>
			<CardFooter>
				<ResetButton />
				<SubmitButton />
			</CardFooter>
		</Card>
	);
};
