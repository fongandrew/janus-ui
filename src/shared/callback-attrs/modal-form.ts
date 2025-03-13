import { VALID_SUBMIT_EVENT } from '~/shared/callback-attrs/form';
import { closeModal, createRequestCloseCallback, openModal } from '~/shared/callback-attrs/modal';
import { getValidatableElements, touched } from '~/shared/callback-attrs/validation';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createAfterHideCallback } from '~/shared/utility/callback-attrs/visibility';
import { elmDoc } from '~/shared/utility/multi-view';

export const modalFormCloseOnSuccess = createHandler(
	VALID_SUBMIT_EVENT,
	'modal-form__close-on-success',
	(e) => {
		const dialog = e.currentTarget.closest(':modal') as HTMLDialogElement | null;
		if (!dialog) return;
		closeModal(dialog);
	},
);

export const modalFormResetOnClose = createAfterHideCallback(
	'modal-form__reset-on-close',
	(elm) => {
		const form = elm as HTMLFormElement;
		form.reset();
	},
);

export const modalFormMaybeShowSpeedBump = createRequestCloseCallback<[string]>(
	'modal-form__maybe_show_speed_bump',
	(e, speedBumpId) => {
		const dialog = e.currentTarget.closest(':modal') as HTMLDialogElement | null;
		if (!dialog) return;

		const speedBump = elmDoc(dialog)?.getElementById(speedBumpId) as HTMLDialogElement | null;
		if (!speedBump) return;

		for (const element of getValidatableElements(dialog)) {
			if (touched(element)) {
				openModal(speedBump);
				return false;
			}
		}
	},
);
