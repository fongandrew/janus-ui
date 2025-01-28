import { type Component } from 'solid-js';

import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { Stack } from '~/shared/components/stack';
import { Tab, Tabs } from '~/shared/components/tabs';

export const TabsDemo: Component = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tabs</CardTitle>
			</CardHeader>
			<CardContent>
				<Stack>
					<Tabs>
						<Tab label="Tab 1">Content of Tab 1</Tab>
						<Tab label="Tab 2">Content of Tab 2</Tab>
						<Tab label="Tab 3">Content of Tab 3</Tab>
					</Tabs>
				</Stack>
			</CardContent>
		</Card>
	);
};
