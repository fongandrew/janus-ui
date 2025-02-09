import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Stack } from '~/shared/components/stack';
import { Tab, Tabs } from '~/shared/components/tabs';

export function TabsDemo() {
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
								<div class="o-text-box">Content of Tab 1</div>
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
						<Tabs>
							<Tab label="Tab with a very long long long long name">
								<div class="o-text-box">Content of Tab 1</div>
							</Tab>
							<Tab label="Short tab">
								<div class="o-text-box">Content of Tab 2</div>
							</Tab>
							<Tab label="Another tab with a fairly long name">
								<div class="o-text-box">Content of Tab 3</div>
							</Tab>
						</Tabs>
					</Card>
				</Stack>
			</CardContent>
		</Card>
	);
}
