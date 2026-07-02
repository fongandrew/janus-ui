/**
 * The Solid test app (PLAN 6.T): every component from the §13.7 catalogue
 * rendered with representative props. Client-rendered at /v2-solid.html;
 * doubles as a development playground and the E2E target — each demo
 * section carries a stable id the colocated *.e2e.ts suites scope to.
 */
import { createSignal, type JSX } from 'solid-js';

import { registerValidator } from '~/lib2/dom';
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
	LabelledInline,
	LabelledInput,
	LabelledInputGroup,
	Menu,
	MenuItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	ModalForm,
	ModalHeader,
	ModalSpeedBump,
	Password,
	Popover,
	Radio,
	RadioGroup,
	SelectNative,
	Skeleton,
	Spinner,
	StyledSelect,
	SubmitButton,
	Tab,
	Table,
	TabList,
	TabPanel,
	Tabs,
	Tag,
	Textarea,
	Toggle,
	Tooltip,
} from '~/lib2/solid';

registerValidator('demo-no-bob', (el) =>
	el.value.toLowerCase().includes('bob') ? 'No Bobs allowed' : null,
);

function Demo(props: { id: string; title: string; children: JSX.Element }) {
	return (
		<section id={props.id} class="c-card o-box">
			<div class="o-stack">
				<header>
					<h2>{props.title}</h2>
				</header>
				{props.children}
			</div>
		</section>
	);
}

