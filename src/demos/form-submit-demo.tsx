import { createSignal, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

import { formOutputClear } from '~/demos/callbacks/form-output';
import { AsyncFormNames, formAsyncSubmit } from '~/demos/callbacks/form-submit';
import { type TypedSubmitEvent } from '~/lib/components/callbacks/form';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/lib/components/card';
import { Checkbox } from '~/lib/components/checkbox';
import { BaseDescription } from '~/lib/components/description';
import { Form } from '~/lib/components/form';
import { ResetButton, SubmitButton } from '~/lib/components/form-buttons';
import { FormContextProvider } from '~/lib/components/form-context';
import { Input } from '~/lib/components/input';
import { Label } from '~/lib/components/label';
import { LabelledInline, LabelledInput } from '~/lib/components/labelled-control';
import { Textarea } from '~/lib/components/textarea';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

export function FormSubmitDemo() {
	return (
		<>
			<AsyncFormDemo />
			<ServerFormDemo />
		</>
	);
}

function AsyncFormDemo() {
	const [formData, setFormData] = createSignal<{
		name: string;
		message: string;
	} | null>(null);

	const handleSubmit = async (
		e: TypedSubmitEvent<(typeof AsyncFormNames)[keyof typeof AsyncFormNames]>,
	) => {
		e.preventDefault();
		const data = e.data;

		// Artificial delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (data.get(AsyncFormNames.shouldError)) {
			setFormData(null);
			throw new Error('Form submission failed (as requested)');
		}

		if (String(data.get(AsyncFormNames.name)).toLowerCase() === 'bob') {
			return {
				ok: false,
				fieldErrors: {
					name: 'We already have a Bob',
				},
			};
		}

		setFormData({
			name: data.get(AsyncFormNames.name) as string,
			message: data.get(AsyncFormNames.message) as string,
		});
	};

	return (
		<Card id="form-submit-demo">
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
							data-testid="async-form"
							{...callbackAttrs(isServer && formAsyncSubmit)}
						>
							<LabelledInput label="Name" required>
								<Input
									name={AsyncFormNames.name}
									autocomplete="none"
									data-testid="name-input"
								/>
							</LabelledInput>
							<LabelledInput label="Message" required>
								<Textarea
									name={AsyncFormNames.message}
									data-testid="message-textarea"
								/>
							</LabelledInput>
							<LabelledInline label="Force error">
								<Checkbox
									name={AsyncFormNames.shouldError}
									data-testid="error-checkbox"
								/>
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
												<BaseDescription data-testid="submitted-name">
													{formData()?.name}
												</BaseDescription>
											</div>
											<div class="o-label-stack">
												<Label>Message</Label>
												<BaseDescription data-testid="submitted-message">
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
					<ResetButton
						{...callbackAttrs(isServer && formOutputClear)}
						data-testid="reset-button"
					/>
					<SubmitButton data-testid="submit-button" />
				</CardFooter>
			</FormContextProvider>
		</Card>
	);
}

function ServerFormDemo() {
	const FormNames = {
		q: 'q',
	};

	return (
		<Card id="server-form-demo">
			<CardHeader>
				<CardTitle>Form Submit</CardTitle>
				<CardDescription>Traditional form that submits to a server</CardDescription>
			</CardHeader>
			<FormContextProvider action="https://developer.mozilla.org/en-US/search">
				<CardContent>
					<div class="o-stack">
						<Form names={FormNames} data-testid="server-form">
							<LabelledInput label="Search query" required>
								<Input
									type="search"
									name={FormNames.q}
									data-testid="search-input"
								/>
							</LabelledInput>
						</Form>
					</div>
				</CardContent>
				<CardFooter>
					<ResetButton
						{...callbackAttrs(isServer && formOutputClear)}
						data-testid="server-reset-button"
					/>
					<SubmitButton data-testid="server-submit-button" />
				</CardFooter>
			</FormContextProvider>
		</Card>
	);
}
