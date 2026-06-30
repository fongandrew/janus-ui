/** `Drawer` (§13.7) — `c-drawer`, an edge-anchored `<dialog>`. Same wiring as `Modal`. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { drawer } from '~/lib2/dom/components/drawer';

export type DrawerSide = 'start' | 'end' | 'top' | 'bottom';

export interface DrawerProps extends ComponentProps<'dialog'> {
	id: string;
	side?: DrawerSide | undefined;
}

export function Drawer(props: DrawerProps) {
	const [local, rest] = splitProps(props, ['side', 'class']);
	return (
		<dialog
			{...drawer()}
			{...rest}
			class={cx('c-drawer', local.side && `c-drawer--${local.side}`, local.class)}
		/>
	);
}
