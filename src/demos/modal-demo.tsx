import { createSignal, createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { asyncFormSubmit } from '~/demos/callbacks/async-form';
import { formOutputWrite } from '~/demos/callbacks/form-output';
import { Button } from '~/shared/components/button';
import { type TypedSubmitEvent } from '~/shared/components/callbacks/form';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { BaseDescription } from '~/shared/components/description';
import { FormContextProvider } from '~/shared/components/form-context';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelledInline, LabelledInput } from '~/shared/components/labelled-control';
import { ListBoxItem } from '~/shared/components/list-box';
import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalOpenTrigger,
	ModalTitle,
} from '~/shared/components/modal';
import {
	ModalCancelButton,
	ModalFormContent,
	ModalSubmitButton,
} from '~/shared/components/modal-form';
import { Select } from '~/shared/components/select';
import { Textarea } from '~/shared/components/textarea';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

function ControlledModal() {
	const [isOpen, setIsOpen] = createSignal(false);
	return (
		<>
			<Button onClick={() => setIsOpen(true)}>Controlled Modal</Button>
			<Modal open={isOpen()} onClose={() => setIsOpen(false)}>
				<ModalTitle>Example Modal</ModalTitle>
				<ModalContent>
					<p>Click outside or the close button to dismiss</p>
				</ModalContent>
				<ModalFooter>
					<ModalCloseButton />
				</ModalFooter>
			</Modal>
		</>
	);
}

function TriggeredModal() {
	const dialogId = createUniqueId();
	return (
		<>
			<ModalOpenTrigger targetId={dialogId}>
				<Button>Triggered Modal</Button>
			</ModalOpenTrigger>
			<Modal id={dialogId}>
				<ModalTitle>Example Modal</ModalTitle>
				<ModalContent>
					<p>Click outside or the close button to dismiss</p>
				</ModalContent>
				<ModalFooter>
					<ModalCloseButton />
				</ModalFooter>
			</Modal>
		</>
	);
}

function LongModal() {
	const dialogId = createUniqueId();
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
		<>
			<ModalOpenTrigger targetId={dialogId}>
				<Button>Open Modal (Long)</Button>
			</ModalOpenTrigger>
			<Modal id={dialogId}>
				<ModalTitle>Example Modal</ModalTitle>
				<ModalContent>{manyParagraphs}</ModalContent>
				<ModalFooter>
					<ModalCloseButton />
				</ModalFooter>
			</Modal>
		</>
	);
}

function FormModal(props: { outputId: string }) {
	const formDialogId = createUniqueId();
	const [isResultsOpen, setIsResultsOpen] = createSignal(false);

	const FormNames = {
		name: 'name' as const,
		email: 'email' as const,
		message: 'message' as const,
		terms: 'terms' as const,
	};

	const [formData, setFormData] = createSignal<Record<keyof typeof FormNames, string> | null>(
		null,
	);
	const handleSubmit = (e: TypedSubmitEvent<keyof typeof FormNames>) => {
		e.preventDefault();
		const data = e.data;
		setFormData({
			name: data.get('name') as string,
			email: data.get('email') as string,
			message: data.get('message') as string,
			terms: data.get('terms') as string,
		});
		setIsResultsOpen(true);
	};

	return (
		<>
			<ModalOpenTrigger targetId={formDialogId}>
				<Button>Open Modal (Form)</Button>
			</ModalOpenTrigger>
			<Modal id={formDialogId}>
				<ModalTitle>Form Example</ModalTitle>
				<FormContextProvider>
					<ModalFormContent
						names={FormNames}
						onSubmit={handleSubmit}
						{...callbackAttrs(isServer && formOutputWrite(props.outputId))}
					>
						<LabelledInput label="Name">
							<Input name={FormNames.name} required />
						</LabelledInput>
						<LabelledInput label="Email">
							<Input name={FormNames.email} type="email" required />
						</LabelledInput>
						<LabelledInput label="How did you hear about us?">
							<Select placeholder="Select an option" required>
								<ListBoxItem value="friend">Friends & family</ListBoxItem>
								<ListBoxItem value="aliens">Space aliens</ListBoxItem>
								<ListBoxItem value="ads">Advertising</ListBoxItem>
							</Select>
						</LabelledInput>
						<LabelledInput label="Message">
							<Textarea name={FormNames.message} required />
						</LabelledInput>
						<LabelledInline label="Agree to the terms of service?">
							<Checkbox name={FormNames.terms} required />
						</LabelledInline>
					</ModalFormContent>
					<ModalFooter>
						<ModalCancelButton />
						<ModalSubmitButton />
					</ModalFooter>
				</FormContextProvider>
			</Modal>
			<Modal open={isResultsOpen()} onClose={[setIsResultsOpen, false]}>
				<ModalTitle>Form Results</ModalTitle>
				<ModalContent>
					<output>
						<Card>
							<CardHeader>
								<CardTitle>Submitted Form Data</CardTitle>
							</CardHeader>
							<CardContent>
								<div class="o-stack">
									<div class="o-label-stack">
										<Label>Name</Label>
										<BaseDescription>{formData()?.name}</BaseDescription>
									</div>
									<div class="o-label-stack">
										<Label>Email</Label>
										<BaseDescription>{formData()?.email}</BaseDescription>
									</div>
									<div class="o-label-stack">
										<Label>Message</Label>
										<BaseDescription>{formData()?.message}</BaseDescription>
									</div>
								</div>
							</CardContent>
						</Card>
					</output>
				</ModalContent>
			</Modal>
		</>
	);
}

