import { Show, useContext } from 'solid-js';

import { DangerAlert } from '~/shared/components/alert';
import { FormContext } from '~/shared/components/form-context';

export function FormError() {
	const context = useContext(FormContext);
	const error = context?.errorSig[0];

	return (
		<Show when={error?.()}>
			<DangerAlert>{error?.()}</DangerAlert>
		</Show>
	);
}
