import cx from 'classix';
import {
	type ComponentProps,
	createContext,
	createUniqueId,
	onCleanup,
	splitProps,
	useContext,
} from 'solid-js';

import { addSubmitHandler, ca, concat, type SubmitHandler } from '~/lib2/dom';
import { Button, type ButtonProps } from '~/lib2/solid/button';

interface FormContextValue {
	id: string;
}

/** Read-only context carrying the form id (§13.5) — lets SubmitButton target
    the form from a portal / modal footer via `form={id}`. */
export const FormContext = createContext<FormContextValue>();

export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	onSubmit?: SubmitHandler;
	/** Name of a submit handler registered via registerSubmitHandler(). */
	submitHandler?: string;
}

export function Form(props: FormProps) {
	const [local, rest] = splitProps(props, ['onSubmit', 'submitHandler', 'id']);
	const id = local.id ?? createUniqueId();

	// Merge any incoming data-js (e.g. from ModalForm) with the base tokens.
	const merged = ca(rest as Record<string, unknown>, { 'data-js': concat('t-validate t-submit') });

	return (
		<FormContext.Provider value={{ id }}>
			<form
				{...merged}
				id={id}
				data-submit-handler={local.submitHandler}
				noValidate
				ref={(el) => {
					if (local.onSubmit) onCleanup(addSubmitHandler(el, local.onSubmit));
				}}
			/>
		</FormContext.Provider>
	);
}

/** Cross-field validation grouping (§13.5). */
export function FormGroup(props: ComponentProps<'div'>) {
	return <div {...props} data-js="t-validate-group" />;
}

/** Form-wide error display; setFormError() finds it by data-form-error. */
export function FormError(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			{...rest}
			data-js="t-validate-error"
			data-form-error
			role="alert"
			aria-atomic="true"
			class={cx('c-alert v-colors-danger', local.class)}
		/>
	);
}

/** Submit button — reads the form id from context for portal/footer placement. */
export function SubmitButton(props: ButtonProps) {
	const ctx = useContext(FormContext);
	return <Button {...props} type="submit" form={props.form ?? ctx?.id} />;
}
