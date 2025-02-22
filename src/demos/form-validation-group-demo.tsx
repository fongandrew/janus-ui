import { createSignal, createUniqueId, Show } from 'solid-js';

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
import { type Validator } from '~/shared/components/form-element-control';
import { FormValidationGroup } from '~/shared/components/form-validation-group';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelledInput } from '~/shared/components/labelled-control';
import { Password } from '~/shared/components/password';

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
			password: data.get('password') as string,
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

	const validateUserName: Validator<HTMLInputElement> = (value) => {
		if (value.includes(' ')) {
			return 'Username cannot contain spaces';
		}
		return null;
	};

	const password1Id = createUniqueId();
	const matchesPassword1: Validator<HTMLInputElement> = (value, event) => {
		const input = event.delegateTarget.ownerDocument.getElementById(password1Id);
		if (!input) return null;
		if ((input as HTMLInputElement).value !== value) {
			return 'Passwords do not match';
		}
		return null;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Form validation (inputs)</CardTitle>
				<CardDescription>Password validation with FormValidationGroup</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<Form names={FormNames} onSubmit={handleSubmit} onReset={handleReset}>
						<LabelledInput label="Username">
							<Input
								name={FormNames.username}
								onValidate={validateUserName}
								autocomplete="username"
								required
							/>
						</LabelledInput>

						<FormValidationGroup>
							<div class="o-stack">
								<LabelledInput label="Password">
									<Password
										id={password1Id}
										name={FormNames.password1}
										autocomplete="new-password"
										required
									/>
								</LabelledInput>
								<LabelledInput label="Confirm Password">
									<Password
										name={FormNames.password2}
										onValidate={matchesPassword1}
										autocomplete="new-password"
										required
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
											<Description>{formData()?.username}</Description>
										</div>
										<div class="o-label-stack">
											<Label>Password</Label>
											<Description>{formData()?.password}</Description>
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
		</Card>
	);
}
