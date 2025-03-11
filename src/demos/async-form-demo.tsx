import { createSignal, Show } from 'solid-js';

import { type TypedSubmitEvent } from '~/shared/callback-attrs/form';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { BaseDescription } from '~/shared/components/description';
import { Form } from '~/shared/components/form';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { FormContextProvider } from '~/shared/components/form-context';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelledInline, LabelledInput } from '~/shared/components/labelled-control';
import { Textarea } from '~/shared/components/textarea';

export function AsyncFormDemo() {
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
				<CardTitle>Async form</CardTitle>
				<CardDescription>Form with async submission and loading state</CardDescription>
			</CardHeader>
			<FormContextProvider>
				<CardContent>
					<div class="o-stack">
						<Form names={FormNames} onSubmit={handleSubmit}>
							<LabelledInput label="Name">
								<Input name={FormNames.name} autocomplete="none" />
							</LabelledInput>
							<LabelledInput label="Message">
								<Textarea name={FormNames.message} />
							</LabelledInput>
							<LabelledInline label="Force error">
								<Checkbox name={FormNames.shouldError} />
							</LabelledInline>
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
												<Label>Name</Label>
												<BaseDescription>
													{formData()?.name}
												</BaseDescription>
											</div>
											<div class="o-label-stack">
												<Label>Message</Label>
												<BaseDescription>
													{formData()?.message}
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
					<ResetButton />
					<SubmitButton />
				</CardFooter>
			</FormContextProvider>
		</Card>
	);
}
