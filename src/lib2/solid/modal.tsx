import cx from 'classix';
import { type ComponentProps, type JSX, onCleanup, splitProps } from 'solid-js';

import { mergeRefs } from '~/lib2/solid/utils';

export interface ModalProps extends Omit<ComponentProps<'dialog'>, 'onClose' | 'title'> {
	/** Required so a trigger can target it via `commandfor` / `command`. */
	id: string;
	/** Heading rendered in the modal header. */
	title?: JSX.Element;
	/** Fired on the native dialog `close` event (wired via ref). */
	onClose?: (event: Event) => void;
	closeLabel?: string;
}

/**
 * Modal (§10.2) — a `<dialog>` with request-close + restore-focus behaviors and
 * a standard header (close button) / body layout. Open it with a trigger
 * carrying `command="show-modal" commandfor={id}`.
 */
export function Modal(props: ModalProps) {
	const [local, rest] = splitProps(props, [
		'id',
		'title',
		'onClose',
		'closeLabel',
		'class',
		'children',
		'ref',
	]);

	const setRef = mergeRefs<HTMLDialogElement>((el) => {
		if (local.onClose) {
			const handler = (event: Event) => local.onClose?.(event);
			el.addEventListener('close', handler);
			onCleanup(() => el.removeEventListener('close', handler));
		}
	}, local.ref);

	return (
		<dialog
			{...rest}
			ref={setRef}
			id={local.id}
			data-js="t-request-close t-restore-focus"
			class={cx('c-modal o-dialog', local.class)}
		>
			<div class="c-modal__header">
				<button
					type="button"
					class="c-button c-button--icon o-input-box c-modal__close"
					data-js="c-modal__close"
					aria-label={local.closeLabel ?? 'Close'}
				>
					✕
				</button>
				{local.title !== undefined ? <h2>{local.title}</h2> : null}
			</div>
			<div class="c-modal__body">{local.children}</div>
		</dialog>
	);
}
