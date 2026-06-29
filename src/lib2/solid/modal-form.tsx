/**
 * `ModalForm` / `ModalSpeedBump` (§13.6). The three modal-form behaviors
 * (`t-reset-on-close`, `t-close-on-success`, and the speed-bump pattern) compose
 * into one wrapper. Defaults are all-on, individually opt-outable. Wiring between
 * the form, modal, and speed bump is entirely DOM-driven (§12.1).
 */
import { type JSX, splitProps } from 'solid-js';

import { Form, type FormProps } from '~/lib2/solid/form';

export interface ModalFormProps extends FormProps {
	closeOnSuccess?: boolean;
	resetOnClose?: boolean;
}

export function ModalForm(props: ModalFormProps) {
	const [local, rest] = splitProps(props, ['closeOnSuccess', 'resetOnClose']);
	/* eslint-disable solid/reactivity -- behavior opt-outs are static config; the data-js token set is fixed at creation. */
	const extras = [
		local.closeOnSuccess !== false && 't-close-on-success',
		local.resetOnClose !== false && 't-reset-on-close',
	]
		.filter(Boolean)
		.join(' ');
	/* eslint-enable solid/reactivity */
	return <Form {...rest} data-js={extras} />;
}

export interface ModalSpeedBumpProps {
	message?: JSX.Element;
	keepLabel?: JSX.Element;
	discardLabel?: JSX.Element;
}

/** The "are you sure?" prompt; the parent modal auto-discovers it via DOM. */
export function ModalSpeedBump(props: ModalSpeedBumpProps) {
	return (
		<dialog class="c-modal" data-js="c-modal__speed-bump">
			<form method="dialog" class="o-stack">
				<p>{props.message ?? 'You have unsaved changes.'}</p>
				<div class="o-row">
					<button value="cancel" class="c-button">
						{props.keepLabel ?? 'Keep editing'}
					</button>
					<button value="discard" class="c-button v-colors-danger">
						{props.discardLabel ?? 'Discard'}
					</button>
				</div>
			</form>
		</dialog>
	);
}
