import { VALID_SUBMIT_EVENT } from '~/shared/handlers/form';
import { closeModal, createRequestCloseCallback, openModal } from '~/shared/handlers/modal';
import { getValidatableElements, touched } from '~/shared/handlers/validation';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { data } from '~/shared/utility/magic-strings';

export const modalFormCloseOnSuccess = createHandler(
	VALID_SUBMIT_EVENT,
	'modal-form__close-on-success',
	(e) => {
		const dialog = e.delegateTarget.closest(':modal') as HTMLDialogElement | null;
		if (!dialog) return;
		closeModal(dialog);
	},
);

export const modalFormResetOnClose = createHandler('close', 'modal-form__reset-on-close', (e) => {
	const dialog = e.delegateTarget as HTMLDialogElement;
	dialog.querySelector('form')?.reset();
});

export const modalFormMaybeShowSpeedBump = Object.assign(
	createRequestCloseCallback('modal-form__maybe_show_speed_bump', (e) => {
		const dialog = e.currentTarget;
		const speedBump = dialog.querySelector<HTMLDialogElement>(
			`[${modalFormMaybeShowSpeedBump.SPEED_BUMP_ATTR}]`,
		);
		if (!speedBump) return;

		for (const element of getValidatableElements(dialog)) {
			if (touched(element)) {
				openModal(speedBump);
				return false;
			}
		}
	}),
	{
		SPEED_BUMP_ATTR: data('modal-form__speed_bump'),
	},
);
