import { createEffect, createSignal, Show, useContext } from 'solid-js';

import { DangerAlert } from '~/shared/components/alert';
import { FormContext } from '~/shared/components/form-context';

/**
 * A component that displays an error message if the form has an error.
 * The error message is passed through context from the FormContext provider.
 */
export function FormError() {
	const context = useContext(FormContext);
	const error = context?.errorSig[0];

	const [alertRef, setAlertRef] = createSignal<HTMLDivElement | null>(null);
	createEffect(() => {
		const alert = alertRef();
		if (error?.() && alert) {
			alert.scrollIntoView({ block: 'nearest' });
		}
	});

	return (
		<Show when={error?.()}>
			<DangerAlert ref={setAlertRef}>{error?.()}</DangerAlert>
		</Show>
	);
}
