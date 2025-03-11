import { createUniqueId } from 'solid-js';

import { formOutputClear, formOutputWrite } from '~/demos/callbacks/form-output';
import { matchesPassword } from '~/demos/callbacks/form-validation-group-ssr';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Form } from '~/shared/components/form';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { FormContextProvider } from '~/shared/components/form-context';
import { FormValidationGroup } from '~/shared/components/form-validation-group';
import { Input } from '~/shared/components/input';
import { LabelledInput } from '~/shared/components/labelled-control';
import { Password } from '~/shared/components/password';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export function FormValidationGroupSSRDemo() {
	const password1Id = createUniqueId();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Form validation (inputs)</CardTitle>
				<CardDescription>Password validation with FormValidationGroup</CardDescription>
			</CardHeader>
			<FormContextProvider>
				<CardContent>
					<div class="o-stack">
						<Form {...callbackAttrs(formOutputWrite)}>
							<LabelledInput label="Username">
								<Input name="username" autocomplete="username" required />
							</LabelledInput>

							<FormValidationGroup>
								<div class="o-stack">
									<LabelledInput label="Password" id={password1Id}>
										<Password
											name="password1"
											autocomplete="new-password"
											required
										/>
									</LabelledInput>
									<LabelledInput label="Confirm Password">
										<Password
											name="password2"
											autocomplete="new-password"
											required
											{...callbackAttrs(matchesPassword)}
											{...{ [matchesPassword.MATCH_ATTR]: password1Id }}
										/>
									</LabelledInput>
								</div>
							</FormValidationGroup>
						</Form>
					</div>
				</CardContent>
				<CardFooter>
					<ResetButton {...callbackAttrs(formOutputClear)} />
					<SubmitButton />
				</CardFooter>
			</FormContextProvider>
		</Card>
	);
}
