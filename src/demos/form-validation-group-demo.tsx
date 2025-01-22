import { type Component, createSignal, Show } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { Form } from '~/shared/components/form';
import { type Validator } from '~/shared/components/form-element-control';
import { FormValidationGroup } from '~/shared/components/form-validation-group';
import { Group } from '~/shared/components/group';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledControl } from '~/shared/components/labelled-control';
import { Stack } from '~/shared/components/stack';
import { generateId } from '~/shared/utility/id-generator';

export const FormValidationGroupDemo: Component = () => {
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

	const password1Id = generateId('password');
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
				<CardTitle>Form Validation (Inputs)</CardTitle>
				<CardDescription>Password validation with FormValidationGroup</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Form names={FormNames} onSubmit={handleSubmit} onReset={handleReset}>
						<Stack>
							<LabelledControl label="Username">
								<Input
									name={FormNames.username}
									onValidate={validateUserName}
									autocomplete="username"
									required
								/>
							</LabelledControl>

							<FormValidationGroup>
								<Stack>
									<LabelledControl label="Password">
										<Input
											id={password1Id}
											name={FormNames.password1}
											type="password"
											autocomplete="new-password"
											required
										/>
									</LabelledControl>
									<LabelledControl label="Confirm Password">
										<Input
											name={FormNames.password2}
											type="password"
											onValidate={matchesPassword1}
											autocomplete="new-password"
											required
										/>
									</LabelledControl>
								</Stack>
							</FormValidationGroup>

							<Group>
								<Button type="reset" class="c-button--ghost">
									Reset
								</Button>
								<Button type="submit" class="c-button--primary">
									Submit
								</Button>
							</Group>
						</Stack>
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
											<Label>Username</Label>
											<Description>{formData()?.username}</Description>
										</LabelStack>
										<LabelStack>
											<Label>Password</Label>
											<Description>{formData()?.password}</Description>
										</LabelStack>
									</Stack>
								</CardContent>
							</Card>
						</output>
					</Show>
				</Stack>
			</CardContent>
		</Card>
	);
};
