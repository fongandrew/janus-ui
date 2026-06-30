/** `Modal` (§13.7) — `c-modal`, a centered `<dialog>` wired with `dom/components/modal`. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { modal } from '~/lib2/dom/components/modal';

export interface ModalProps extends ComponentProps<'dialog'> {
	/** Required so `commandfor` triggers (or a sibling `<ModalSpeedBump>`) can target it. */
	id: string;
}

export function Modal(props: ModalProps) {
	const [local, rest] = splitProps(props, ['class']);
	return <dialog {...modal()} {...rest} class={cx('c-modal', local.class)} />;
}
