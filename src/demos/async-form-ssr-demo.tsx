import { AsyncFormSSRNames, asyncFormSSRSubmit } from '~/demos/callbacks/async-form-ssr';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { Form } from '~/shared/components/form';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { FormContextProvider } from '~/shared/components/form-context';
import { Input } from '~/shared/components/input';
import { LabelledInline, LabelledInput } from '~/shared/components/labelled-control';
import { Textarea } from '~/shared/components/textarea';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export function AsyncFormSSRDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Async form</CardTitle>
				<CardDescription>Form with async submission and loading state</CardDescription>
			</CardHeader>
			<FormContextProvider>
				<CardContent>
					<div class="o-stack">
						<Form names={AsyncFormSSRNames} {...callbackAttrs(asyncFormSSRSubmit)}>
							<LabelledInput label="Name">
								<Input
									name={AsyncFormSSRNames.name}
									autocomplete="none"
									placeholder="Submit 'Bob' to test error"
								/>
							</LabelledInput>
							<LabelledInput label="Message">
								<Textarea name={AsyncFormSSRNames.message} />
							</LabelledInput>
							<LabelledInline label="Force error">
								<Checkbox name={AsyncFormSSRNames.shouldError} />
							</LabelledInline>
						</Form>
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
