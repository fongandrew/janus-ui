/**
 * `Drawer` (§13.7). An edge-anchored `<dialog>` with side variants. Same close /
 * focus-restore wiring as `Modal`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps extends ComponentProps<'dialog'> {
	id: string;
	side?: DrawerSide;
}

export function Drawer(props: DrawerProps) {
	const [local, rest] = splitProps(props, ['side', 'class']);
	return (
		<dialog
			{...rest}
			data-js="t-request-close t-restore-focus"
			class={cx('c-drawer', `c-drawer--${local.side ?? 'right'}`, local.class)}
		/>
	);
}
