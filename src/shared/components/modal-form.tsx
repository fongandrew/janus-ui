import { createMemo, createUniqueId, type JSX, Show, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { type ButtonProps } from '~/shared/components/button';
import {
	modalFormCloseOnSuccess,
	modalFormMaybeShowSpeedBump,
	modalFormResetOnClose,
} from '~/shared/components/callbacks/modal-form';
import { Form, type FormProps } from '~/shared/components/form';
import { SubmitButton } from '~/shared/components/form-buttons';
import { ModalCloseButton, ModalContent } from '~/shared/components/modal';
import { ModalSpeedBump, type ModalSpeedBumpProps } from '~/shared/components/modal-speed-bump';
import { T } from '~/shared/components/t-components';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

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
	speedBumpProps?: Partial<ModalSpeedBumpProps> | undefined;
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

	const speedBumpId = createMemo(() => props.speedBumpProps?.id ?? createUniqueId());

	return (
		<>
			<ModalContent
				{...modalProps}
				{...callbackAttrs(modalProps, modalFormMaybeShowSpeedBump(speedBumpId()))}
			>
				<Form
					{...formProps}
					{...callbackAttrs(
						formProps,
						closeOnSubmit() && modalFormCloseOnSuccess,
						resetOnClose() && modalFormResetOnClose,
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
					{...props.speedBumpProps}
					id={speedBumpId()}
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
