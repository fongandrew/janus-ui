import { type JSX } from 'solid-js';

import { generateId } from '~/shared/utility/id-generator';

export interface ModalFormProps extends JSX.HTMLAttributes<HTMLFormElement> {
	/** Require children */
	children: JSX.Element;
}

/**
 * Child components for forms inside modals
 */
export function ModalForm(props: ModalFormProps) {
	const id = generateId('modal-form');
	return (
		<form id={id} method="dialog" {...props}>
			{props.children}
		</form>
	);
}
