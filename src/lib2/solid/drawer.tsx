/**
 * Drawer (§13.7) — `<dialog class="c-drawer o-dialog c-drawer--{side}">`,
 * same behavior tokens as Modal.
 */
import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

const SIDE_CLASSES: Record<DrawerSide, string> = {
	left: 'c-drawer--left',
	right: 'c-drawer--right',
	top: 'c-drawer--top',
	bottom: 'c-drawer--bottom',
};

export interface DrawerProps extends ComponentProps<'dialog'> {
	/** Required so commandfor triggers can target the dialog. */
	id: string;
	side: DrawerSide;
	onClose?: (() => void) | undefined;
	'data-js'?: string | undefined;
}

export function Drawer(props: DrawerProps) {
	const [local, rest] = splitProps(props, ['side', 'onClose', 'class', 'data-js', 'ref']);
	return (
		<dialog
			{...rest}
			class={cx('c-drawer o-dialog', SIDE_CLASSES[local.side], local.class)}
			data-js={attrs('t-request-close t-restore-focus', local['data-js'])}
			ref={(el) => {
				if (typeof local.ref === 'function') local.ref(el);
				const handleClose = () => local.onClose?.();
				el.addEventListener('close', handleClose);
				onCleanup(() => el.removeEventListener('close', handleClose));
			}}
		/>
	);
}
