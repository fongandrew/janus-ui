import { isServer } from 'solid-js/web';

import { formOutputClear } from '~/demos/callbacks/form-output';
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
import { Input } from '~/shared/components/input';
import { LabelledInput } from '~/shared/components/labelled-control';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export function FormSubmitDemo() {
	const FormNames = {
		q: 'q',
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Form Submit</CardTitle>
				<CardDescription>Traditional form that submits to a server</CardDescription>
			</CardHeader>
			<FormContextProvider action="https://developer.mozilla.org/en-US/search">
				<CardContent>
					<div class="o-stack">
						<Form names={FormNames}>
							<LabelledInput label="Search query">
								<Input type="search" name={FormNames.q} required />
							</LabelledInput>
						</Form>
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
