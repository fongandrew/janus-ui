import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface DrawerProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	side?: 'left' | 'right' | 'top' | 'bottom';
	onClose?: () => void;
}

export function Drawer(props: DrawerProps) {
	const [local, rest] = splitProps(props, ['side', 'class', 'onClose', 'children']);
	return (
		<dialog
			class={attrs('c-drawer o-dialog', local.side && `c-drawer--${local.side}`, local.class)}
			data-js="t-request-close t-restore-focus"
			onClose={local.onClose}
			{...rest}
		>
			{local.children}
		</dialog>
	);
}
