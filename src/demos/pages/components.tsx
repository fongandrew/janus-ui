import { createSignal, type JSX } from 'solid-js';

import {
	Alert,
	Avatar,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Checkbox,
	Disclosure,
	Drawer,
	Form,
	FormError,
	IconButton,
	Input,
	LabelledInput,
	Menu,
	MenuItem,
	Modal,
	Radio,
	RadioGroup,
	SelectNative,
	Skeleton,
	Spinner,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Tag,
	Textarea,
	Toggle,
} from '~/lib/solid';

function DemoCard(props: { id: string; title: string; description: string; children: JSX.Element }) {
	return (
		<Card surface="card" id={props.id}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">{props.children}</div>
			</CardContent>
		</Card>
	);
}

function ButtonsDemo(): JSX.Element {
	return (
		<DemoCard id="buttons-demo" title="Buttons" description="Interactive button variants and states">
			<div class="o-group">
				<Button>Default</Button>
				<Button variant="primary">Primary</Button>
				<Button variant="danger">Danger</Button>
				<Button variant="success">Success</Button>
			</div>
			<div class="o-group">
				<Button disabled>Disabled</Button>
				<IconButton label="Add">+</IconButton>
				<IconButton label="Close" variant="danger">&times;</IconButton>
			</div>
		</DemoCard>
	);
}

function CardsDemo(): JSX.Element {
	return (
		<DemoCard id="cards-demo" title="Cards" description="Surface variants and card structure">
			<div class="o-grid" style={{ '--o-grid__min': '200px' }}>
				<Card surface="card">
					<CardContent><p>Surface: card</p></CardContent>
				</Card>
				<Card surface="elevated">
					<CardContent><p>Surface: elevated</p></CardContent>
				</Card>
				<Card surface="sunken">
					<CardContent><p>Surface: sunken</p></CardContent>
				</Card>
			</div>
		</DemoCard>
	);
}

function AlertsDemo(): JSX.Element {
	return (
		<DemoCard id="alerts-demo" title="Alerts" description="Tonal alert variants">
			<Alert>Default alert message</Alert>
			<Alert variant="success">Success! Operation completed.</Alert>
			<Alert variant="warn">Warning: Please review before continuing.</Alert>
			<Alert variant="danger">Error: Something went wrong.</Alert>
			<Alert variant="info">Info: Here is some useful information.</Alert>
		</DemoCard>
	);
}

function InputsDemo(): JSX.Element {
	return (
		<DemoCard id="inputs-demo" title="Inputs" description="Text inputs with various states">
			<LabelledInput id="demo-email" label="Email" description="We'll never share your email.">
				<Input id="demo-email" type="email" placeholder="you@example.com" aria-describedby="demo-email-desc demo-email-err" />
			</LabelledInput>
			<LabelledInput id="demo-password" label="Password">
				<Input id="demo-password" type="password" placeholder="Enter password" aria-describedby="demo-password-err" />
			</LabelledInput>
			<Input disabled placeholder="Disabled input" />
		</DemoCard>
	);
}

function TextareasDemo(): JSX.Element {
	return (
		<DemoCard id="textareas-demo" title="Textareas" description="Multi-line text inputs">
			<Textarea placeholder="Enter your message..." rows={3} />
			<Textarea disabled placeholder="Disabled textarea" rows={2} />
		</DemoCard>
	);
}

function CheckboxesDemo(): JSX.Element {
	return (
		<DemoCard id="checkboxes-demo" title="Checkboxes" description="Custom-styled checkboxes">
			<label class="o-group"><Checkbox /> Unchecked</label>
			<label class="o-group"><Checkbox checked /> Checked</label>
			<label class="o-group"><Checkbox disabled /> Disabled</label>
		</DemoCard>
	);
}

function RadiosDemo(): JSX.Element {
	return (
		<DemoCard id="radios-demo" title="Radios" description="Radio button groups with roving focus">
			<RadioGroup label="Choose a plan">
				<label class="o-group"><Radio name="plan" value="free" checked /> Free</label>
				<label class="o-group"><Radio name="plan" value="pro" /> Pro</label>
				<label class="o-group"><Radio name="plan" value="enterprise" /> Enterprise</label>
				<label class="o-group"><Radio name="plan" value="disabled" disabled /> Disabled</label>
			</RadioGroup>
		</DemoCard>
	);
}

