import {
	type ComponentProps,
	createMemo,
	createUniqueId,
	onCleanup,
	splitProps,
	useContext,
} from 'solid-js';
import { isServer } from 'solid-js/web';

import { DangerAlert } from '~/lib/components/alert';
import {
	createSubmitHandler,
	formResetChildren,
	formResetOnSuccess,
	type SubmitHandler,
} from '~/lib/components/callbacks/form';
import { FormContext } from '~/lib/components/form-context';
import { attrs } from '~/lib/utility/attribute-list';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { mountAttr } from '~/lib/utility/callback-attrs/no-js';
import { FORM_CONTROL_ERROR_ATTR, validateReset } from '~/lib/utility/callback-attrs/validate';
import { createAuto } from '~/lib/utility/solid/auto-prop';

export interface FormProps<TNames extends string> extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	/** ID for form-wide error element */
	errorId?: string | undefined;
	/** Lookup map for field names, mostly used to type form field names */
	names?: Record<any, TNames> | undefined;
	/** Typed submit handler */
	onSubmit?: SubmitHandler<TNames, []> | undefined;
	/** Should form reset on success? Defaults to true. */
	resetOnSuccess?: boolean | undefined;
}

/**
 * Form component with built-in error handling and validation
 *
 * @example
 * ```tsx
 * // Async form with typed form fields
 * const FormNames = {
 * 		name: 'name',
 * 		message: 'message',
 * };
 *
 * // Form with async submission handler
 * const handleSubmit = async (e: TypedSubmitEvent<typeof FormNames[keyof typeof FormNames]>) => {
 * 		e.preventDefault();
 * 		const data = e.data;
 *
 * 		// Custom validation
 * 		if (String(data.get(FormNames.name)).toLowerCase() === 'bob') {
 * 			return {
 * 				ok: false,
 * 				fieldErrors: {
 * 					name: 'We already have a Bob',
 * 				},
 * 			};
 * 		}
 *
 * 		// Process form data...
 * };
 *
 * 	<Form
 * 		names={FormNames}
 * 		onSubmit={handleSubmit}
 * 	>
 * 		<LabelledInput label="Name" required>
 * 			<Input name={FormNames.name} />
 * 		</LabelledInput>
 * 		<LabelledInput label="Message" required>
 * 			<Textarea name={FormNames.message} />
 * 		</LabelledInput>
 * 		<SubmitButton />
 * 		<ResetButton />
 * 	</Form>
 * ```
 */
export function Form<TNames extends string>(props: FormProps<TNames>) {
	const context = useContext(FormContext);
	const id = createMemo(() => {
		const contextId = context?.id();
		if (props.id && contextId && props.id !== contextId) {
			// Complain if multiple inconsistent IDs because IDs are often referenced by
			// other elements. We don't do this with context.action() though because
			// overriding an action doesn't have the same subtle issue.
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
			noValidate={isServer ? undefined : true}
			action={context?.action()}
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
			<FormContext.Provider value={context ?? { id, action: () => props.action }}>
				<div class="o-stack">
					<DangerAlert alertId={errorId()} {...{ [FORM_CONTROL_ERROR_ATTR]: '' }} />
					{rest.children}
				</div>
			</FormContext.Provider>
		</form>
	);
}
