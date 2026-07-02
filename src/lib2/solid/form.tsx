/**
 * Form wrappers (§13.5) — attribute renderers over the dom/ form engine.
 * FormContext carries the form id only (read-only context, not a prop-mod),
 * so SubmitButton can render outside the <form> (modal footers, portals)
 * while still targeting it via form={id}.
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

export interface FormContextValue {
	id: string;
}

export const FormContext = createContext<FormContextValue>();

export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	/** Inline closure submit handler. Stored in dom/'s WeakMap via ref. */
	onSubmit?: SubmitHandler | undefined;
	/** Name of a submit handler registered via registerSubmitHandler(). */
	submitHandler?: string | undefined;
	'data-js'?: string | undefined;
}

export function Form(props: FormProps) {
	const [local, rest] = splitProps(props, ['onSubmit', 'submitHandler', 'id', 'data-js', 'ref']);
	const fallbackId = createUniqueId();
	const context: FormContextValue = {
		get id() {
			return local.id ?? fallbackId;
		},
	};
	return (
		<FormContext.Provider value={context}>
			<form
				{...rest}
				id={context.id}
				data-js={attrs('t-validate t-submit', local['data-js'])}
				data-submit-handler={local.submitHandler}
				noValidate
				ref={(el) => {
					if (typeof local.ref === 'function') local.ref(el);
					// The ref attaches ONLY when a closure is passed; named
					// handlers go through the pure attribute path.
					if (local.onSubmit) onCleanup(addSubmitHandler(el, local.onSubmit));
				}}
			/>
		</FormContext.Provider>
	);
}

export interface FormGroupProps extends ComponentProps<'fieldset'> {
	'data-js'?: string | undefined;
}

/**
 * Cross-field validation grouping — a <fieldset> because the engine's group
 * re-validation walks to the closest fieldset carrying t-validate-group.
 */
export function FormGroup(props: FormGroupProps) {
	const [local, rest] = splitProps(props, ['data-js']);
	return <fieldset {...rest} data-js={attrs('t-validate-group', local['data-js'])} />;
}

export interface FormErrorProps extends ComponentProps<'div'> {
	'data-js'?: string | undefined;
}

/** Form-wide error display; setFormError() finds it by data-form-error. */
export function FormError(props: FormErrorProps) {
	const [local, rest] = splitProps(props, ['class', 'data-js']);
	return (
		<div
			{...rest}
			data-js={attrs('t-validate-error', local['data-js'])}
			data-form-error
			role="alert"
			aria-atomic="true"
			// c-error-message adds the :empty collapse so an errorless form
			// doesn't carry a dead alert band.
			class={cx('c-alert v-colors-danger c-error-message', local.class)}
		/>
	);
}

/** Submit button — reads the form id from context for portal/footer placement. */
export function SubmitButton(props: ButtonProps) {
	const ctx = useContext(FormContext);
	return <Button {...props} type="submit" form={ctx?.id ?? props.form} />;
}
