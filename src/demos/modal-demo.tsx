import { createSignal } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { Description } from '~/shared/components/description';
import { type TypedFormData } from '~/shared/components/form';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledInline, LabelledInput } from '~/shared/components/labelled-control';
import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalTitle,
} from '~/shared/components/modal';
import {
	ModalCancelButton,
	ModalFormContent,
	ModalSubmitButton,
} from '~/shared/components/modal-form';
import { Textarea } from '~/shared/components/textarea';

function SimpleModal() {
	const [isOpen, setIsOpen] = createSignal(false);
	return (
		<>
			<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
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

function LongModal() {
	const [isOpen, setIsOpen] = createSignal(false);

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
			<Button onClick={() => setIsOpen(true)}>Open Modal (Long)</Button>
			<Modal open={isOpen()} onClose={() => setIsOpen(false)}>
				<ModalTitle>Example Modal</ModalTitle>
				<ModalContent>{manyParagraphs}</ModalContent>
				<ModalFooter>
					<ModalCloseButton />
				</ModalFooter>
			</Modal>
		</>
	);
}

function FormModal() {
	const [isFormOpen, setIsFormOpen] = createSignal(false);
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
	const handleSubmit = (e: SubmitEvent & { data: TypedFormData<keyof typeof FormNames> }) => {
		e.preventDefault();
		const data = e.data;
		setFormData({
			name: data.get('name') as string,
			email: data.get('email') as string,
			message: data.get('message') as string,
			terms: data.get('terms') as string,
		});
	};

	return (
		<>
			<Button onClick={[setIsFormOpen, true]}>Open Modal (Form)</Button>
			<Modal open={isFormOpen()} onClose={[setIsFormOpen, false]}>
				<ModalTitle>Form Example</ModalTitle>
				<ModalFormContent
					names={FormNames}
					onSubmit={handleSubmit}
					onSubmitSuccess={[setIsResultsOpen, true]}
				>
					<LabelledInput label="Name">
						<Input name={FormNames.name} required />
					</LabelledInput>
					<LabelledInput label="Email">
						<Input name={FormNames.email} type="email" required />
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
								</div>
							</CardContent>
						</Card>
					</output>
				</ModalContent>
			</Modal>
		</>
	);
}

function ScrollableForm() {
	const [isFormOpen, setIsFormOpen] = createSignal(false);

	const FormNames = {
		field1: 'field1' as const,
		field2: 'field2' as const,
	};

	const handleSubmit = (e: SubmitEvent & { data: TypedFormData<keyof typeof FormNames> }) => {
		e.preventDefault();
		setIsFormOpen(false);
	};

	return (
		<>
			<Button onClick={[setIsFormOpen, true]}>Open Form Modal (Scrollable)</Button>
			<Modal open={isFormOpen()} onClose={[setIsFormOpen, false]}>
				<ModalTitle>Form Example</ModalTitle>
				<ModalFormContent names={FormNames} onSubmit={handleSubmit}>
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
			</Modal>
		</>
	);
}

function AsyncForm() {
	const [isFormOpen, setIsFormOpen] = createSignal(false);

	const FormNames = {
		name: 'name' as const,
		message: 'message' as const,
		shouldError: 'shouldError' as const,
	};

	const handleSubmit = async (
		e: SubmitEvent & { data: TypedFormData<keyof typeof FormNames> },
	) => {
		e.preventDefault();
		await new Promise((resolve) => setTimeout(resolve, 2500));
		if (e.data.get('shouldError')) {
			throw new Error('Forced error');
		}
	};

	return (
		<>
			<Button onClick={[setIsFormOpen, true]}>Open Modal (Async Form)</Button>
			<Modal open={isFormOpen()} onClose={[setIsFormOpen, false]}>
				<ModalTitle>Async Form Example</ModalTitle>
				<ModalFormContent names={FormNames} onSubmit={handleSubmit}>
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
			</Modal>
		</>
	);
}

function ModalDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Modal</CardTitle>
				<CardDescription>Modal dialog with backdrop</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-group">
					<SimpleModal />
					<LongModal />
					<FormModal />
					<ScrollableForm />
					<AsyncForm />
				</div>
			</CardContent>
		</Card>
	);
}

export { ModalDemo };
