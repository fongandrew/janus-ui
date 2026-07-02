/**
 * Modal (§13.7) — `<dialog class="c-modal o-dialog">` with the request-close
 * chain, focus restore, and scroll shadows. Open it with a `commandfor`
 * trigger (`<Button commandfor={id} command="show-modal">`).
 */
import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';

export interface ModalProps extends ComponentProps<'dialog'> {
	/** Required so commandfor triggers can target the dialog. */
	id: string;
	onClose?: (() => void) | undefined;
	'data-js'?: string | undefined;
}

export function Modal(props: ModalProps) {
	const [local, rest] = splitProps(props, ['onClose', 'class', 'data-js', 'ref']);
	return (
		<dialog
			{...rest}
			class={cx('c-modal o-dialog', local.class)}
			data-js={attrs('t-request-close t-restore-focus t-scroll-shadow', local['data-js'])}
			ref={(el) => {
				if (typeof local.ref === 'function') local.ref(el);
				const handleClose = () => local.onClose?.();
				el.addEventListener('close', handleClose);
				onCleanup(() => el.removeEventListener('close', handleClose));
			}}
		/>
	);
}

export function ModalHeader(props: ComponentProps<'header'>) {
	const [local, rest] = splitProps(props, ['class', 'children']);
	return (
		<header {...rest} class={cx('c-modal__header', local.class)}>
			<h2>
				<span class="c-modal__mark" aria-hidden="true">
					◆
				</span>
				{local.children}
			</h2>
		</header>
	);
}

export function ModalBody(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div {...rest} class={cx('c-modal__body', local.class)} />;
}

export function ModalFooter(props: ComponentProps<'footer'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <footer {...rest} class={cx('c-modal__footer', local.class)} />;
}

export interface ModalCloseButtonProps extends ComponentProps<'button'> {
	'data-js'?: string | undefined;
}

/** The pinned × — closes the ancestor dialog through the request-close chain. */
export function ModalCloseButton(props: ModalCloseButtonProps) {
	const [local, rest] = splitProps(props, ['class', 'data-js', 'children']);
	return (
		<button
			type="button"
			aria-label="Close"
			{...rest}
			class={cx(
				'c-button c-button--icon t-radius-full o-input-box c-modal__close',
				local.class,
			)}
			data-js={attrs('c-modal__close', local['data-js'])}
		>
			{local.children ?? '×'}
		</button>
	);
}
