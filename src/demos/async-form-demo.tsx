import { createSignal, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

import { AsyncFormNames, asyncFormSubmit } from '~/demos/callbacks/async-form';
import { formOutputClear } from '~/demos/callbacks/form-output';
import { type TypedSubmitEvent } from '~/shared/components/callbacks/form';
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
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export function AsyncFormDemo() {
	const [formData, setFormData] = createSignal<{
		name: string;
		message: string;
	} | null>(null);

	const handleSubmit = async (
		e: TypedSubmitEvent<(typeof AsyncFormNames)[keyof typeof AsyncFormNames]>,
	) => {
		e.preventDefault();

		// Artificial delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (e.data.get(AsyncFormNames.shouldError)) {
			setFormData(null);
			throw new Error('Form submission failed (as requested)');
		}

		setFormData({
			name: e.data.get(AsyncFormNames.name) as string,
			message: e.data.get(AsyncFormNames.message) as string,
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
						<Form
							names={AsyncFormNames}
							onSubmit={handleSubmit}
							{...callbackAttrs(isServer && asyncFormSubmit)}
						>
							<LabelledInput label="Name">
								<Input name={AsyncFormNames.name} autocomplete="none" />
							</LabelledInput>
							<LabelledInput label="Message">
								<Textarea name={AsyncFormNames.message} />
							</LabelledInput>
							<LabelledInline label="Force error">
								<Checkbox name={AsyncFormNames.shouldError} />
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
					<ResetButton {...callbackAttrs(isServer && formOutputClear)} />
					<SubmitButton />
				</CardFooter>
			</FormContextProvider>
		</Card>
	);
}
