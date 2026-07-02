import { createSignal } from 'solid-js';

import {
	Button,
	Checkbox,
	Form,
	IconButton,
	Input,
	LabelledInput,
	Modal,
	SubmitButton,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Toggle,
} from '~/lib2/solid';

/**
 * A representative sample of the Solid wrappers, used by the E2E suite. Elements
 * carry stable `id` / `data-testid` hooks for scoping.
 */
export function App() {
	const [clicks, setClicks] = createSignal(0);
	const [output, setOutput] = createSignal('');

	return (
		<main
			class="o-container o-stack"
			style={{ 'max-inline-size': '48rem', margin: '2rem auto' }}
		>
			<h1>Solid wrappers — test app</h1>

			<section id="buttons" class="o-stack">
				<h2>Buttons</h2>
				<div class="o-row">
					<Button data-testid="btn-default" onClick={() => setClicks((n) => n + 1)}>
						Default
					</Button>
					<Button variant="primary" data-testid="btn-primary">
						Primary
					</Button>
					<Button variant="danger" data-testid="btn-danger">
						Danger
					</Button>
					<Button variant="success" data-testid="btn-success">
						Success
					</Button>
					<Button variant="warn" data-testid="btn-warn">
						Warn
					</Button>
					<IconButton aria-label="Star" data-testid="btn-icon">
						★
					</IconButton>
				</div>
				<p>
					Clicks: <span data-testid="click-count">{clicks()}</span>
				</p>
			</section>

			<section id="labelled" class="o-stack">
				<h2>Labelled input</h2>
				<LabelledInput label="Email" description="We never share it." id="contact-email">
					{(inputProps) => (
						<Input
							{...inputProps}
							type="email"
							name="email"
							data-testid="labelled-input"
						/>
					)}
				</LabelledInput>
			</section>

			<section id="choices" class="o-stack">
				<h2>Checkbox / toggle</h2>
				<Checkbox label="Accept terms" data-testid="checkbox" />
				<Toggle label="Enable notifications" data-testid="toggle" />
			</section>

			<section id="tabs" class="o-stack">
				<h2>Tabs</h2>
				<Tabs>
					<TabList>
						<Tab controls="panel-a" selected id="tab-a" data-testid="tab-a">
							Tab A
						</Tab>
						<Tab controls="panel-b" id="tab-b" data-testid="tab-b">
							Tab B
						</Tab>
					</TabList>
					<TabPanel id="panel-a" labelledby="tab-a" active data-testid="panel-a">
						Panel A content.
					</TabPanel>
					<TabPanel id="panel-b" labelledby="tab-b" data-testid="panel-b">
						Panel B content.
					</TabPanel>
				</Tabs>
			</section>

			<section id="modal-section" class="o-stack">
				<h2>Modal</h2>
				<Button
					variant="primary"
					command="show-modal"
					commandfor="demo-modal"
					data-testid="modal-trigger"
				>
					Open modal
				</Button>
				<Modal id="demo-modal" title="Demo modal" data-testid="modal">
					<p data-testid="modal-body">Modal body — press ESC or the close button.</p>
					<Button data-testid="modal-inner">A focusable button</Button>
				</Modal>
			</section>

			<section id="form-section" class="o-stack">
				<h2>Form</h2>
				<Form
					id="signup-form"
					data-testid="form"
					onSubmit={(data) => {
						setOutput(`Submitted: ${String(data.get('signup-email') ?? '')}`);
						return { ok: true, reset: false };
					}}
				>
					<LabelledInput label="Email" id="signup-email">
						{(inputProps) => (
							<Input
								{...inputProps}
								type="email"
								name="signup-email"
								required
								data-testid="form-input"
							/>
						)}
					</LabelledInput>
					<SubmitButton variant="primary" data-testid="form-submit">
						Submit
					</SubmitButton>
				</Form>
				<p data-testid="form-output">{output()}</p>
			</section>
		</main>
	);
}