function TogglesDemo(): JSX.Element {
	return (
		<DemoCard id="toggles-demo" title="Toggles" description="Switch-style toggles">
			<label class="o-group"><Toggle /> Off</label>
			<label class="o-group"><Toggle checked /> On</label>
			<label class="o-group"><Toggle disabled /> Disabled</label>
		</DemoCard>
	);
}

function SelectsDemo(): JSX.Element {
	return (
		<DemoCard id="selects-demo" title="Native Selects" description="Styled native select elements">
			<SelectNative>
				<option value="">Choose an option...</option>
				<option value="a">Option A</option>
				<option value="b">Option B</option>
				<option value="c">Option C</option>
			</SelectNative>
			<SelectNative disabled>
				<option>Disabled select</option>
			</SelectNative>
		</DemoCard>
	);
}

function TagsDemo(): JSX.Element {
	return (
		<DemoCard id="tags-demo" title="Tags" description="Labeling and categorization">
			<div class="o-group">
				<Tag>Default</Tag>
				<Tag variant="primary">Primary</Tag>
				<Tag variant="success">Success</Tag>
				<Tag variant="danger">Danger</Tag>
				<Tag variant="warn" onRemove={() => {}}>Removable</Tag>
			</div>
		</DemoCard>
	);
}

function BadgesDemo(): JSX.Element {
	return (
		<DemoCard id="badges-demo" title="Badges" description="Count indicators and dots">
			<div class="o-group">
				<Badge variant="primary">3</Badge>
				<Badge variant="danger">99+</Badge>
				<Badge variant="success" dot />
				<Badge>New</Badge>
			</div>
		</DemoCard>
	);
}

function AvatarsDemo(): JSX.Element {
	return (
		<DemoCard id="avatars-demo" title="Avatars" description="User representation">
			<div class="o-group">
				<Avatar fallback="JD" />
				<Avatar fallback="AB" />
				<Avatar fallback="XY" />
			</div>
		</DemoCard>
	);
}

function SpinnersDemo(): JSX.Element {
	return (
		<DemoCard id="spinners-demo" title="Spinners" description="Loading indicators">
			<div class="o-group" style={{ 'align-items': 'center' }}>
				<Spinner />
				<Spinner size="2rem" />
				<Button variant="primary">
					<Spinner size="1em" /> Loading...
				</Button>
			</div>
		</DemoCard>
	);
}

function SkeletonsDemo(): JSX.Element {
	return (
		<DemoCard id="skeletons-demo" title="Skeletons" description="Content loading placeholders">
			<Skeleton width="100%" height="1rem" />
			<Skeleton width="75%" height="1rem" />
			<Skeleton width="50%" height="1rem" />
			<Skeleton circle width="3rem" height="3rem" />
		</DemoCard>
	);
}

function DisclosureDemo(): JSX.Element {
	return (
		<DemoCard id="disclosure-demo" title="Disclosure" description="Expandable content sections">
			<Disclosure summary="Click to expand">
				<p>This content is revealed when the disclosure is opened.</p>
			</Disclosure>
			<Disclosure summary="Another section" open>
				<p>This section starts open by default.</p>
			</Disclosure>
		</DemoCard>
	);
}

function TabsDemo(): JSX.Element {
	const [activeTab, setActiveTab] = createSignal('tab-1');
	return (
		<DemoCard id="tabs-demo" title="Tabs" description="Tabbed content navigation">
			<Tabs>
				<TabList>
					<Tab controls="panel-1" selected={activeTab() === 'tab-1'} onClick={() => setActiveTab('tab-1')}>Tab 1</Tab>
					<Tab controls="panel-2" selected={activeTab() === 'tab-2'} onClick={() => setActiveTab('tab-2')}>Tab 2</Tab>
					<Tab controls="panel-3" selected={activeTab() === 'tab-3'} onClick={() => setActiveTab('tab-3')}>Tab 3</Tab>
				</TabList>
				<TabPanel id="panel-1" hidden={activeTab() !== 'tab-1'}>Content for tab 1</TabPanel>
				<TabPanel id="panel-2" hidden={activeTab() !== 'tab-2'}>Content for tab 2</TabPanel>
				<TabPanel id="panel-3" hidden={activeTab() !== 'tab-3'}>Content for tab 3</TabPanel>
			</Tabs>
		</DemoCard>
	);
}

