import '~/shared/style/tailwind.css';

import { Ellipsis, Settings } from 'lucide-solid';
import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { render } from 'solid-js/web';

import { Box } from '~/shared/components/box';
import { Button, IconButton } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { Description } from '~/shared/components/description';
import { Dropdown } from '~/shared/components/dropdown';
import { ErrorMessage } from '~/shared/components/error-message';
import { Form, type TypedFormData } from '~/shared/components/form';
import { type Validator } from '~/shared/components/form-element-control';
import { FormValidationGroup } from '~/shared/components/form-validation-group';
import { Grid } from '~/shared/components/grid';
import { Group } from '~/shared/components/group';
import { Input, InputDate, InputTime } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledControl } from '~/shared/components/labelled-control';
import { ListBox, ListBoxGroup, ListBoxItem } from '~/shared/components/list-box';
import { Menu, MenuGroup, MenuItem, MenuItemLink } from '~/shared/components/menu';
import { Modal, ModalContent, ModalFooter, ModalTitle } from '~/shared/components/modal';
import {
	ModalCancelButton,
	ModalFormContent,
	ModalSubmitButton,
} from '~/shared/components/modal-form';
import { Radio } from '~/shared/components/radio';
import { RadioGroup } from '~/shared/components/radio-group';
import { Select } from '~/shared/components/select';
import { SelectTypeahead } from '~/shared/components/select-typeahead';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';
import { ToggleSwitch } from '~/shared/components/toggle-switch';
import { Tooltip } from '~/shared/components/tooltip';
import { generateId } from '~/shared/utility/id-generator';

const FormValidationDemo: Component = () => {
	const [formData, setFormData] = createSignal<{
		username: string;
		password: string;
	} | null>(null);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		setFormData({
			username: data.get('username') as string,
			password: data.get('password') as string,
		});
	};

	const handleReset = () => {
		setFormData(null);
	};

	const FormNames = {
		username: 'username',
		password1: 'password1',
		password2: 'password2',
	};

	const validateUserName: Validator<HTMLInputElement> = (e, setError) => {
		if (e.delegateTarget.value?.includes(' ')) {
			return setError('Username cannot contain spaces');
		}
	};

	const password1Id = generateId('password');
	const matchesPassword1: Validator<HTMLInputElement> = (e, setError) => {
		const input = e.delegateTarget.ownerDocument.getElementById(password1Id);
		if (!input) return;
		if ((input as HTMLInputElement).value !== e.delegateTarget.value) {
			return setError('Passwords do not match');
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Form Validation</CardTitle>
				<CardDescription>Password validation with FormValidationGroup</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Form names={FormNames} onSubmit={handleSubmit} onReset={handleReset}>
						<Stack>
							<LabelledControl label="Username">
								<Input
									name={FormNames.username}
									onValidate={validateUserName}
									autocomplete="username"
									required
								/>
							</LabelledControl>

							<FormValidationGroup>
								<Stack>
									<LabelledControl label="Password">
										<Input
											id={password1Id}
											name={FormNames.password1}
											type="password"
											autocomplete="new-password"
											required
										/>
									</LabelledControl>
									<LabelledControl label="Confirm Password">
										<Input
											name={FormNames.password2}
											type="password"
											onValidate={matchesPassword1}
											autocomplete="new-password"
											required
										/>
									</LabelledControl>
								</Stack>
							</FormValidationGroup>

							<Group>
								<Button type="reset" class="c-button--ghost">
									Reset
								</Button>
								<Button type="submit" class="c-button--primary">
									Submit
								</Button>
							</Group>
						</Stack>
					</Form>

					<Show when={formData()}>
						<output>
							<Card>
								<CardHeader>
									<CardTitle>Submitted Form Data</CardTitle>
								</CardHeader>
								<CardContent>
									<Stack>
										<LabelStack>
											<Label>Username</Label>
											<Description>{formData()?.username}</Description>
										</LabelStack>
										<LabelStack>
											<Label>Password</Label>
											<Description>{formData()?.password}</Description>
										</LabelStack>
									</Stack>
								</CardContent>
							</Card>
						</output>
					</Show>
				</Stack>
			</CardContent>
		</Card>
	);
};

