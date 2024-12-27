import '~/shared/style/tailwind.css';

import { Settings } from 'lucide-solid';
import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
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
import { createDropdown } from '~/shared/components/create-dropdown';
import { createTooltip } from '~/shared/components/create-tooltip';
import { Grid } from '~/shared/components/grid';
import { Group } from '~/shared/components/group';
import { Input, InputDate, InputTime } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { ListBox, ListBoxGroup, ListBoxItem } from '~/shared/components/list-box';
import { Menu, MenuGroup, MenuItem, MenuItemLink } from '~/shared/components/menu';
import { Modal, ModalContent, ModalTitle } from '~/shared/components/modal';
import { Radio } from '~/shared/components/radio';
import { RadioGroup } from '~/shared/components/radio-group';
import { Select } from '~/shared/components/select';
import { SelectTypeahead } from '~/shared/components/select-typeahead';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';
import { ToggleSwitch } from '~/shared/components/toggle-switch';
import { Tooltip } from '~/shared/components/tooltip';

const ListBoxDemo: Component = () => {
	const [values, setValues] = createSignal<Set<string>>(new Set());
	const [multiValues, setMultiValues] = createSignal<Set<string>>(new Set());

	return (
		<Card>
			<CardHeader>
				<CardTitle>List Box</CardTitle>
				<CardDescription>Single and multiple selection list boxes</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Single Selection</Label>
						<p>Selected: {Array.from(values()).join(', ') || 'None'}</p>
						<ListBox
							name="single-listbox"
							values={values()}
							onChange={(_e, values) => setValues(values)}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</ListBox>
					</LabelStack>

					<LabelStack>
						<Label>Multiple Selection</Label>
						<p>Selected: {Array.from(multiValues()).join(', ') || 'None'}</p>
						<ListBox
							name="multi-listbox"
							values={multiValues()}
							onChange={(_e, values) => setMultiValues(values)}
							multiple
							aria-invalid={multiValues().has('red')}
						>
							<ListBoxGroup heading="Don't Pick These">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<ListBoxGroup>
								<ListBoxItem value="green">Green</ListBoxItem>
								<ListBoxItem value="blue">Blue</ListBoxItem>
							</ListBoxGroup>
						</ListBox>
					</LabelStack>

					<LabelStack>
						<Label>Disabled Selection</Label>
						<ListBox disabled name="disabled-listbox" values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</ListBox>
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
};

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
								<MenuItemLink href="https://example.com">Link to Site</MenuItemLink>
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
							<Radio value="default" /> Default radio
						</Label>
						<Label>
							<Radio value="checked" /> Checked radio
						</Label>
						<Label>
							<Radio value="error" aria-invalid /> Error state radio
						</Label>
						<Label>
							<Radio value="disabled" disabled /> Disabled radio
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
				<Group>
					<Button class="c-button--sm">
						<Settings /> Small Button
					</Button>

					<Button>
						<Settings /> Default Button
					</Button>

					<Button class="c-button--lg">
						<Settings /> Large Button
					</Button>
				</Group>
				<Group>
					<Button class="c-button--primary">Primary</Button>
					<Button class="c-button--danger">Danger</Button>
					<Button disabled>Disabled</Button>
					<Button class="c-button--ghost">Ghost</Button>
					<Button class="c-button--link">Link</Button>
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
					<Checkbox /> Default checkbox
				</Label>
				<Label>
					<Checkbox checked /> Checked checkbox
				</Label>
				<Label>
					<Checkbox indeterminate /> Indeterminate checkbox
				</Label>
				<Label>
					<Checkbox aria-invalid /> Error state checkbox
				</Label>
				<Label>
					<Checkbox disabled /> Disabled checkbox
				</Label>
				<Label>
					Toggle switch <ToggleSwitch />
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
				<LabelStack>
					<Label>Date Input</Label>
					<InputDate placeholder="Pick a date" value="2024-12-25" />
				</LabelStack>
				<LabelStack>
					<Label>Time Input</Label>
					<InputTime placeholder="Pick a time" value="13:15" />
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
			<Button class="c-button--ghost">Skip</Button>
			<Button class="c-button--primary">Continue</Button>
		</CardFooter>
	</Card>
);

