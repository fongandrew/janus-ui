/**
 * Form wrappers (§13.5) — thin attribute renderers over `~/lib2/dom/form`.
 * `FormContext` carries only the form's `id` (an ordinary read-only
 * context, not the rejected `PropModContext` prop-transform shape, §13.1)
 * so `<SubmitButton>` can target the form from a portal (a modal footer).
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

import { addSubmitHandler, type SubmitHandler } from '~/lib2/dom';
import { attrs } from '~/lib2/solid/aria';
import { Button, type ButtonProps } from '~/lib2/solid/button';
import { combineRefs } from '~/lib2/solid/combine-refs';

export interface FormContextValue {
	id: string;
}

export const FormContext = createContext<FormContextValue>();

export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	onSubmit?: SubmitHandler | undefined;
	/** Name of a submit handler registered via `registerSubmitHandler()`. */
	submitHandler?: string | undefined;
	'data-js'?: string | undefined;
}

export function Form(props: FormProps) {
	const [local, rest] = splitProps(props, ['onSubmit', 'submitHandler', 'data-js', 'id', 'ref']);
	// eslint-disable-next-line solid/reactivity -- id is captured once and stays stable
	const id = local.id ?? createUniqueId();

	return (
		<FormContext.Provider value={{ id }}>
			<form
				{...rest}
				id={id}
				data-js={attrs('t-validate t-submit', local['data-js'])}
				data-submit-handler={local.submitHandler}
				noValidate
				ref={combineRefs(local.ref, (el: HTMLFormElement) => {
					if (local.onSubmit) {
						onCleanup(addSubmitHandler(el, local.onSubmit));
					}
				})}
			/>
		</FormContext.Provider>
	);
}

export interface DivWithDataJsProps extends ComponentProps<'div'> {
	'data-js'?: string | undefined;
}

/** Cross-field validation grouping (§12.1) -- touched siblings re-validate when one changes. */
export function FormGroup(props: DivWithDataJsProps) {
	const [local, rest] = splitProps(props, ['data-js']);
	return <div {...rest} data-js={attrs('t-validate-group', local['data-js'])} />;
}

/** Form-wide error display. `setFormError()` finds it via `data-form-error`. */
export function FormError(props: DivWithDataJsProps) {
	const [local, rest] = splitProps(props, ['class', 'data-js']);
	return (
		<div
			{...rest}
			data-js={attrs('t-validate-error', local['data-js'])}
			data-form-error
			role="alert"
			aria-atomic="true"
			class={cx('c-alert', 'v-colors-danger', local.class)}
		/>
	);
}

/** Submit button. Reads the form id from context so it can render outside the `<form>` (modal footers, portals). */
export function SubmitButton(props: ButtonProps) {
	const ctx = useContext(FormContext);
	return <Button type="submit" {...props} form={ctx?.id ?? props.form} />;
}