// [Previous demo components remain unchanged...]
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
						<Description>
							Selected: {Array.from(values()).join(', ') || 'None'}
						</Description>
						<ListBox name="single-listbox" values={values()} onValues={setValues}>
							<ListBoxItem value="apple">Apple</ListBoxItem>
							<ListBoxItem value="banana">Banana</ListBoxItem>
							<ListBoxItem value="orange">Orange</ListBoxItem>
						</ListBox>
					</LabelStack>

					<LabelStack>
						<Label>Multiple Selection</Label>
						<Description>
							Selected: {Array.from(multiValues()).join(', ') || 'None'}
						</Description>
						<ListBox
							name="multi-listbox"
							values={multiValues()}
							onValues={setMultiValues}
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
						<ErrorMessage>
							{multiValues().has('red') ? "Don't pick red." : null}
						</ErrorMessage>
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
	return (
		<Card>
			<CardHeader>
				<CardTitle>Menu</CardTitle>
				<CardDescription>Dropdown menu with groups and items</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack class="gap-xs">
					<Description>Selected: {selection() ?? 'None'}</Description>
					<Group>
						<Dropdown>
							{() => <Button>Simple Menu</Button>}
							{() => (
								<Menu onValue={setSelection}>
									<MenuItem value="a">Option A</MenuItem>
									<MenuItem value="b">Option B</MenuItem>
									<MenuItem value="c">Option C</MenuItem>
								</Menu>
							)}
						</Dropdown>

						<Dropdown>
							{() => <Button>Menu with Groups</Button>}
							{() => (
								<Menu onValue={setSelection}>
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
										<MenuItemLink href="https://example.com">
											Link to Site
										</MenuItemLink>
									</MenuGroup>
								</Menu>
							)}
						</Dropdown>
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
						<strong>Selected: {value()}</strong>
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
						<Label>
							<Radio value="long" /> Long text:
							AAAAB3NzaC1yc2EAAAABJQAAAQB/nAmOjTmezNUDKYvEeIRf2YnwM9/uUG1d0BYsc8/tRtx+RGi7N2lUbp728MXGwdnL9od4cItzky/zVdLZE2cycOa18xBK9cOWmcKS0A8FYBxEQWJ/q9YVUgZbFKfYGaGQxsER+A0w/fX8ALuk78ktP31K69LcQgxIsl7rNzxsoOQKJ/CIxOGMMxczYTiEoLvQhapFQMs3FL96didKr/QbrfB1WT6s3838SEaXfgZvLef1YB2xmfhbT9OXFE3FXvh2UPBfN+ffE7iiayQf/2XR+8j4N4bW30DiPtOQLGUrH1y5X/rpNZNlWW2+jGIxqZtgWg7lTy3mXy5x836Sj/6L
						</Label>
					</Stack>
				</RadioGroup>
			</CardContent>
		</Card>
	);
};

