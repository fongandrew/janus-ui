/**
 * Modal form (§13.6) — `ModalForm` composes the two modal-form behaviors
 * (`t-close-on-success`, `t-reset-on-close`); `ModalSpeedBump` is a thin
 * wrapper around the nested `<dialog>` that `c-modal__speed-bump` (§12.1)
 * auto-discovers via DOM, entirely independent of `c-modal`'s own code.
 */

import { type JSX, splitProps } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';
import { Form, type FormProps } from '~/lib2/solid/form';

export interface ModalFormProps extends FormProps {
	/** Close the ancestor modal on a successful submit. Default `true`. */
	closeOnSuccess?: boolean | undefined;
	/** Reset the form when the ancestor modal closes. Default `true`. */
	resetOnClose?: boolean | undefined;
}

export function ModalForm(props: ModalFormProps) {
	const [local, rest] = splitProps(props, ['closeOnSuccess', 'resetOnClose']);
	// These are one-time config flags (not meant to toggle reactively after mount).
	/* eslint-disable solid/reactivity */
	const extras = attrs(
		local.closeOnSuccess !== false && 't-close-on-success',
		local.resetOnClose !== false && 't-reset-on-close',
	);
	/* eslint-enable solid/reactivity */
	return <Form {...rest} data-js={extras} />;
}

export interface ModalSpeedBumpProps {
	message?: JSX.Element | undefined;
	keepLabel?: JSX.Element | undefined;
	discardLabel?: JSX.Element | undefined;
}

export function ModalSpeedBump(props: ModalSpeedBumpProps) {
	return (
		<dialog class="c-modal" data-js="c-modal__speed-bump">
			<form method="dialog" class="o-stack">
				<p>{props.message ?? 'You have unsaved changes.'}</p>
				<div class="o-row">
					<button value="cancel" class="c-button" type="submit">
						{props.keepLabel ?? 'Keep editing'}
					</button>
					<button value="discard" class="c-button v-colors-danger" type="submit">
						{props.discardLabel ?? 'Discard'}
					</button>
				</div>
			</form>
		</dialog>
	);
}
