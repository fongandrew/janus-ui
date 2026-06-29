/**
 * `Modal` (§13.7). A native `<dialog class="c-modal">` wired for managed close +
 * focus restore. Opened via a `commandfor` trigger (so `id` is required) or
 * imperatively. The header / body / footer subcomponents tile the transparent
 * scroll container (§10.2).
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export type ModalWidth = 'default' | 'container' | 'narrow';

export interface ModalProps extends ComponentProps<'dialog'> {
	/** Required so a `commandfor` button can target the modal. */
	id: string;
	width?: ModalWidth;
}

export function Modal(props: ModalProps) {
	const [local, rest] = splitProps(props, ['class', 'width']);
	return (
		<dialog
			{...rest}
			data-js="t-request-close t-restore-focus"
			class={cx(
				'c-modal',
				local.width === 'narrow' && 'c-modal--narrow',
				local.width === 'container' && 'c-modal--container',
				local.class,
			)}
		/>
	);
}

export function ModalHeader(props: ComponentProps<'div'>) {
	return <div {...props} class={cx('c-modal__header', props.class)} />;
}

export function ModalBody(props: ComponentProps<'div'>) {
	return <div {...props} data-js="t-scroll-shadow" class={cx('c-modal__body', props.class)} />;
}

export function ModalFooter(props: ComponentProps<'div'>) {
	return <div {...props} class={cx('c-modal__footer', props.class)} />;
}
