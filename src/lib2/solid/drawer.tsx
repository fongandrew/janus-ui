import cx from 'classix';
import { type ComponentProps, type JSX, onCleanup, splitProps } from 'solid-js';

import { mergeRefs } from '~/lib2/solid/utils';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

const SIDE_CLASS: Record<DrawerSide, string> = {
	left: 'c-drawer--left',
	right: 'c-drawer--right',
	top: 'c-drawer--top',
	bottom: 'c-drawer--bottom',
};

export interface DrawerProps extends Omit<ComponentProps<'dialog'>, 'onClose' | 'title'> {
	/** Required so a trigger can target it via `commandfor` / `command`. */
	id: string;
	/** Edge the drawer slides in from. */
	side?: DrawerSide;
	title?: JSX.Element;
	onClose?: (event: Event) => void;
	closeLabel?: string;
}

/**
 * Drawer (§10.2) — an edge-anchored `<dialog>`; same behaviors and layout as
 * `Modal` with a `c-drawer--{side}` variant.
 */
export function Drawer(props: DrawerProps) {
	const [local, rest] = splitProps(props, [
		'id',
		'side',
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
			class={cx('c-drawer o-dialog', SIDE_CLASS[local.side ?? 'right'], local.class)}
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