function ModalsDemo(): JSX.Element {
	let modalRef: HTMLDialogElement | undefined;
	return (
		<DemoCard id="modals-demo" title="Modals" description="Dialog overlays with focus trap">
			<Button onClick={() => modalRef?.showModal()}>Open Modal</Button>
			<Modal ref={modalRef}>
				<div class="o-stack" style={{ padding: 'var(--v-pad-block) var(--v-pad-inline)' }}>
					<h2>Modal Title</h2>
					<p>This is modal content. Press ESC or click outside to close.</p>
					<Button onClick={() => modalRef?.close()}>Close</Button>
				</div>
			</Modal>
		</DemoCard>
	);
}

function DrawersDemo(): JSX.Element {
	let drawerRef: HTMLDialogElement | undefined;
	return (
		<DemoCard id="drawers-demo" title="Drawers" description="Side-anchored overlays">
			<div class="o-group">
				<Button onClick={() => drawerRef?.showModal()}>Open Drawer (Right)</Button>
			</div>
			<Drawer ref={drawerRef} side="right">
				<div class="o-stack" style={{ padding: 'var(--v-pad-block) var(--v-pad-inline)', 'min-width': '280px' }}>
					<h2>Drawer</h2>
					<p>Side-anchored content panel.</p>
					<Button onClick={() => drawerRef?.close()}>Close</Button>
				</div>
			</Drawer>
		</DemoCard>
	);
}

function MenusDemo(): JSX.Element {
	return (
		<DemoCard id="menus-demo" title="Menus" description="Dropdown menus with keyboard navigation">
			<div>
				<Button id="menu-trigger" popovertarget="demo-menu">Open Menu</Button>
				<Menu id="demo-menu" anchor="menu-trigger">
					<MenuItem>Cut</MenuItem>
					<MenuItem>Copy</MenuItem>
					<MenuItem>Paste</MenuItem>
					<MenuItem disabled>Delete</MenuItem>
				</Menu>
			</div>
		</DemoCard>
	);
}

function FormsDemo(): JSX.Element {
	const [submitted, setSubmitted] = createSignal(false);
	return (
		<DemoCard id="forms-demo" title="Forms" description="Validation and submit handling">
			<Form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
				<div class="o-stack">
					<LabelledInput id="form-name" label="Name">
						<Input id="form-name" required placeholder="Your name" aria-describedby="form-name-err" />
					</LabelledInput>
					<LabelledInput id="form-email" label="Email">
						<Input id="form-email" type="email" required placeholder="you@example.com" aria-describedby="form-email-err" />
					</LabelledInput>
					<FormError />
					<Button variant="primary" type="submit">Submit</Button>
					{submitted() && <Alert variant="success">Form submitted successfully!</Alert>}
				</div>
			</Form>
		</DemoCard>
	);
}

export function ComponentsPage(): JSX.Element {
	return (
		<div class="o-stack">
			<h1>Components</h1>
			<div class="o-grid" style={{ '--o-grid__min': '320px' }}>
				<ButtonsDemo />
				<CardsDemo />
				<AlertsDemo />
				<InputsDemo />
				<TextareasDemo />
				<CheckboxesDemo />
				<RadiosDemo />
				<TogglesDemo />
				<SelectsDemo />
				<TagsDemo />
				<BadgesDemo />
				<AvatarsDemo />
				<SpinnersDemo />
				<SkeletonsDemo />
				<DisclosureDemo />
				<TabsDemo />
				<ModalsDemo />
				<DrawersDemo />
				<MenusDemo />
				<FormsDemo />
			</div>
		</div>
	);
}
