import { isServer } from 'solid-js/web';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { Form } from '~/lib/components/form';
import { Input } from '~/lib/components/input';
import { LabelledInput } from '~/lib/components/labelled-control';
import { Tab, Tabs } from '~/lib/components/tabs';

function BaseDemo() {
	return (
		<Card id="tabs-demo">
			<CardHeader>
				<CardTitle>Tabs</CardTitle>
				<CardDescription>Basic tabbed content</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<div data-testid="auto-tabs">
						<Tabs>
							<Tab label="Tab 1">
								<div class="o-text-box" data-testid="tab1-content">
									These tabs switch automatically.
								</div>
							</Tab>
							<Tab label="Tab 2">
								<div class="o-text-box" data-testid="tab2-content">
									Content of Tab 2
								</div>
							</Tab>
							<Tab label="Tab 3">
								<div class="o-text-box" data-testid="tab3-content">
									Content of Tab 3
								</div>
							</Tab>
						</Tabs>
					</div>

					<Card data-testid="manual-tabs">
						<Tabs auto={false}>
							<Tab label="Tab with a very long long long long name">
								<div class="o-text-box" data-testid="manual-tab1-content">
									These tabs require manual activation.
								</div>
							</Tab>
							<Tab label="Short tab">
								<div class="o-text-box" data-testid="manual-tab2-content">
									Content of Tab 2
								</div>
							</Tab>
							<Tab label="Another tab with a fairly long name">
								<div class="o-text-box" data-testid="manual-tab3-content">
									Content of Tab 3
								</div>
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
		<Card id="tabs-persistence-demo">
			<CardHeader>
				<CardTitle>Tab Persistence</CardTitle>
				<CardDescription>Persist elements inside tab</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<Tabs persist data-testid="persistence-tabs">
						<Tab label="Persist">
							<Form names={{}}>
								<LabelledInput label="Something">
									<Input name="foo" data-testid="persist-input-1" />
								</LabelledInput>
								<LabelledInput label="Something else">
									<Input name="bar" data-testid="persist-input-2" />
								</LabelledInput>
							</Form>
						</Tab>
						<Tab label="Don't Persist" persist={false}>
							<Form names={{}}>
								<LabelledInput label="Hello">
									<Input name="hello" data-testid="non-persist-input-1" />
								</LabelledInput>
								<LabelledInput label="World">
									<Input name="world" data-testid="non-persist-input-2" />
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
