import cx from 'classix';
import { createEffect, createSignal, splitProps, useContext } from 'solid-js';

import { Button, type ButtonProps } from '~/shared/components/button';
import { Form, type FormProps } from '~/shared/components/form';
import { ModalContent } from '~/shared/components/modal';
import { ModalContext } from '~/shared/components/modal-context';
import { generateId } from '~/shared/utility/id-generator';

/**
 * Child component for forms inside modals
 */
export function ModalFormContent<TNames extends string>(props: FormProps<TNames>) {
	const [modalProps, formProps] = splitProps(props, ['class', 'classList']);

	const id = generateId('modal-form');
	return (
		<ModalContent {...modalProps}>
			<Form id={id} method="dialog" {...formProps}>
				{props.children}
			</Form>
		</ModalContent>
	);
}

export function ModalSubmitButton(props: ButtonProps) {
	const modalContext = useContext(ModalContext);
	const [formId, setFormId] = createSignal<string | undefined>();

	createEffect(() => {
		const form = modalContext?.form?.();
		if (!form) return;

		let formId = form.id;
		if (!formId) {
			formId = generateId('modal-form');
			form.id = formId;
		}
		setFormId(formId);
	});

	return (
		<Button
			{...props}
			form={props.form || formId()}
			class={cx('c-button--primary', props.class)}
		>
			{props.children}
		</Button>
	);
}
