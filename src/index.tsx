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
import { createTooltip } from '~/shared/components/create-tooltip';
import { Grid } from '~/shared/components/grid';
import { Group } from '~/shared/components/group';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { createDropdown, Menu, MenuGroup, MenuItem } from '~/shared/components/menu';
import { Radio } from '~/shared/components/radio';
import { RadioGroup } from '~/shared/components/radio-group';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';
import { Tooltip } from '~/shared/components/tooltip';

const MenuDemo: Component = () => {
	const [selection, setSelection] = createSignal<string | null>(null);
	const [simpleTrigger, simpleMenu] = createDropdown();
	const [groupsTrigger, groupsMenu] = createDropdown();
	const handleSelect = (_event: Event, value: string) => {
		setSelection(value);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Menu</CardTitle>
				<CardDescription>Dropdown menu with groups and items</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack class="gap-xs">
					<p>Selected: {selection() ?? 'None'}</p>
					<Group>
						<Button ref={simpleTrigger}>Simple Menu</Button>
						<Menu ref={simpleMenu} onSelect={handleSelect}>
							<MenuItem value="a">Option A</MenuItem>
							<MenuItem value="b">Option B</MenuItem>
							<MenuItem value="c">Option C</MenuItem>
						</Menu>

						<Button ref={groupsTrigger}>Menu with Groups</Button>
						<Menu ref={groupsMenu} onSelect={handleSelect}>
							<MenuGroup heading="File">
								<MenuItem value="new">New File</MenuItem>
								<MenuItem value="open">Open...</MenuItem>
								<MenuItem value="save">Save</MenuItem>
							</MenuGroup>
							<MenuGroup heading="Edit">
								<MenuItem value="cut">Cut</MenuItem>
								<MenuItem value="copy">Copy</MenuItem>
								<MenuItem value="paste">Paste</MenuItem>
							</MenuGroup>
							<MenuGroup>
								<MenuItem role="menuitemcheckbox" value="sidebar">
									Show Sidebar
								</MenuItem>
								<MenuItem role="menuitemcheckbox" value="status">
									Show Status Bar
								</MenuItem>
							</MenuGroup>
							<MenuGroup>
								<MenuItem href="https://example.com">Link to Site</MenuItem>
							</MenuGroup>
						</Menu>
					</Group>
				</Stack>
			</CardContent>
		</Card>
	);
};

const RadioGroupDemo: Component = () => {
	const [value, setValue] = createSignal('checked');

	return (
		<Card>
			<CardHeader>
				<CardTitle>Radio Buttons</CardTitle>
				<CardDescription>Different radio states and variations</CardDescription>
			</CardHeader>
			<CardContent>
				<RadioGroup
					name="demo"
					value={value()}
					onChange={(event) => setValue(event.target.value)}
				>
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
			</CardContent>
		</Card>
	);
};

const TooltipDemo: Component = () => {
	const [topTrigger, topTooltip] = createTooltip('top');
	const [bottomTrigger, bottomTooltip] = createTooltip('bottom');
	const [leftTrigger, leftTooltip] = createTooltip('left');
	const [rightTrigger, rightTooltip] = createTooltip('right');
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tooltips</CardTitle>
				<CardDescription>Tooltips on hover</CardDescription>
			</CardHeader>
			<CardContent>
				<Grid class="gap-sm">
					<Button ref={topTrigger}>Top</Button>
					<Tooltip ref={topTooltip}>Hello, I'm a tooltip</Tooltip>
					<Button ref={bottomTrigger}>Bottom</Button>
					<Tooltip ref={bottomTooltip}>Hello, I'm a tooltip</Tooltip>
					<Button ref={leftTrigger}>Left</Button>
					<Tooltip ref={leftTooltip}>Hello, I'm a tooltip</Tooltip>
					<Button ref={rightTrigger}>Right</Button>
					<Tooltip ref={rightTooltip}>Hello, I'm a tooltip</Tooltip>
				</Grid>
			</CardContent>
		</Card>
	);
};

const ButtonsCard: Component = () => (
	<Card class="col-span-full">
		<CardHeader>
			<CardTitle>Buttons</CardTitle>
			<CardDescription>Different variations on your standard button</CardDescription>
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
);

const CheckboxesCard: Component = () => (
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
);

const InputsCard: Component = () => (
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
);

const TextareasCard: Component = () => (
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
);

const FooterCard: Component = () => (
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
);

const App: Component = () => {
	return (
		<Box>
			<Grid>
				<ButtonsCard />
				<MenuDemo />
				<CheckboxesCard />
				<RadioGroupDemo />
				<TooltipDemo />
				<InputsCard />
				<TextareasCard />
				<FooterCard />
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