function ScrollableForm(props: { outputId: string }) {
	const formId = createUniqueId();

	const FormNames = {
		field1: 'field1' as const,
		field2: 'field2' as const,
	};

	return (
		<>
			<ModalOpenTrigger targetId={formId}>
				<Button>Open Form Modal (Scrollable)</Button>
			</ModalOpenTrigger>
			<Modal id={formId}>
				<ModalTitle>Form Example</ModalTitle>
				<FormContextProvider>
					<ModalFormContent
						names={FormNames}
						{...callbackAttrs(formOutputWrite(props.outputId))}
					>
						<LabelledInput label="First">
							<Input name={FormNames.field1} required />
						</LabelledInput>
						<div style={{ height: '3000px' }}>
							A big block that takes up lots of space to force scrolling
						</div>
						<LabelledInput label="Last">
							<Input name={FormNames.field2} required />
						</LabelledInput>
					</ModalFormContent>
					<ModalFooter>
						<ModalCancelButton />
						<ModalSubmitButton />
					</ModalFooter>
				</FormContextProvider>
			</Modal>
		</>
	);
}

function AsyncForm(props: { outputId: string }) {
	const dialogId = createUniqueId();

	const FormNames = {
		name: 'name' as const,
		message: 'message' as const,
		shouldError: 'shouldError' as const,
	};

	return (
		<>
			<ModalOpenTrigger targetId={dialogId}>
				<Button>Open Modal (Async Form)</Button>
			</ModalOpenTrigger>
			<Modal id={dialogId}>
				<ModalTitle>Async Form Example</ModalTitle>
				<FormContextProvider>
					<ModalFormContent
						names={FormNames}
						{...callbackAttrs(asyncFormSubmit(props.outputId))}
					>
						<LabelledInput label="Name">
							<Input name={FormNames.name} />
						</LabelledInput>
						<LabelledInput label="Message">
							<Textarea name={FormNames.message} />
						</LabelledInput>
						<LabelledInline label="Should error">
							<Checkbox name={FormNames.shouldError} />
						</LabelledInline>
					</ModalFormContent>
					<ModalFooter>
						<ModalCancelButton />
						<ModalSubmitButton />
					</ModalFooter>
				</FormContextProvider>
			</Modal>
		</>
	);
}

function ModalDemo() {
	const outputId = createUniqueId();
	return (
		<Card>
			<CardHeader>
				<CardTitle>Modal</CardTitle>
				<CardDescription>Modal dialog with backdrop</CardDescription>
			</CardHeader>
			<CardContent class="o-stack">
				<div class="o-group">
					{!isServer && <ControlledModal />}
					<TriggeredModal />
					<LongModal />
					<FormModal outputId={outputId} />
					<ScrollableForm outputId={outputId} />
					<AsyncForm outputId={outputId} />
				</div>
				<output id={outputId} />
			</CardContent>
		</Card>
	);
}

export { ModalDemo };