const TooltipDemo: Component = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tooltips</CardTitle>
				<CardDescription>Tooltips on hover</CardDescription>
			</CardHeader>
			<CardContent>
				<Grid class="gap-sm">
					<Tooltip tip="Hello, I'm a toolip" placement="top">
						<Button>Top</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm a toolip" placement="bottom">
						<Button>Bottom</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm a toolip" placement="left">
						<Button>Left</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm a toolip" placement="right">
						<Button>Right</Button>
					</Tooltip>
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
					<IconButton label="Settings">
						<Settings />
					</IconButton>
					<IconButton label="More options">
						<Ellipsis />
					</IconButton>
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
					<Checkbox name="default" /> Default checkbox
				</Label>
				<Label>
					<Checkbox name="checked" checked /> Checked checkbox
				</Label>
				<Label>
					<Checkbox name="indetermine" indeterminate /> Indeterminate checkbox
				</Label>
				<Label>
					<Checkbox name="invalid" aria-invalid /> Error state checkbox
				</Label>
				<Label>
					<Checkbox name="disabled" disabled /> Disabled checkbox
				</Label>
				<Label>
					<Checkbox name="long" /> Long text:
					AAAAB3NzaC1yc2EAAAABJQAAAQB/nAmOjTmezNUDKYvEeIRf2YnwM9/uUG1d0BYsc8/tRtx+RGi7N2lUbp728MXGwdnL9od4cItzky/zVdLZE2cycOa18xBK9cOWmcKS0A8FYBxEQWJ/q9YVUgZbFKfYGaGQxsER+A0w/fX8ALuk78ktP31K69LcQgxIsl7rNzxsoOQKJ/CIxOGMMxczYTiEoLvQhapFQMs3FL96didKr/QbrfB1WT6s3838SEaXfgZvLef1YB2xmfhbT9OXFE3FXvh2UPBfN+ffE7iiayQf/2XR+8j4N4bW30DiPtOQLGUrH1y5X/rpNZNlWW2+jGIxqZtgWg7lTy3mXy5x836Sj/6L
				</Label>
				<Label>
					Toggle switch <ToggleSwitch name="toggle" />
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
				<LabelStack>
					<Label>Default</Label>
					<Textarea placeholder="Default (medium) textarea" />
				</LabelStack>
				<LabelStack>
					<Label>Error</Label>
					<Textarea aria-invalid placeholder="Error state textarea" />
				</LabelStack>
				<LabelStack>
					<Label>Disabled</Label>
					<Textarea disabled placeholder="Disabled textarea" />
				</LabelStack>
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
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
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
						<Description>
							Selected: {Array.from(multiValue()).join(', ') || 'None'}
						</Description>
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
						<ErrorMessage>
							{multiValue().has('red') ? "Don't pick red." : null}
						</ErrorMessage>
					</LabelStack>

					<LabelStack>
						<Label>Long Selection List</Label>
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
						<Select
							placeholder="Select an option..."
							values={value()}
							onChange={(_e, values) => setValue(values)}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
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
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
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
						<Description>
							Selected: {Array.from(multiValue()).join(', ') || 'None'}
						</Description>
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
						<ErrorMessage>
							{multiValue().has('red') ? "Don't pick red." : null}
						</ErrorMessage>
					</LabelStack>

					<LabelStack>
						<Label>Disabled Selection</Label>
						<SelectTypeahead disabled values={new Set(['fixed'])}>
							<ListBoxItem value="fixed">Can't change me</ListBoxItem>
							<ListBoxItem value="different">Can't pick me</ListBoxItem>
						</SelectTypeahead>
					</LabelStack>

					<LabelStack>
						<Label>Long Selection List</Label>
						<Description>
							Selected: {Array.from(value()).join(', ') || 'None'}
						</Description>
						<SelectTypeahead
							placeholder="Select an option..."
							values={value()}
							onChange={(_e, values) => setValue(values)}
						>
							<For each={[...Array(100).keys()]}>
								{(i) => <ListBoxItem value={String(i)}>Option {i}</ListBoxItem>}
							</For>
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
	const [isOpenForm, setIsOpenForm] = createSignal(false);
	const [formData, setFormData] = createSignal<{
		name: string;
		email: string;
		message: string;
	} | null>(null);

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

	const FormNames = {
		name: 'name',
		email: 'email',
		message: 'message',
	};

	const handleSubmit = (e: SubmitEvent & { data: TypedFormData<string> }) => {
		e.preventDefault();
		const data = e.data;
		setFormData({
			name: data.get(FormNames.name) as string,
			email: data.get(FormNames.email) as string,
			message: data.get(FormNames.message) as string,
		});
		setIsOpenForm(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Modal</CardTitle>
				<CardDescription>Modal dialog with backdrop</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<Show when={formData()}>
						<output>
							<Card>
								<CardHeader>
									<CardTitle>Submitted Form Data</CardTitle>
								</CardHeader>
								<CardContent>
									<Stack>
										<LabelStack>
											<Label>Name</Label>
											<Description>{formData()?.name}</Description>
										</LabelStack>
										<LabelStack>
											<Label>Email</Label>
											<Description>{formData()?.email}</Description>
										</LabelStack>
										<LabelStack>
											<Label>Message</Label>
											<Description>{formData()?.message}</Description>
										</LabelStack>
									</Stack>
								</CardContent>
							</Card>
						</output>
					</Show>
					<Group>
						<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
						<Modal open={isOpen()} onClose={() => setIsOpen(false)}>
							<ModalTitle>Example Modal</ModalTitle>
							<ModalContent>
								<p>Click outside or the close button to dismiss</p>
							</ModalContent>
							<ModalFooter>
								<Button type="reset">Close</Button>
							</ModalFooter>
						</Modal>

						<Button onClick={() => setIsOpenLong(true)}>Open Modal (Long)</Button>
						<Modal open={isOpenLong()} onClose={() => setIsOpenLong(false)}>
							<ModalTitle>Example Modal</ModalTitle>
							<ModalContent>{manyParagraphs}</ModalContent>
							<ModalFooter>
								<Button type="reset">Close</Button>
							</ModalFooter>
						</Modal>

						<Button onClick={() => setIsOpenForm(true)}>Open Form Modal</Button>
						<Modal open={isOpenForm()} onClose={() => setIsOpenForm(false)}>
							<ModalTitle>Form Example</ModalTitle>
							<ModalFormContent names={FormNames} onSubmit={handleSubmit}>
								<Stack>
									<LabelledControl label="Name">
										<Input name={FormNames.name} required />
									</LabelledControl>
									<LabelledControl label="Email">
										<Input name={FormNames.email} type="email" required />
									</LabelledControl>
									<LabelledControl label="Message">
										<Textarea name={FormNames.message} required />
									</LabelledControl>
								</Stack>
							</ModalFormContent>
							<ModalFooter>
								<ModalCancelButton />
								<ModalSubmitButton />
							</ModalFooter>
						</Modal>
					</Group>
				</Stack>
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
				<FormValidationDemo />
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
