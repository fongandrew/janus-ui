import { type Component } from 'solid-js';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Stack } from '~/shared/components/stack';
import { Tab, Tabs } from '~/shared/components/tabs';

export const TabsDemo: Component = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tabs</CardTitle>
				<CardDescription>Basic tabbed content</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Tabs>
						<Tab label="Tab 1" class="c-text-box">
							Content of Tab 1
						</Tab>
						<Tab label="Tab 2" class="c-text-box">
							Content of Tab 2
						</Tab>
						<Tab label="Tab 3" class="c-text-box">
							Content of Tab 3
						</Tab>
					</Tabs>
				</Stack>
			</CardContent>
		</Card>
	);
};
