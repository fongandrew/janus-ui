import { createSignal, createUniqueId, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

import { formOutputClear, formOutputWrite } from '~/demos/callbacks/form-output';
import { matchesPassword, validateUserNameNoSpaces } from '~/demos/callbacks/form-validation-group';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { BaseDescription } from '~/shared/components/description';
import { Form } from '~/shared/components/form';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { FormContextProvider } from '~/shared/components/form-context';
import { FormValidationGroup } from '~/shared/components/form-validation-group';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelledInput } from '~/shared/components/labelled-control';
import { Password } from '~/shared/components/password';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { type Validator } from '~/shared/utility/callback-attrs/validate';

export function FormValidationGroupDemo() {
	const [formData, setFormData] = createSignal<{
		username: string;
		password: string;
	} | null>(null);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		setFormData({
			username: data.get('username') as string,
			password: data.get('password1') as string,
		});
	};

	const handleReset = () => {
		setFormData(null);
	};

	const FormNames = {
		username: 'username',
		password1: 'password1',
		password2: 'password2',
	};

	const validateUserName: Validator<HTMLInputElement> = (event) => {
		const value = event.currentTarget.value;
		if (value.includes(' ')) {
			return 'Username cannot contain spaces';
		}
		return null;
	};

	const password1Id = createUniqueId();
	const matchesPassword1: Validator<HTMLInputElement> = (event) => {
		const value = event.currentTarget.value;
		const input1 = event.currentTarget.ownerDocument.getElementById(password1Id);
		if (!input1) return null;
		if ((input1 as HTMLInputElement).value !== value) {
			return 'Passwords do not match';
		}
		return null;
	};

	return (
		<Card id="form-validation-group-demo">
			<CardHeader>
				<CardTitle>Form validation (inputs)</CardTitle>
				<CardDescription>Password validation with FormValidationGroup</CardDescription>
			</CardHeader>
			<FormContextProvider>
				<CardContent>
					<div class="o-stack">
						<Form
							names={FormNames}
							onSubmit={handleSubmit}
							onReset={handleReset}
							{...callbackAttrs(isServer && formOutputWrite)}
						>
							<LabelledInput label="Username" required>
								<Input
									name={FormNames.username}
									onValidate={validateUserName}
									autocomplete="username"
									{...callbackAttrs(isServer && validateUserNameNoSpaces)}
								/>
							</LabelledInput>

							<FormValidationGroup>
								<div class="o-stack">
									<LabelledInput label="Password" id={password1Id} required>
										<Password
											name={FormNames.password1}
											autocomplete="new-password"
										/>
									</LabelledInput>
									<LabelledInput label="Confirm Password" required>
										<Password
											name={FormNames.password2}
											onValidate={matchesPassword1}
											autocomplete="new-password"
											{...callbackAttrs(matchesPassword(password1Id))}
										/>
									</LabelledInput>
								</div>
							</FormValidationGroup>
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
												<Label>Username</Label>
												<BaseDescription data-testid="output-username">
													{formData()?.username}
												</BaseDescription>
											</div>
											<div class="o-label-stack">
												<Label>Password</Label>
												<BaseDescription data-testid="output-password">
													{formData()?.password}
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
