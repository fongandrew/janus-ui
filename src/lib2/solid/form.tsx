/**
 * Form wrappers (§13.5). Each mirrors the `~/lib2/dom/form` contract — attribute
 * rendering plus a single conditional ref for the closure submit case.
 */
import cx from 'classix';
import {
	type ComponentProps,
	createContext,
	createUniqueId,
	onCleanup,
	splitProps,
	useContext,
} from 'solid-js';

import { addSubmitHandler, type SubmitHandler } from '~/lib2/dom/form';
import { Button, type ButtonProps } from '~/lib2/solid/button';

/** Carries the form's `id` so portal/footer-placed controls can target it via `form=`. */
export const FormContext = createContext<{ id: string } | undefined>(undefined);

export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	onSubmit?: SubmitHandler;
	/** Name of a submit handler registered via `registerSubmitHandler()`. */
	submitHandler?: string;
}

export function Form(props: FormProps & { 'data-js'?: string }) {
	const [local, rest] = splitProps(props, ['onSubmit', 'submitHandler', 'id', 'data-js']);
	/* eslint-disable solid/reactivity -- id and the data-js token set are resolved once at
	   creation; a stable id is required for hydration + form= targeting. */
	const id = local.id ?? createUniqueId();
	const dataJs = ['t-validate', 't-submit', local['data-js']].filter(Boolean).join(' ');
	/* eslint-enable solid/reactivity */
	return (
		<FormContext.Provider value={{ id }}>
			<form
				{...rest}
				id={id}
				data-js={dataJs}
				data-submit-handler={local.submitHandler}
				noValidate
				ref={(el) => {
					if (local.onSubmit) onCleanup(addSubmitHandler(el, local.onSubmit));
				}}
			/>
		</FormContext.Provider>
	);
}

/** Groups fields for cross-field re-validation (§12.1). */
export function FormGroup(props: ComponentProps<'div'>) {
	return <div {...props} data-js="t-validate-group" />;
}

/** Form-wide error display; `setFormError()` finds it by `data-form-error`. */
export function FormError(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			{...rest}
			data-js="t-validate-error t-empty"
			data-form-error
			role="alert"
			aria-atomic="true"
			class={cx('c-alert v-colors-danger', local.class)}
		/>
	);
}

/** Submit button — reads the form id from context for portal / footer placement. */
export function SubmitButton(props: ButtonProps) {
	const ctx = useContext(FormContext);
	const [local, rest] = splitProps(props, ['form']);
	return <Button {...rest} type="submit" form={local.form ?? ctx?.id} />;
}
