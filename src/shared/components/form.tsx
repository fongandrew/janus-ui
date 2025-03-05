import { createMemo, createUniqueId, type JSX, onCleanup, splitProps, useContext } from 'solid-js';

import { DangerAlert } from '~/shared/components/alert';
import { FormContext } from '~/shared/components/form-context';
import {
	createSubmitHandler,
	formResetOnSuccess,
	type SubmitHandler,
} from '~/shared/handlers/form';
import { FORM_CONTROL_ERROR_ATTR } from '~/shared/handlers/validation';
import { attrs } from '~/shared/utility/attribute-list';
import { handlerProps, unlisten } from '~/shared/utility/event-handler-attrs';
import { createAuto } from '~/shared/utility/solid/auto-prop';

export interface FormProps<TNames extends string>
	extends Omit<JSX.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
	/** ID for form-wide error element */
	errorId?: string | undefined;
	/** Lookup map for field names, mostly used to type form field names */
	names?: Record<string, TNames> | undefined;
	/** Typed submit handler */
	onSubmit?: SubmitHandler<TNames> | undefined;
	/** Should form reset on success? */
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
	const [, rest] = splitProps(props, ['errorId']);

	const handlerId = createMemo(() => {
		if (!props.onSubmit) return;
		const id = createUniqueId();
		onCleanup(() => unlisten('submit', id));
		return createSubmitHandler(id, props.onSubmit, props.names ?? {})();
	});

	return (
		<form
			id={id()}
			aria-describedby={attrs(props['aria-describedby'], errorId())}
			{...handlerProps(props, handlerId, props.resetOnSuccess && formResetOnSuccess())}
		>
			<div class="o-stack">
				<DangerAlert id={errorId()} {...{ [FORM_CONTROL_ERROR_ATTR]: '' }} />
				{rest.children}
			</div>
		</form>
	);
}