export function App() {
	const [formOutput, setFormOutput] = createSignal('');
	const [modalFormOutput, setModalFormOutput] = createSignal('');
	const [menuOutput, setMenuOutput] = createSignal('');
	const [selectOutput, setSelectOutput] = createSignal('');
	const [modalCloses, setModalCloses] = createSignal(0);
	const [removed, setRemoved] = createSignal(false);

	return (
		<main class="o-container">
			<hgroup>
				<h1>Solid components</h1>
				<p>
					Every §13.7 wrapper rendered through the Solid layer — client-rendered, with the
					DOM layer's <code>mount()</code> driving behavior.
				</p>
			</hgroup>

			<div class="o-grid" style={{ '--o-grid__min': '24rem' }}>
				<Demo id="buttons-demo" title="Buttons">
					<div class="o-row">
						<Button>Default</Button>
						<Button variant="primary">Primary</Button>
						<Button variant="danger">Danger</Button>
					</div>
					<div class="o-row">
						<Button disabled>Disabled</Button>
						<IconButton aria-label="Add">+</IconButton>
					</div>
				</Demo>

				<Demo id="cards-demo" title="Cards">
					<Card surface="elevated">
						<CardHeader>
							<CardTitle>Card title</CardTitle>
							<CardDescription>A short supporting description.</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Card content rendered inside an o-prose block.</p>
						</CardContent>
					</Card>
				</Demo>

				<Demo id="alerts-demo" title="Alerts">
					<Alert>A neutral alert.</Alert>
					<Alert variant="success">Saved — everything is up to date.</Alert>
					<Alert variant="danger">Something failed and needs attention.</Alert>
				</Demo>

				<Demo id="inputs-demo" title="Inputs">
					<LabelledInput id="demo-input" label="Email" description="We never share this.">
						{(p) => <Input {...p} name="demo-email" placeholder="you@example.com" />}
					</LabelledInput>
					<LabelledInput
						id="demo-input-error"
						label="Controlled error"
						errorMessage="This error is prop-controlled."
					>
						{(p) => <Input {...p} name="demo-error" value="not-an-email" />}
					</LabelledInput>
					<Input
						id="demo-input-disabled"
						aria-label="Disabled input"
						disabled
						value="Disabled"
					/>
				</Demo>

				<Demo id="textareas-demo" title="Textareas">
					<LabelledInput id="demo-textarea" label="Notes">
						{(p) => <Textarea {...p} name="notes" placeholder="Multi-line…" />}
					</LabelledInput>
				</Demo>

				<Demo id="checkboxes-demo" title="Checkboxes">
					<Checkbox id="demo-check" label="Basic" name="basic" />
					<Checkbox id="demo-check-checked" label="Checked" checked name="checked" />
					<Checkbox
						id="demo-check-indeterminate"
						label="Indeterminate"
						indeterminate
						name="indeterminate"
					/>
					<Checkbox id="demo-check-disabled" label="Disabled" disabled name="disabled" />
				</Demo>

				<Demo id="radios-demo" title="Radios">
					<RadioGroup id="demo-radio-group" aria-label="Flavor">
						<div class="o-row">
							<Radio
								id="demo-radio-1"
								name="flavor"
								value="vanilla"
								label="Vanilla"
								checked
							/>
							<Radio
								id="demo-radio-2"
								name="flavor"
								value="pistachio"
								label="Pistachio"
							/>
							<Radio
								id="demo-radio-3"
								name="flavor"
								value="stracciatella"
								label="Stracciatella"
							/>
						</div>
					</RadioGroup>
				</Demo>

				<Demo id="toggles-demo" title="Toggles">
					<Toggle id="demo-toggle" label="Notifications" name="notifications" />
					<Toggle id="demo-toggle-checked" label="On by default" checked name="on" />
					<Toggle id="demo-toggle-disabled" label="Disabled" disabled name="off" />
				</Demo>

				<Demo id="selects-demo" title="Native select">
					<LabelledInput id="demo-select" label="Flavor">
						{(p) => (
							<SelectNative
								{...p}
								name="flavor-select"
								options={[
									{ value: 'vanilla', label: 'Vanilla' },
									{ value: 'pistachio', label: 'Pistachio' },
									{ value: 'stracciatella', label: 'Stracciatella' },
								]}
							/>
						)}
					</LabelledInput>
					<SelectNative id="demo-select-children" aria-label="Size">
						<option value="s">Small</option>
						<option value="m" selected>
							Medium
						</option>
						<option value="l">Large</option>
					</SelectNative>
				</Demo>

				<Demo id="tags-demo" title="Tags">
					<div class="o-row">
						<Tag>Default</Tag>
						<Tag variant="primary">Primary</Tag>
						<Tag onRemove={() => setRemoved(true)} id="demo-tag-removable">
							Removable
						</Tag>
						<output id="tag-output">{removed() ? 'removed' : ''}</output>
					</div>
				</Demo>

				<Demo id="badges-demo" title="Badges">
					<div class="o-row">
						<Badge>3</Badge>
						<Badge variant="danger">9+</Badge>
						<Badge dot aria-label="Unread" id="demo-badge-dot" />
					</div>
				</Demo>

				<Demo id="avatars-demo" title="Avatars">
					<div class="o-row">
						<Avatar id="demo-avatar-fallback" alt="Amara Jones" fallback="AJ" />
						<Avatar
							id="demo-avatar-img"
							src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
							alt="Bo"
						/>
					</div>
				</Demo>

				<Demo id="spinners-demo" title="Spinners">
					<div class="o-row">
						<Spinner id="demo-spinner" />
						<Spinner size="1.5rem" aria-label="Saving" />
					</div>
				</Demo>

				<Demo id="skeletons-demo" title="Skeletons">
					<div class="o-row">
						<Skeleton id="demo-skeleton-circle" circle width="2.5rem" height="2.5rem" />
						<div class="o-stack t-flex-fill">
							<Skeleton width="80%" />
							<Skeleton width="60%" />
						</div>
					</div>
				</Demo>

				<Demo id="disclosures-demo" title="Disclosure">
					<Disclosure id="demo-disclosure" summary="Closed by default">
						<p>Native details/summary with styled chrome.</p>
					</Disclosure>
					<Disclosure summary="Open by default" open>
						<p>The open state squares the summary's corners.</p>
					</Disclosure>
				</Demo>

				<Demo id="tables-demo" title="Tables">
					<Table id="demo-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Role</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Amara</td>
								<td>Design</td>
							</tr>
							<tr>
								<td>Bo</td>
								<td>Engineering</td>
							</tr>
						</tbody>
					</Table>
					<Table id="demo-table-dense" rowHeight="1.5rem">
						<tbody>
							<tr>
								<td>Dense row</td>
								<td>1.5rem minimum</td>
							</tr>
						</tbody>
					</Table>
				</Demo>

				<Demo id="tabs-demo" title="Tabs">
					<Tabs id="demo-tabs" defaultValue="first">
						<TabList aria-label="Demo tabs">
							<Tab value="first">First</Tab>
							<Tab value="second">Second</Tab>
							<Tab value="third" disabled>
								Disabled
							</Tab>
						</TabList>
						<TabPanel value="first">Panel one content.</TabPanel>
						<TabPanel value="second">Panel two content.</TabPanel>
						<TabPanel value="third">Panel three content.</TabPanel>
					</Tabs>
				</Demo>

				<Demo id="modals-demo" title="Modal">
					<div class="o-row">
						<Button commandfor="demo-modal" command="show-modal" id="demo-modal-open">
							Open modal
						</Button>
					</div>
					<output id="modal-close-count">{modalCloses()}</output>
				</Demo>

				<Demo id="drawers-demo" title="Drawers">
					<div class="o-row">
						<Button
							commandfor="demo-drawer-left"
							command="show-modal"
							id="demo-drawer-left-open"
						>
							Left drawer
						</Button>
						<Button
							commandfor="demo-drawer-right"
							command="show-modal"
							id="demo-drawer-right-open"
						>
							Right drawer
						</Button>
					</div>
				</Demo>

				<Demo id="popovers-demo" title="Popover">
					<Button
						popovertarget="demo-popover"
						id="demo-popover-open"
						style={{ 'anchor-name': '--popover-anchor' }}
					>
						Toggle popover
					</Button>
					<Popover id="demo-popover">
						<p>Anchor-positioned popover content.</p>
					</Popover>
				</Demo>

				<Demo id="tooltips-demo" title="Tooltip">
					<Button
						popovertarget="demo-tooltip"
						id="demo-tooltip-open"
						style={{ 'anchor-name': '--tooltip-anchor' }}
					>
						Toggle tooltip
					</Button>
					<Tooltip id="demo-tooltip" content="Caption-scale help text." />
				</Demo>

				<Demo id="menus-demo" title="Menu">
					<Button
						popovertarget="demo-menu"
						id="demo-menu-open"
						style={{ 'anchor-name': '--menu-anchor' }}
					>
						Open menu
					</Button>
					<Menu id="demo-menu" aria-label="Actions">
						<MenuItem onClick={(ev) => pickMenuItem(ev, setMenuOutput, 'Alpha')}>
							Alpha
						</MenuItem>
						<MenuItem onClick={(ev) => pickMenuItem(ev, setMenuOutput, 'Bravo')}>
							Bravo
						</MenuItem>
						<MenuItem onClick={(ev) => pickMenuItem(ev, setMenuOutput, 'Charlie')}>
							Charlie
						</MenuItem>
					</Menu>
					<output id="menu-output">{menuOutput()}</output>
				</Demo>

				<Demo id="styled-selects-demo" title="Styled select">
					<StyledSelect
						id="demo-styled-select"
						name="styled-flavor"
						value="pistachio"
						onChange={(value) => setSelectOutput(value)}
						options={[
							{ value: 'vanilla', label: '🍦 Vanilla' },
							{ value: 'pistachio', label: '🟢 Pistachio' },
							{ value: 'stracciatella', label: '🍫 Stracciatella' },
						]}
					/>
					<output id="styled-select-output">{selectOutput()}</output>
				</Demo>

				<Demo id="passwords-demo" title="Password">
					<LabelledInput id="demo-password" label="Password">
						{(p) => <Password {...p} name="password" value="hunter2" />}
					</LabelledInput>
				</Demo>

				<Demo id="labelled-demo" title="Labelled layouts">
					<LabelledInline id="demo-inline" label="Inline checkbox">
						{(p) => <Checkbox {...p} name="inline" />}
					</LabelledInline>
					<LabelledInputGroup
						id="demo-input-group"
						label="Grouped controls"
						description="A shared description."
					>
						{(p) => (
							<div class="o-row" {...p}>
								<Input aria-label="First" name="first" />
								<Input aria-label="Second" name="second" />
							</div>
						)}
					</LabelledInputGroup>
				</Demo>

				<Demo id="forms-demo" title="Form">
					<Form
						id="demo-form"
						onSubmit={(data) => {
							if (data.get('username') === 'reject') {
								return { ok: false, formError: 'Rejected by the server' };
							}
							setFormOutput(`Hello ${String(data.get('username'))}`);
							return { ok: true };
						}}
					>
						<div class="o-stack">
							<FormError />
							<LabelledInput
								id="demo-form-email"
								label="Email"
								description="Required."
							>
								{(p) => <Input {...p} name="email" type="email" required />}
							</LabelledInput>
							<LabelledInput id="demo-form-username" label="Username (no bob)">
								{(p) => (
									<Input
										{...p}
										name="username"
										required
										validators="demo-no-bob"
									/>
								)}
							</LabelledInput>
							<div class="o-row">
								<SubmitButton variant="primary">Submit</SubmitButton>
							</div>
							<output id="form-output">{formOutput()}</output>
						</div>
					</Form>
				</Demo>

				<Demo id="modal-forms-demo" title="Modal form">
					<div class="o-row">
						<Button
							commandfor="demo-modal-form"
							command="show-modal"
							id="demo-modal-form-open"
						>
							Open modal form
						</Button>
					</div>
					<output id="modal-form-output">{modalFormOutput()}</output>
				</Demo>
			</div>

			{/* Overlay elements live outside the grid so their frames are clean */}
			<Modal id="demo-modal" onClose={() => setModalCloses((count) => count + 1)}>
				<ModalCloseButton />
				<ModalHeader>A Solid modal</ModalHeader>
				<ModalBody>
					<div class="o-prose">
						<p>
							ESC closes it through the request-close chain, clicking the backdrop
							closes it, and focus returns to the trigger on close.
						</p>
					</div>
					<ModalFooter>
						<Button commandfor="demo-modal" command="close">
							Done
						</Button>
					</ModalFooter>
				</ModalBody>
			</Modal>

			<Drawer id="demo-drawer-left" side="left">
				<div class="o-stack">
					<h2>Left drawer</h2>
					<Button commandfor="demo-drawer-left" command="close">
						Close
					</Button>
				</div>
			</Drawer>

			<Drawer id="demo-drawer-right" side="right">
				<div class="o-stack">
					<h2>Right drawer</h2>
					<Button commandfor="demo-drawer-right" command="close">
						Close
					</Button>
				</div>
			</Drawer>

			<Modal id="demo-modal-form">
				<ModalCloseButton />
				<ModalHeader>Sign up</ModalHeader>
				<ModalBody>
					<ModalForm
						id="demo-modal-form-form"
						onSubmit={(data) => {
							setModalFormOutput(`Signed up ${String(data.get('name'))}`);
							return { ok: true };
						}}
					>
						<div class="o-stack">
							<LabelledInput id="demo-modal-form-name" label="Name">
								{(p) => <Input {...p} name="name" required />}
							</LabelledInput>
							<ModalFooter>
								<SubmitButton variant="primary">Sign up</SubmitButton>
							</ModalFooter>
						</div>
					</ModalForm>
				</ModalBody>
				<ModalSpeedBump />
			</Modal>
		</main>
	);
}

function pickMenuItem(
	ev: MouseEvent & { currentTarget: HTMLElement },
	write: (value: string) => void,
	value: string,
): void {
	write(value);
	ev.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover();
}
