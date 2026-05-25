import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface ModalProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	onClose?: () => void;
}

export function Modal(props: ModalProps) {
	const [local, rest] = splitProps(props, ['class', 'onClose', 'children']);
	return (
		<dialog
			class={attrs('c-modal o-dialog', local.class)}
			data-js="t-request-close t-restore-focus"
			onClose={local.onClose}
			{...rest}
		>
			{local.children}
		</dialog>
	);
}
