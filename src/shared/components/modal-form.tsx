import '~/shared/components/modal-form.css';

import { createEffect, createSignal, type JSX, Show, splitProps, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { type ButtonProps } from '~/shared/components/button';
import { Form, type FormProps } from '~/shared/components/form';
import { SubmitButton } from '~/shared/components/form-buttons';
import { getControlElements, isTouched } from '~/shared/components/form-element-control';
import { ModalCloseButton, ModalContent } from '~/shared/components/modal';
import { ModalContext } from '~/shared/components/modal-context';
import { ModalSpeedBump, type ModalSpeedBumpProps } from '~/shared/components/modal-speed-bump';
import { generateId } from '~/shared/utility/id-generator';
import { combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { T } from '~/shared/utility/text/t-components';

export interface ModalFormContentProps<TNames extends string> extends FormProps<TNames> {
	/** Automatically close form on submit? Defaults to true */
	closeOnSubmit?: boolean | undefined;
	/** Automatically reset form when modal is closed? */
	resetOnClose?: boolean | undefined;
	/**
	 * By default, the form will render a speed bump if any of the inputs have been
	 * edited and a request to close the form is made. Pass a component to render
	 * a different speed bump or false to not interrupt the close at all.
	 */
	renderSpeedBump?: ((props: ModalSpeedBumpProps) => JSX.Element) | false | undefined;
	/**
	 * Extra props to pass to modal speed bump (if any)
	 */
	speedBumpProps?: ModalSpeedBumpProps | undefined;
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
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('ModalFormContent must be used within a Modal');
	}

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
	createEffect((prevOpen?: boolean | undefined) => {
		const open = context?.open();
		if (prevOpen && !open && resetOnClose()) {
			form?.reset();
		}
		return open;
	});

	// Show speed bump if there are dirty elements
	const [showSpeedBump, setShowSpeedBump] = createSignal(false);
	context?.onRequestClose(() => {
		if (props.renderSpeedBump === false) return true;
		if (!form) return true;
		for (const element of getControlElements(form)) {
			if (isTouched(element)) {
				setShowSpeedBump(true);
				return false;
			}
		}
		return true;
	});

	const id = generateId('modal-form');
	return (
		<>
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
			<Show when={props.renderSpeedBump !== false}>
				<Dynamic
					component={
						(props.renderSpeedBump as typeof ModalSpeedBump | undefined) ??
						ModalSpeedBump
					}
					open={showSpeedBump()}
					onClose={[setShowSpeedBump, false]}
					{...props.speedBumpProps}
				/>
			</Show>
		</>
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
