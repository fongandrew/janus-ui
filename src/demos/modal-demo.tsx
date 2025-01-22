import { type Component, createSignal, Show } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { type TypedFormData } from '~/shared/components/form';
import { Group } from '~/shared/components/group';
import { Input } from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledControl } from '~/shared/components/labelled-control';
import { Modal, ModalContent, ModalFooter, ModalTitle } from '~/shared/components/modal';
import {
	ModalCancelButton,
	ModalFormContent,
	ModalSubmitButton,
} from '~/shared/components/modal-form';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';

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

export { ModalDemo };
