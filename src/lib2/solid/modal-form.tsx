/**
 * ModalForm + ModalSpeedBump (§13.6) — the three modal-form behaviors
 * (t-close-on-success, t-reset-on-close, the c-modal__speed-bump prompt)
 * composed over Form. Defaults are opinionated — all on, individually
 * opt-outable. The wiring between form, modal, and speed bump is entirely
 * DOM-driven; no ids, no refs, no callback registration.
 */
import { type JSX, splitProps } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';
import { Form, type FormProps } from '~/lib2/solid/form';

export interface ModalFormProps extends FormProps {
	/** Close the ancestor dialog on { ok: true }. Default true. */
	closeOnSuccess?: boolean | undefined;
	/** Reset the form when the ancestor dialog closes. Default true. */
	resetOnClose?: boolean | undefined;
}

export function ModalForm(props: ModalFormProps) {
	const [local, rest] = splitProps(props, ['closeOnSuccess', 'resetOnClose', 'data-js']);
	return (
		<Form
			{...rest}
			data-js={attrs(
				local.closeOnSuccess !== false && 't-close-on-success',
				local.resetOnClose !== false && 't-reset-on-close',
				local['data-js'],
			)}
		/>
	);
}

export interface ModalSpeedBumpProps {
	message?: JSX.Element;
	keepLabel?: JSX.Element;
	discardLabel?: JSX.Element;
}

/**
 * The "are you sure?" prompt for the parent modal. The parent's
 * request-close dispatcher auto-discovers it via DOM — no speedBumpId prop.
 */
export function ModalSpeedBump(props: ModalSpeedBumpProps) {
	return (
		<dialog class="c-modal o-dialog" data-js="c-modal__speed-bump">
			<form method="dialog" class="c-modal__body o-stack">
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
		</dialog>
	);
}