const SelectDemo: Component = () => {
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [multiValue, setMultiValue] = createSignal<Set<string>>(new Set());

	return (
		<Card>
			<CardHeader>
				<CardTitle>Select</CardTitle>
				<CardDescription>
					Dropdown select with single and multiple selection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Single Selection</Label>
						<p>Selected: {Array.from(value()).join(', ') || 'None'}</p>
						<Select
							placeholder="Select a fruit..."
							values={value()}
							onChange={(_e, values) => setValue(values)}
						>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</Select>
					</LabelStack>

					<LabelStack>
						<Label>Multiple Selection</Label>
						<p>Selected: {Array.from(multiValue()).join(', ') || 'None'}</p>
						<Select
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onChange={(_e, values) => setMultiValue(values)}
							multiple
						>
							<ListBoxGroup heading="Don't Pick These">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<ListBoxGroup>
								<ListBoxItem value="green">Green</ListBoxItem>
								<ListBoxItem value="blue">Blue</ListBoxItem>
							</ListBoxGroup>
						</Select>
					</LabelStack>

					<LabelStack>
						<Label>Disabled Selection</Label>
						<Select disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</Select>
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
};

const SelectTypeaheadDemo: Component = () => {
	// Value selection
	const [value, setValue] = createSignal<Set<string>>(new Set());
	const [multiValue, setMultiValue] = createSignal<Set<string>>(new Set());

	// Create values from typeaheads
	const [query, setQuery] = createSignal('');
	const parts = createMemo(() =>
		query()
			.split(/\s+/)
			.map((word) => word.trim())
			.filter((word) => word.length > 0),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Typeahead</CardTitle>
				<CardDescription>Search input with single and multiple selection</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Single Selection</Label>
						<p>Selected: {Array.from(value()).join(', ') || 'None'}</p>
						<SelectTypeahead
							placeholder="Select a fruit..."
							values={value()}
							onChange={(_e, values) => setValue(values)}
							onInput={(_e, value) => setQuery(value)}
						>
							<For each={parts()}>
								{(part) => <ListBoxItem value={part}>{part}</ListBoxItem>}
							</For>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Multiple Selection</Label>
						<p>Selected: {Array.from(multiValue()).join(', ') || 'None'}</p>
						<SelectTypeahead
							aria-invalid={multiValue().has('red')}
							placeholder="Select colors..."
							values={multiValue()}
							onChange={(_e, values) => setMultiValue(values)}
							onInput={(_e, value) => setQuery(value)}
							multiple
						>
							<ListBoxGroup heading="Don't Pick This">
								<ListBoxItem value="red">Red</ListBoxItem>
							</ListBoxGroup>
							<Show when={parts().length > 0}>
								<ListBoxGroup>
									<For each={parts()}>
										{(part) => <ListBoxItem value={part}>{part}</ListBoxItem>}
									</For>
								</ListBoxGroup>
							</Show>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Disabled Selection</Label>
						<SelectTypeahead disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Select With No Matches</Label>
						<SelectTypeahead placeholder="Won't match" />
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
};

const ModalDemo: Component = () => {
	const [isOpen, setIsOpen] = createSignal(false);

	const [isOpenLong, setIsOpenLong] = createSignal(false);
	const manyParagraphs = [];
	for (let i = 0; i < 20; i++) {
		manyParagraphs.push(
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu porttitor
				leo. Vestibulum in gravida felis. Nulla eleifend vel massa in vestibulum. Curabitur
				nisl ex, venenatis ut tempus nec, rhoncus pretium neque. Nullam dictum, ligula ut
				faucibus efficitur, lacus elit lobortis ante, eget volutpat ex felis vitae dolor.
				Maecenas enim sapien, bibendum a porttitor cursus, pharetra eget sem. Nulla sed
				tincidunt ligula. Maecenas in libero eget ligula tincidunt fermentum. Nunc arcu
				nulla, congue sit amet ultricies ac, scelerisque eget enim. Sed id neque sem.
			</p>,
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Modal</CardTitle>
				<CardDescription>Modal dialog with backdrop</CardDescription>
			</CardHeader>
			<CardContent>
				<Group>
					<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
					<Modal open={isOpen()} onClose={() => setIsOpen(false)}>
						<ModalTitle>Example Modal</ModalTitle>
						<ModalContent>
							<p>Click outside or the close button to dismiss</p>
						</ModalContent>
					</Modal>

					<Button onClick={() => setIsOpenLong(true)}>Open Modal (Long)</Button>
					<Modal open={isOpenLong()} onClose={() => setIsOpenLong(false)}>
						<ModalTitle>Example Modal</ModalTitle>
						<ModalContent>{manyParagraphs}</ModalContent>
					</Modal>
				</Group>
			</CardContent>
		</Card>
	);
};

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
				<ListBoxDemo />
				<SelectDemo />
				<SelectTypeaheadDemo />
				<ModalDemo />
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
