import '~/shared/style/tailwind.css';

import { Settings } from 'lucide-solid';
import { type Component, createSignal } from 'solid-js';
import { render } from 'solid-js/web';

import { Box } from '~/shared/components/box';
import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { Grid } from '~/shared/components/grid';
import { Group } from '~/shared/components/group';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { Radio } from '~/shared/components/radio';
import { RadioGroup } from '~/shared/components/radio-group';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';

const RadioGroupDemo: Component = () => {
	const [value, setValue] = createSignal('checked');
	return (
		<RadioGroup name="demo" value={value()} onChange={(event) => setValue(event.target.value)}>
			<Stack>
				<Label>Selected: {value()}</Label>
				<Label>
					<Radio value="default" /> Default Radio
				</Label>
				<Label>
					<Radio value="checked" /> Checked Radio
				</Label>
				<Label>
					<Radio value="error" aria-invalid /> Error State Radio
				</Label>
				<Label>
					<Radio value="disabled" disabled /> Disabled Radio
				</Label>
			</Stack>
		</RadioGroup>
	);
};

const App: Component = () => {
	return (
		<Box>
			<Grid>
				<Card class="col-span-full">
					<CardHeader>
						<CardTitle>Buttons</CardTitle>
						<CardDescription>
							Different variations on your standard button
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Stack>
							<Group class="flex-wrap">
								<Button class="c-btn--sm">
									<Settings /> Small Button
								</Button>

								<Button>
									<Settings /> Default Button
								</Button>

								<Button class="c-btn--lg">
									<Settings /> Large Button
								</Button>
							</Group>
							<Group>
								<Button class="c-btn--primary">Primary</Button>
								<Button class="c-btn--danger">Danger</Button>
								<Button disabled>Disabled</Button>
								<Button class="c-btn--ghost">Ghost</Button>
								<Button class="c-btn--link">Link</Button>
							</Group>
						</Stack>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Checkboxes</CardTitle>
						<CardDescription>Different checkbox states and variations</CardDescription>
					</CardHeader>
					<CardContent>
						<Stack>
							<Label>
								<Checkbox /> Default Checkbox
							</Label>
							<Label>
								<Checkbox checked /> Checked Checkbox
							</Label>
							<Label>
								<Checkbox indeterminate /> Indeterminate Checkbox
							</Label>
							<Label>
								<Checkbox aria-invalid /> Error State Checkbox
							</Label>
							<Label>
								<Checkbox disabled /> Disabled Checkbox
							</Label>
						</Stack>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Radio Buttons</CardTitle>
						<CardDescription>Different radio states and variations</CardDescription>
					</CardHeader>
					<CardContent>
						<RadioGroupDemo />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Inputs</CardTitle>
						<CardDescription>Text input fields in different states</CardDescription>
					</CardHeader>
					<CardContent>
						<Stack>
							<LabelStack>
								<Label>Default Input</Label>
								<Input placeholder="Placeholder content" />
							</LabelStack>
							<LabelStack>
								<Label>Error State Input</Label>
								<Input aria-invalid="true" placeholder="Some wrong value" />
							</LabelStack>
							<LabelStack>
								<Label>Disabled Input</Label>
								<Input disabled placeholder="Can't touch this" />
							</LabelStack>
						</Stack>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Text areas</CardTitle>
						<CardDescription>Larger input areas</CardDescription>
					</CardHeader>
					<CardContent>
						<Stack>
							<Textarea placeholder="Default (medium) textarea" />
							<Textarea aria-invalid placeholder="Error state textarea" />
							<Textarea disabled placeholder="Disabled textarea" />
						</Stack>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Card with a footer</CardTitle>
						<CardDescription>A card to show footer + grid in action</CardDescription>
					</CardHeader>
					<CardContent>
						<p>The grid will adjust columns based on screen size.</p>
					</CardContent>
					<CardFooter>
						<Button class="c-btn--ghost">Skip</Button>
						<Button class="c-btn--primary">Continue</Button>
					</CardFooter>
				</Card>
			</Grid>
		</Box>
	);
};

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
	);
}

render(() => <App />, root!);
