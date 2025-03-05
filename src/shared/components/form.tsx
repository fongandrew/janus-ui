import { type JSX, splitProps } from 'solid-js';

import { DangerAlert } from '~/shared/components/alert';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { createAuto, createAutoId } from '~/shared/utility/solid/auto-prop';

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
	/** ID for form-wide error element */
	errorId?: string | undefined;
}

export function Form(props: FormProps) {
	const id = createAutoId(props);
	const errorId = createAuto(props, 'errorId');
	const [, rest] = splitProps(props, ['errorId']);

	return (
		<form id={id()} {...handlerProps(props)}>
			<div class="o-stack">
				<DangerAlert id={errorId()} />
				{rest.children}
			</div>
		</form>
	);
}
