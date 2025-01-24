import { createEffect, splitProps, useContext } from 'solid-js';

import { type ButtonProps } from '~/shared/components/button';
import { Form, type FormProps } from '~/shared/components/form';
import { SubmitButton } from '~/shared/components/form-buttons';
import { ModalCloseButton, ModalContent } from '~/shared/components/modal';
import { ModalContext } from '~/shared/components/modal-context';
import { generateId } from '~/shared/utility/id-generator';
import { combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { T } from '~/shared/utility/text/t-components';

export interface ModalFormContentProps<TNames extends string> extends FormProps<TNames> {
	/** Automatically close form on submit? Defaults to true */
	closeOnSubmit?: boolean | undefined;
	/** Automatically reset form when modal is closed? */
	resetOnClose?: boolean | undefined;
}

/**
 * Handler to automatically close parent modal when form is submitted
 */
export function closeParentModal(e: SubmitEvent) {
	const form = e.target as HTMLFormElement | null;
	const dialog = form?.closest(':modal') as HTMLDialogElement | null;
	dialog?.close();
}

/**
 * Child component for forms inside modals
 */
export function ModalFormContent<TNames extends string>(props: ModalFormContentProps<TNames>) {
	const [local, modalProps, formProps] = splitProps(
		props,
		['closeOnSubmit', 'resetOnClose'],
		['class', 'classList'],
	);

	// Defaults
	const closeOnSubmit = () => local.closeOnSubmit ?? true;
	const resetOnClose = () => local.resetOnClose ?? true;

	// Ref
	let form: HTMLFormElement | undefined;
	const setForm = (el: HTMLFormElement | undefined) => {
		form = el;
	};

	// Reset on close
	const context = useContext(ModalContext);
	createEffect((prevOpen?: boolean | undefined) => {
		const open = context?.open();
		if (prevOpen && !open && resetOnClose()) {
			form?.reset();
		}
		return open;
	});

	const id = generateId('modal-form');
	return (
		<ModalContent {...modalProps}>
			<Form
				id={id}
				{...formProps}
				ref={combineRefs(setForm, formProps.ref)}
				onSubmitSuccess={combineEventHandlers(
					closeOnSubmit() && closeParentModal,
					props.onSubmitSuccess,
				)}
			>
				{props.children}
			</Form>
		</ModalContent>
	);
}

/**
 * Cancel (and close) the current modal form
 */
export function ModalCancelButton(props: ButtonProps) {
	return <ModalCloseButton {...props}>{props.children ?? <T>Cancel</T>}</ModalCloseButton>;
}

/**
 * Submit the current modal form
 */
export function ModalSubmitButton(props: ButtonProps) {
	return <SubmitButton {...props} />;
}
