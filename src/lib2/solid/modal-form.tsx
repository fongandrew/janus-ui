import { type JSX, splitProps } from 'solid-js';

import { ca, concat } from '~/lib2/dom';
import { Form, type FormProps } from '~/lib2/solid/form';

export interface ModalFormProps extends FormProps {
	/** default true */
	closeOnSuccess?: boolean;
	/** default true */
	resetOnClose?: boolean;
	/** default 'submit' — the primary action stays reachable while fields scroll. */
	stickyFooter?: 'none' | 'submit' | 'bar';
}

/**
 * ModalForm (§13.6) — composes the three modal-form behaviors onto a Form.
 * Defaults are opinionated (all on), individually opt-outable.
 */
export function ModalForm(props: ModalFormProps) {
	const [local, rest] = splitProps(props, ['closeOnSuccess', 'resetOnClose', 'stickyFooter']);
	const extras = [
		local.closeOnSuccess !== false && 't-close-on-success',
		local.resetOnClose !== false && 't-reset-on-close',
	]
		.filter(Boolean)
		.join(' ');
	return <Form {...(ca(rest as Record<string, unknown>, { 'data-js': concat(extras) }) as FormProps)} />;
}

export interface ModalSpeedBumpProps {
	message?: JSX.Element;
	keepLabel?: JSX.Element;
	discardLabel?: JSX.Element;
}

/**
 * ModalSpeedBump (§13.6) — a nested <dialog> carrying the c-modal__speed-bump
 * behavior; the parent modal's requestClose dispatcher auto-discovers it.
 */
export function ModalSpeedBump(props: ModalSpeedBumpProps) {
	return (
		<dialog class="c-modal o-dialog c-modal__speed-bump" data-js="c-modal__speed-bump">
			<div class="c-modal__body">
				<form method="dialog" class="o-stack">
					<p>{props.message ?? 'You have unsaved changes.'}</p>
					<div class="o-row">
						<button value="cancel" class="c-button o-input-box">
							{props.keepLabel ?? 'Keep editing'}
						</button>
						<button value="discard" class="c-button o-input-box v-colors-danger">
							{props.discardLabel ?? 'Discard'}
						</button>
					</div>
				</form>
			</div>
		</dialog>
	);
}
