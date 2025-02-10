import { createMemo, createRenderEffect, type JSX, splitProps, useContext } from 'solid-js';
import { isServer } from 'solid-js/web';

import { createFormContext, FormContext } from '~/shared/components/form-context';
import {
	getControlElements,
	resetControl,
	validate,
} from '~/shared/components/form-element-control';
import { FormError } from '~/shared/components/form-error';
import { Stack } from '~/shared/components/stack';
import { type BoundCallbackUnion, callBound } from '~/shared/utility/bound-callbacks';
import { generateId } from '~/shared/utility/id-generator';
import { evtWin } from '~/shared/utility/multi-view';
import { handleEvent } from '~/shared/utility/solid/handle-event';
/** Same as form data but the names are typed */
export interface TypedFormData<TNames> {
	append(key: TNames, value: string | Blob): void;
	append(key: TNames, value: Blob, filename?: string): void;
	delete(key: TNames): void;
	get(key: TNames): FormDataEntryValue | null;
	getAll(key: TNames): FormDataEntryValue[];
	has(key: TNames): boolean;
	set(key: TNames, value: string | Blob): void;
	set(key: TNames, value: Blob, filename?: string): void;
}

export type TypedSubmitEvent<TNames> = SubmitEvent & { data: TypedFormData<TNames> };

export interface FormProps<TNames extends string>
	extends Omit<JSX.FormHTMLAttributes<HTMLFormElement>, 'onReset' | 'onSubmit'> {
	/** This prop is unused but just used to infer and type-check form names */
	names: Record<string, TNames>;
	/** Form reset handler */
	onReset?: ((event: Event) => void | Promise<void>) | undefined;
	/** Form submit handler -- handler should return false or throw to indicate submission error */
	onSubmit?:
		| ((event: TypedSubmitEvent<TNames>) => boolean | void | Promise<boolean | void>)
		| undefined;
	/** Handler for submit success */
	onSubmitSuccess?: JSX.EventHandlerUnion<HTMLFormElement, TypedSubmitEvent<TNames>> | undefined;
	/** Handler for submit error */
	onSubmitError?: BoundCallbackUnion<void, [string, TypedSubmitEvent<TNames>]> | undefined;
}

export function Form<TNames extends string>(props: FormProps<TNames>) {
	const [local, rest] = splitProps(props, ['names', 'onReset', 'onSubmit']);

	const context = useContext(FormContext) ?? createFormContext();
	const id = createMemo(() => props.id ?? generateId('form'));
	createRenderEffect(() => {
		context.idSig[1](id());
	});

	const handleReset = async (event: Event) => {
		const form = event.target as HTMLFormElement;

		// Reset touched state in all controls in form
		const controls = getControlElements(form);
		for (const control of controls) {
			resetControl(control);
		}

		local.onReset?.(event);
	};

	const handleError = (error: Error | string, event: TypedSubmitEvent<TNames>) => {
		const errStr = typeof error === 'string' ? error : (error?.message ?? String(error));
		context.errorSig[1](errStr);
		callBound(props.onSubmitError, errStr, event);
	};

	const doSubmit = async (event: SubmitEvent) => {
		const form = event.target as HTMLFormElement;
		const controls = getControlElements(form);

		// Revalidate all controls in the form. Validation may be async so need
		// special handling for that scenario.
		const validationPromises: Promise<boolean>[] = [];
		for (const control of controls) {
			const validationResult = validate(event, control);
			if (validationResult instanceof Promise) {
				validationPromises.push(validationResult);
			}
		}

		// Presence of either client-side onSubmit or async validation implies
		// we're not relying on form's default behavior
		if (local.onSubmit || validationPromises.length) {
			event.preventDefault();
		}

		// Wait for validation and if any errors, stop submission
		context.errorSig[1](null);
		const results = await Promise.all(validationPromises);
		for (const result of results) {
			if (result === false) {
				// Focus first invalid control
				for (const control of controls) {
					if (control.matches(':invalid, [aria-invalid="true"]')) {
						control.focus?.();
						break;
					}
				}
				return false;
			}
		}

		const data = new FormData(form);
		const typedEvent = Object.assign(event, { data });
		try {
			const result = await local.onSubmit?.(typedEvent);
			if (result === false) {
				handleError('Form submission failed', typedEvent);
				return false;
			}
			if (typeof result === 'string') {
				handleError(result, typedEvent);
				return false;
			}
			form.reset(); // Manually reset data
			handleEvent(form, props.onSubmitSuccess, typedEvent);
			return true;
		} catch (error) {
			handleError(error as Error, typedEvent);
			return false;
		}
	};

	const handleSubmit = async (event: SubmitEvent) => {
		const window = evtWin(event);
		if (!window) return;

		// Defer setting submitting state for one tick in case submission or validation
		// completes very quickly (possible if promise immediately resolves)
		const setSubmittingReq = window.requestAnimationFrame(() => {
			// Set form as busy
			context.busySig[1](true);
		});

		try {
			return await doSubmit(event);
		} finally {
			// Clear form busy state
			context.busySig[1](false);
			window.cancelAnimationFrame(setSubmittingReq);
		}
	};

	return (
		<FormContext.Provider value={context}>
			<form
				// By default, don't use browser validation and use our own but can be
				// forced on via a prop
				noValidate={!isServer}
				onSubmit={handleSubmit}
				onReset={handleReset}
				id={id()}
				aria-busy={context.busySig[0]()}
				{...rest}
			>
				<Stack>
					<FormError />
					{rest.children}
				</Stack>
			</form>
		</FormContext.Provider>
	);
}
