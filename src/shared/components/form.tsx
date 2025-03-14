import { createMemo, createUniqueId, type JSX, onCleanup, splitProps, useContext } from 'solid-js';
import { isServer } from 'solid-js/web';

import { DangerAlert } from '~/shared/components/alert';
import {
	createSubmitHandler,
	formResetChildren,
	formResetOnSuccess,
	type SubmitHandler,
} from '~/shared/components/callbacks/form';
import { FormContext } from '~/shared/components/form-context';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { mountAttr } from '~/shared/utility/callback-attrs/no-js';
import { FORM_CONTROL_ERROR_ATTR, validateReset } from '~/shared/utility/callback-attrs/validate';
import { createAuto } from '~/shared/utility/solid/auto-prop';

export interface FormProps<TNames extends string>
	extends Omit<JSX.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
	/** ID for form-wide error element */
	errorId?: string | undefined;
	/** Lookup map for field names, mostly used to type form field names */
	names?: Record<any, TNames> | undefined;
	/** Typed submit handler */
	onSubmit?: SubmitHandler<TNames, []> | undefined;
	/** Should form reset on success? Defaults to true. */
	resetOnSuccess?: boolean | undefined;
}

export function Form<TNames extends string>(props: FormProps<TNames>) {
	const id = createMemo(() => {
		const contextId = useContext(FormContext)?.();
		if (props.id && contextId && props.id !== contextId) {
			throw new Error('Form ID conflicts with parent context');
		}
		return props.id ?? contextId ?? createUniqueId();
	});

	const errorId = createAuto(props, 'errorId');
	const [local, rest] = splitProps(props, ['errorId', 'names', 'onSubmit', 'resetOnSuccess']);

	const handlerId = createMemo(() => {
		if (!props.onSubmit) return;
		const handler = createSubmitHandler(createUniqueId(), props.onSubmit, props.names ?? {});
		onCleanup(handler.rm);
		return handler;
	});

	return (
		<form
			// Default HTML validation interferes with our own custom handlers
			noValidate={!isServer}
			{...rest}
			id={id()}
			aria-describedby={attrs(props['aria-describedby'], errorId())}
			{...callbackAttrs(
				rest,
				handlerId(),
				local.resetOnSuccess !== false && formResetOnSuccess,
				formResetChildren,
				validateReset,
				isServer && mountAttr('novalidate', ''),
			)}
		>
			<div class="o-stack">
				<DangerAlert alertId={errorId()} {...{ [FORM_CONTROL_ERROR_ATTR]: '' }} />
				{rest.children}
			</div>
		</form>
	);
}
