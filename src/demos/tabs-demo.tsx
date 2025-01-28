import { type Component } from 'solid-js';

import { TextBox } from '~/shared/components/box';
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
					<div>
						<Tabs>
							<Tab label="Tab 1">
								<TextBox>Content of Tab 1</TextBox>
							</Tab>
							<Tab label="Tab 2">
								<TextBox>Content of Tab 2</TextBox>
							</Tab>
							<Tab label="Tab 3">
								<TextBox>Content of Tab 3</TextBox>
							</Tab>
						</Tabs>
					</div>

					<Card>
						<Tabs>
							<Tab label="Tab with a very long long long long name">
								<TextBox>Content of Tab 1</TextBox>
							</Tab>
							<Tab label="Short tab">
								<TextBox>Content of Tab 2</TextBox>
							</Tab>
							<Tab label="Another tab with a fairly long name">
								<TextBox>Content of Tab 3</TextBox>
							</Tab>
						</Tabs>
					</Card>
				</Stack>
			</CardContent>
		</Card>
	);
};
