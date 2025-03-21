import { isServer } from 'solid-js/web';

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
import { Tab, Tabs } from '~/shared/components/tabs';

function BaseDemo() {
	return (
		<Card id="tabs-demo">
			<CardHeader>
				<CardTitle>Tabs</CardTitle>
				<CardDescription>Basic tabbed content</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<div>
						<Tabs>
							<Tab label="Tab 1">
								<div class="o-text-box">These tabs switch automatically.</div>
							</Tab>
							<Tab label="Tab 2">
								<div class="o-text-box">Content of Tab 2</div>
							</Tab>
							<Tab label="Tab 3">
								<div class="o-text-box">Content of Tab 3</div>
							</Tab>
						</Tabs>
					</div>

					<Card>
						<Tabs auto={false}>
							<Tab label="Tab with a very long long long long name">
								<div class="o-text-box">These tabs require manual activation.</div>
							</Tab>
							<Tab label="Short tab">
								<div class="o-text-box">Content of Tab 2</div>
							</Tab>
							<Tab label="Another tab with a fairly long name">
								<div class="o-text-box">Content of Tab 3</div>
							</Tab>
						</Tabs>
					</Card>
				</div>
			</CardContent>
		</Card>
	);
}

function PersistenceDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tab Persistence</CardTitle>
				<CardDescription>Persist elements inside tab</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
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
				</div>
			</CardContent>
		</Card>
	);
}

export function TabsDemo() {
	return (
		<>
			<BaseDemo />
			{!isServer && <PersistenceDemo />}
		</>
	);
}
