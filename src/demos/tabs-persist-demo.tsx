import { type Component } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Form } from '~/shared/components/form';
import { Input } from '~/shared/components/input';
import { LabelledInput } from '~/shared/components/labelled-control';
import { Stack } from '~/shared/components/stack';
import { Tab, Tabs } from '~/shared/components/tabs';

export const TabsPersistDemo: Component = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tab Persistence</CardTitle>
				<CardDescription>Persist elements inside tab</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Tabs persist>
						<Tab label="Persist">
							<Form names={{}}>
								<LabelledInput label="Something">
									<Input name="foo" />
								</LabelledInput>
								<LabelledInput label="Something else">
									<Input name="bar" />
								</LabelledInput>
							</Form>
						</Tab>
						<Tab label="Don't Persist" persist={false}>
							<Form names={{}}>
								<LabelledInput label="Hello">
									<Input name="hello" />
								</LabelledInput>
								<LabelledInput label="World">
									<Input name="world" />
								</LabelledInput>
							</Form>
						</Tab>
					</Tabs>
				</Stack>
			</CardContent>
		</Card>
	);
};
